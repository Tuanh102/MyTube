import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderCode: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: string;

  @Prop({ type: String, ref: "Video", required: true })
  videoId: string;

  @Prop({ default: "PENDING" }) // PENDING, SUCCESS, FAILED
  status: string;

  @Prop()
  amount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
