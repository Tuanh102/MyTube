import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Video } from '../../videos/schemas/video.schema';
import { User } from '../../users/schemas/user.schema';

export type VideoReportDocument = VideoReport & Document;

@Schema({ timestamps: true })
export class VideoReport {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Video', required: false })
  video: Video;

  @Prop({ required: true })
  videoId: string;

  @Prop({ required: true })
  videoTitle: string;

  @Prop({ required: true })
  videoThumbnail: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reporter: User;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'PENDING' })
  status: string; // PENDING, RESOLVED_DELETED, RESOLVED_DISMISSED
}

export const VideoReportSchema = SchemaFactory.createForClass(VideoReport);
