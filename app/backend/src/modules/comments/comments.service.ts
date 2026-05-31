import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment, CommentDocument } from "./schemas/comment.schema";
import { User, UserDocument } from "../users/schemas/user.schema";
import { Video, VideoDocument } from "../videos/schemas/video.schema";

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async createComment(createCommentDto: {
    videoId: string;
    userId: string;
    content: string;
    rating?: number;
    parentCommentId?: string;
    channelId?: string;
  }) {
    const { videoId, userId, content, rating, parentCommentId, channelId } =
      createCommentDto;

    // Fetch the video to verify if it is paid and check purchase permissions
    const video = await this.videoModel
      .findById(videoId)
      .populate("channel")
      .exec();
    if (!video) {
      throw new NotFoundException("Không tìm thấy video");
    }

    const isPaid = video.is_free === false || (video.price && video.price > 0);
    if (isPaid) {
      // Creator/owner of the video is always allowed to comment
      const isOwner =
        video.channel &&
        video.channel.user &&
        video.channel.user.toString() === userId.toString();
      if (!isOwner) {
        // Check if the user has purchased the video
        const user = await this.userModel.findById(userId).exec();
        const purchasedVideos = user?.purchased_videos || [];
        const isPurchased = purchasedVideos.some(
          (id: any) => id.toString() === videoId.toString(),
        );
        if (!isPurchased) {
          throw new BadRequestException(
            "Bạn cần mua video này để có thể bình luận và đánh giá",
          );
        }
      }
    }

    const newComment = new this.commentModel({
      video: new Types.ObjectId(videoId),
      user: new Types.ObjectId(userId),
      content,
      rating: rating || 0,
      parentComment: parentCommentId
        ? new Types.ObjectId(parentCommentId)
        : null,
      channel: channelId ? new Types.ObjectId(channelId) : null,
    });
    return newComment.save();
  }

  async getCommentsByVideo(videoId: string) {
    const comments = await this.commentModel
      .find({ video: new Types.ObjectId(videoId) })
      .populate(
        "user",
        "username avatar is_premium premium_show_avatar_aura premium_show_comment_aura",
      )
      .populate("channel", "channel_name avatar_url")
      .sort({ createdAt: -1 })
      .exec();

    // Organize into top-level comments and replies
    const topLevelComments = comments.filter((c) => !c.parentComment);
    const replies = comments.filter((c) => c.parentComment);

    return topLevelComments.map((comment) => {
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        replies: replies
          .filter((r) => r.parentComment?.toString() === comment._id.toString())
          .map((r) => r.toObject()),
      };
    });
  }

  async toggleLike(id: string, userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const comment = await this.commentModel.findById(id);
    if (!comment) return { success: false };

    const isLiked = comment.likes.map((id) => id.toString()).includes(userId);

    if (isLiked) {
      await this.commentModel.findByIdAndUpdate(id, {
        $pull: { likes: userObjId },
      });
    } else {
      await this.commentModel.findByIdAndUpdate(id, {
        $addToSet: { likes: userObjId },
        $pull: { dislikes: userObjId },
      });
    }

    const updatedComment = await this.commentModel.findById(id);
    return {
      success: true,
      isLiked: updatedComment.likes.map((id) => id.toString()).includes(userId),
      isDisliked: updatedComment.dislikes
        .map((id) => id.toString())
        .includes(userId),
      likesCount: updatedComment.likes.length,
      dislikesCount: updatedComment.dislikes.length,
    };
  }

  async toggleDislike(id: string, userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const comment = await this.commentModel.findById(id);
    if (!comment) return { success: false };

    const isDisliked = comment.dislikes
      .map((id) => id.toString())
      .includes(userId);

    if (isDisliked) {
      await this.commentModel.findByIdAndUpdate(id, {
        $pull: { dislikes: userObjId },
      });
    } else {
      await this.commentModel.findByIdAndUpdate(id, {
        $addToSet: { dislikes: userObjId },
        $pull: { likes: userObjId },
      });
    }

    const updatedComment = await this.commentModel.findById(id);
    return {
      success: true,
      isLiked: updatedComment.likes.map((id) => id.toString()).includes(userId),
      isDisliked: updatedComment.dislikes
        .map((id) => id.toString())
        .includes(userId),
      likesCount: updatedComment.likes.length,
      dislikesCount: updatedComment.dislikes.length,
    };
  }

  async getStudioComments(userId: string, videoId?: string) {
    const query: any = {};
    if (videoId && videoId !== "all") {
      query.video = new Types.ObjectId(videoId);
    }

    const comments = await this.commentModel
      .find(query)
      .populate(
        "user",
        "username avatar is_premium premium_show_avatar_aura premium_show_comment_aura",
      )
      .populate("channel", "channel_name avatar_url")
      .populate({
        path: "video",
        select: "title thumbnail_url channel",
        populate: {
          path: "channel",
          select: "channel_name avatar_url is_verified"
        }
      })
      .sort({ createdAt: -1 })
      .limit(200);

    // Tổ chức thành cây bình luận (chỉ hỗ trợ 1 cấp độ phản hồi cho đơn giản)
    const topLevelComments = comments.filter((c) => !c.parentComment);
    const replies = comments.filter((c) => c.parentComment);

    return topLevelComments.map((comment) => {
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        replies: replies
          .filter((r) => r.parentComment?.toString() === comment._id.toString())
          .map((r) => r.toObject()),
      };
    });
  }

  async deleteComment(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}
