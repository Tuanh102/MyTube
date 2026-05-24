import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LiveMessageDocument = LiveMessage & Document;

@Schema({ timestamps: true })
export class LiveMessage {
  @Prop({ required: true })
  streamId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop()
  senderAvatar: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ['chat', 'donation'], default: 'chat' })
  type: string;

  @Prop({ default: 0 })
  donationAmount: number;
}

export const LiveMessageSchema = SchemaFactory.createForClass(LiveMessage);
