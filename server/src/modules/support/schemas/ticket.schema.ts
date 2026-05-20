import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema()
class SupportMessage {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  senderRole: string; // 'USER' hoặc 'STAFF'

  @Prop({ required: true })
  message: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

const SupportMessageSchema = SchemaFactory.createForClass(SupportMessage);

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: [SupportMessageSchema], default: [] })
  messages: SupportMessage[];

  @Prop({ default: 'OPEN' }) // OPEN, CLOSED
  status: string;

  @Prop({ default: false })
  isReadByUser: boolean;

  @Prop({ default: true })
  isReadByStaff: boolean;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
