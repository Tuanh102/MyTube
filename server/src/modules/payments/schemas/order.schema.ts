import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderCode: number;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  videoId: string;

  @Prop({ default: 'PENDING' }) // PENDING, SUCCESS, FAILED
  status: string;

  @Prop()
  amount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
