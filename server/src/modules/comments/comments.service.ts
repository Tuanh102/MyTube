import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async createComment(createCommentDto: { videoId: string; userId: string; content: string; parentCommentId?: string; channelId?: string }) {
    const { videoId, userId, content, parentCommentId, channelId } = createCommentDto;
    const newComment = new this.commentModel({
      video: new Types.ObjectId(videoId),
      user: new Types.ObjectId(userId),
      content,
      parentComment: parentCommentId ? new Types.ObjectId(parentCommentId) : null,
      channel: channelId ? new Types.ObjectId(channelId) : null,
    });
    return newComment.save();
  }

  async getCommentsByVideo(videoId: string) {
    const comments = await this.commentModel
      .find({ video: new Types.ObjectId(videoId) })
      .populate('user', 'name avatar_url')
      .populate('channel', 'channel_name avatar_url')
      .sort({ createdAt: -1 })
      .exec();

    // Organize into top-level comments and replies
    const topLevelComments = comments.filter((c) => !c.parentComment);
    const replies = comments.filter((c) => c.parentComment);

    return topLevelComments.map((comment) => {
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        replies: replies.filter((r) => r.parentComment?.toString() === comment._id.toString()).map(r => r.toObject()),
      };
    });
  }

  async toggleLike(id: string, userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const comment = await this.commentModel.findById(id);
    if (!comment) return { success: false };

    const isLiked = comment.likes.map(id => id.toString()).includes(userId);

    if (isLiked) {
      await this.commentModel.findByIdAndUpdate(id, { $pull: { likes: userObjId } });
    } else {
      await this.commentModel.findByIdAndUpdate(id, {
        $addToSet: { likes: userObjId },
        $pull: { dislikes: userObjId }
      });
    }

    const updatedComment = await this.commentModel.findById(id);
    return {
      success: true,
      isLiked: updatedComment.likes.map(id => id.toString()).includes(userId),
      isDisliked: updatedComment.dislikes.map(id => id.toString()).includes(userId),
      likesCount: updatedComment.likes.length,
      dislikesCount: updatedComment.dislikes.length
    };
  }

  async toggleDislike(id: string, userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const comment = await this.commentModel.findById(id);
    if (!comment) return { success: false };

    const isDisliked = comment.dislikes.map(id => id.toString()).includes(userId);

    if (isDisliked) {
      await this.commentModel.findByIdAndUpdate(id, { $pull: { dislikes: userObjId } });
    } else {
      await this.commentModel.findByIdAndUpdate(id, {
        $addToSet: { dislikes: userObjId },
        $pull: { likes: userObjId }
      });
    }

    const updatedComment = await this.commentModel.findById(id);
    return {
      success: true,
      isLiked: updatedComment.likes.map(id => id.toString()).includes(userId),
      isDisliked: updatedComment.dislikes.map(id => id.toString()).includes(userId),
      likesCount: updatedComment.likes.length,
      dislikesCount: updatedComment.dislikes.length
    };
  }

  async getStudioComments(userId: string, videoId?: string) {
    const query: any = {};
    if (videoId && videoId !== 'all') {
      query.video = new Types.ObjectId(videoId);
    }

    const comments = await this.commentModel
      .find(query)
      .populate('user', 'name avatar_url')
      .populate('channel', 'channel_name avatar_url')
      .populate('video', 'title thumbnail_url channel')
      .sort({ createdAt: -1 })
      .limit(200);

    // Tổ chức thành cây bình luận (chỉ hỗ trợ 1 cấp độ phản hồi cho đơn giản)
    const topLevelComments = comments.filter(c => !c.parentComment);
    const replies = comments.filter(c => c.parentComment);

    return topLevelComments.map(comment => {
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        replies: replies
          .filter(r => r.parentComment?.toString() === comment._id.toString())
          .map(r => r.toObject())
      };
    });
  }

  async deleteComment(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}
