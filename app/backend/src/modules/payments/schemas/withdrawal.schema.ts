import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type WithdrawalDocument = Withdrawal & Document;

@Schema({ timestamps: true })
export class Withdrawal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  bankAccount: string;

  @Prop({ required: true })
  bankAccountHolder: string;

  @Prop({ default: "PENDING" }) // PENDING, SUCCESS, REJECTED
  status: string;

  @Prop({ default: "MANUAL" }) // MANUAL, AUTOMATIC
  method: string;

  @Prop({ default: "CREATOR" }) // CREATOR, ADVERTISER
  type: string;

  @Prop()
  rejectReason?: string;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
