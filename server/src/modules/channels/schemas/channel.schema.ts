import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true })
export class Channel {
  @Prop({ required: true })
  channel_name: string;

  @Prop()
  description: string;

  @Prop({ default: '/assets/img/default-channel-avatar.jpg' })
  avatar_url: string;

  @Prop()
  banner_url: string;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  subscribers: User[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
