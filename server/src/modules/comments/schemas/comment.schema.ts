import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Video } from '../../videos/schemas/video.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video: Video | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Channel', default: null })
  channel: any;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentComment: Comment | Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  dislikes: Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
