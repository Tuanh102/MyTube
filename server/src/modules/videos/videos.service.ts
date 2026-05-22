import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async onModuleInit() {
    // Tự động chuyển tất cả các video cũ hoặc đang PENDING sang APPROVED để hiển thị ngay lập tức
    const result = await this.videoModel.updateMany(
      { 
        $or: [
          { status: { $exists: false } },
          { status: 'PENDING' }
        ]
      },
      { $set: { status: 'APPROVED' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[System] Đã tự động kích hoạt hiển thị ${result.modifiedCount} video sang trạng thái APPROVED.`);
    }
  }
  async checkPermission(video: any, userId?: string): Promise<boolean> {
    const isPaid = video.is_free === false && video.price > 0;
    if (!isPaid) return true;
    if (!userId) return false;

    try {
      // 1. Kiểm tra nếu user đã mua video
      const user = await this.userModel.findById(userId).exec();
      if (user && user.purchased_videos && user.purchased_videos.some(id => id.toString() === video._id.toString())) {
        return true;
      }

      // 2. Kiểm tra nếu user là chủ sở hữu kênh của video
      const channelId = video.channel?._id || video.channel;
      if (channelId) {
        const channel = await this.videoModel.db.model('Channel').findById(channelId).exec();
        if (channel && channel.user?.toString() === userId) {
          return true;
        }
      }
    } catch (err) {
      console.error('[checkPermission ERROR]:', err);
    }

    return false;
  }

  async redactVideoUrl(video: any, userId?: string): Promise<any> {
    if (!video) return null;
    const videoObj = video.toObject ? video.toObject() : video;
    const hasPermission = await this.checkPermission(videoObj, userId);
    if (!hasPermission) {
      videoObj.video_url = '';
    }
    return videoObj;
  }

  async getHomeVideos(search?: string, userId?: string, categoryId?: string) {
    const query: any = { status: 'APPROVED' };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (categoryId) {
      query.category_id = categoryId;
    }
    
    const videos = await this.videoModel
      .find(query)
      .populate('channel')
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    return Promise.all(videos.map(video => this.redactVideoUrl(video, userId)));
  }

  async getShorts(userId?: string) {
    const videos = await this.videoModel
      .find({ is_short: true, status: 'APPROVED' })
      .populate('channel')
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();

    return Promise.all(videos.map(video => this.redactVideoUrl(video, userId)));
  }

  async getVideoDetails(id: string, userId?: string) {
    const video = await this.videoModel.findById(id).populate('channel').exec();
    if (!video) return null;

    // Get related videos (excluding this one)
    const relatedVideos = await this.videoModel
      .find({ _id: { $ne: id }, status: 'APPROVED' })
      .populate('channel')
      .limit(10)
      .exec();

    const redactedVideo = await this.redactVideoUrl(video, userId);
    const redactedRelated = await Promise.all(
      relatedVideos.map(v => this.redactVideoUrl(v, userId))
    );

    return {
      video: redactedVideo,
      relatedVideos: redactedRelated,
      comments: [] // Mongoose comments to be implemented later
    };
  }

  async create(createVideoDto: any) {
    // Tự động xác định trạng thái Short dựa trên thời lượng video (<= 90 giây)
    const is_short = createVideoDto.duration ? Number(createVideoDto.duration) <= 90 : false;
    const newVideo = new this.videoModel({
      ...createVideoDto,
      is_short,
      status: 'APPROVED', // Kích hoạt hiển thị ngay lập tức lên trang chủ khi đăng video mới
    });
    return newVideo.save();
  }

  // --- HÀM DÀNH CHO STAFF ---
  async getPendingVideos() {
    return this.videoModel
      .find({ status: 'PENDING' })
      .populate('channel')
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveVideo(id: string) {
    return this.videoModel.findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true });
  }

  async rejectVideo(id: string) {
    return this.videoModel.findByIdAndUpdate(id, { status: 'REJECTED' }, { new: true });
  }

  async getStudioVideos(channelId?: string, search?: string, userId?: string) {
    const query: any = {};
    if (channelId) {
      const ids = channelId.split(',');
      query.channel = { $in: ids };
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const videos = await this.videoModel
      .find(query)
      .populate('channel')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(videos.map(video => this.redactVideoUrl(video, userId)));
  }

  async update(id: string, updateData: any) {
    // Tự động tính toán lại nếu thời lượng của video thay đổi
    if (updateData.duration !== undefined) {
      updateData.is_short = Number(updateData.duration) <= 90;
    }
    return this.videoModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string) {
    const video = await this.videoModel.findById(id).exec();
    if (video) {
      if (video.video_public_id || video.thumbnail_public_id) {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          if (video.video_public_id) {
            await cloudinary.uploader.destroy(video.video_public_id, { resource_type: 'video' });
          }
          if (video.thumbnail_public_id) {
            await cloudinary.uploader.destroy(video.thumbnail_public_id);
          }
          console.log(`Cloudinary resources deleted for video ${id}`);
        } catch (err) {
          console.error(`Error deleting Cloudinary assets for video ${id}:`, err);
        }
      }
    }
    return this.videoModel.findByIdAndDelete(id).exec();
  }

  async getStudioOverview(userId: string, channelId?: string) {
    // 1. Get relevant channels
    let channelsQuery: any = { user: userId };
    if (channelId && channelId !== 'all') {
      channelsQuery = { _id: channelId };
    }
    
    const userChannels = await this.videoModel.db.model('Channel').find(channelsQuery).exec();
    const channelIds = userChannels.map(c => c._id);

    if (channelIds.length === 0) {
      return {
        summary: { totalViews: 0, totalSubscribers: 0, totalVideos: 0, totalInteractions: 0 },
        topVideos: [],
        topChannel: null
      };
    }

    // 2. Get videos stats
    const videos = await this.videoModel.find({ channel: { $in: channelIds } }).exec();
    const totalViews = videos.reduce((acc, v) => acc + (v.view_count || 0), 0);
    const totalVideos = videos.length;
    
    // Subscribers (simple sum for now)
    const totalSubscribers = userChannels.reduce((acc, c) => acc + (c.sub_count || 0), 0);

    // Top videos
    const topVideos = await this.videoModel
      .find({ channel: { $in: channelIds } })
      .sort({ view_count: -1 })
      .limit(5)
      .exec();

    // Top channel
    const topChannel = userChannels.sort((a, b) => (b.sub_count || 0) - (a.sub_count || 0))[0];

    // 3. Get User Balance
    const user = await this.userModel.findById(userId).exec();

    return {
      summary: {
        totalViews,
        totalSubscribers,
        totalVideos,
        totalInteractions: totalViews + totalSubscribers,
        balance: user?.balance || 0
      },
      topVideos,
      topChannel
    };
  }
  async toggleLike(id: string, userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const video = await this.videoModel.findById(id);
    if (!video) return { success: false };

    const isLiked = video.likes.map(id => id.toString()).includes(userId);

    if (isLiked) {
      // Unlike
      await this.videoModel.findByIdAndUpdate(id, {
        $pull: { likes: userObjId }
      });
    } else {
      // Like
      await this.videoModel.findByIdAndUpdate(id, {
        $addToSet: { likes: userObjId },
        $pull: { dislikes: userObjId }
      });
    }

    const updatedVideo = await this.videoModel.findById(id);
    return {
      success: true,
      isLiked: updatedVideo.likes.map(id => id.toString()).includes(userId),
      isDisliked: updatedVideo.dislikes.map(id => id.toString()).includes(userId),
      likesCount: updatedVideo.likes.length,
      dislikesCount: updatedVideo.dislikes.length
    };
  }

  async toggleDislike(id: string, userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const video = await this.videoModel.findById(id);
    if (!video) return { success: false };

    const isDisliked = video.dislikes.map(id => id.toString()).includes(userId);

    if (isDisliked) {
      // Un-dislike
      await this.videoModel.findByIdAndUpdate(id, {
        $pull: { dislikes: userObjId }
      });
    } else {
      // Dislike
      await this.videoModel.findByIdAndUpdate(id, {
        $addToSet: { dislikes: userObjId },
        $pull: { likes: userObjId }
      });
    }

    const updatedVideo = await this.videoModel.findById(id);
    return {
      success: true,
      isLiked: updatedVideo.likes.map(id => id.toString()).includes(userId),
      isDisliked: updatedVideo.dislikes.map(id => id.toString()).includes(userId),
      likesCount: updatedVideo.likes.length,
      dislikesCount: updatedVideo.dislikes.length
    };
  }

  async getLikedVideos(userId: string) {
    try {
        const userObjId = new Types.ObjectId(userId);
        const videos = await this.videoModel.find({ 
          $or: [
            { likes: userId },
            { likes: userObjId }
          ]
        }).populate('channel').exec();
        
        return Promise.all(videos.map(video => this.redactVideoUrl(video, userId)));
    } catch (error: any) {
        return { error: error.message, stack: error.stack };
    }
  }

  async incrementViewCount(id: string) {
    return this.videoModel.findByIdAndUpdate(
      id,
      { $inc: { view_count: 1 } },
      { new: true }
    );
  }
}
