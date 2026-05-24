import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Video } from '../../videos/schemas/video.schema';
import { User } from '../../users/schemas/user.schema';

export type VideoReportDocument = VideoReport & Document;

@Schema({ timestamps: true })
export class VideoReport {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Video', required: false })
  video: Video;

  @Prop({ required: false })
  videoId: string;

  @Prop({ required: false })
  videoTitle: string;

  @Prop({ required: false })
  videoThumbnail: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reporter: User;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'PENDING' })
  status: string; // PENDING, RESOLVED_DELETED, RESOLVED_DISMISSED

  // Channel report extensions
  @Prop({ required: false })
  channelId: string;

  @Prop({ required: false })
  channelName: string;

  @Prop({ required: false })
  channelAvatar: string;

  @Prop({ default: 'video' })
  type: string; // 'video' | 'channel'
}

export const VideoReportSchema = SchemaFactory.createForClass(VideoReport);
