import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number; // Số tiền (dương là nạp/hoàn, âm là trừ/rút)

  @Prop({ required: true })
  type: string; // 'DEPOSIT' | 'SPENT' | 'REFUND' | 'WITHDRAWAL'

  @Prop({ default: "" })
  description: string;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);
