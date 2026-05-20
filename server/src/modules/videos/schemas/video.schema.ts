import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Channel } from '../../channels/schemas/channel.schema';
// import { Category } from '../../categories/schemas/category.schema';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  video_url: string;

  @Prop()
  video_public_id: string;

  @Prop({ required: true })
  thumbnail_url: string;

  @Prop()
  thumbnail_public_id: string;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: 0 })
  view_count: number;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  likes: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  dislikes: string[];

  @Prop({ default: '12' })
  category_id: string;

  @Prop({ default: false })
  is_short: boolean;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: true })
  is_free: boolean;

  @Prop({ default: 'APPROVED' })
  status: string; // PENDING, APPROVED, REJECTED

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Channel', required: true })
  channel: Channel;

  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  // category: Category;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
VideoSchema.index({ title: 'text', description: 'text' });
