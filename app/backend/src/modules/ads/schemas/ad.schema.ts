import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "advertisements", timestamps: true })
export class Advertisement extends Document {
  @Prop({ required: true, unique: true })
  slotId: string; // Vị trí quảng cáo ('homepage_main_1', 'homepage_main_2', 'homepage_sub_1', etc.)

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ required: true })
  linkUrl: string;

  @Prop({ default: "Tài trợ" })
  badgeText: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isMuted: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: "CPD" })
  pricingModel: string; // 'CPC' | 'CPM' | 'CPD'

  @Prop({ default: 0 })
  pricePerUnit: number; // Cost in VNĐ per unit

  @Prop({ default: 0 })
  totalBudget: number; // Total campaign budget

  @Prop({ default: 0 })
  spent: number; // Total spent by advertiser

  @Prop({ default: "" })
  advertiserId: string; // User ID who created/owns this ad

  @Prop({ default: "" })
  advertiserName: string;

  @Prop({ default: "" })
  bankTransactionRef: string; // Transaction reference code

  @Prop({ default: "PENDING_PAYMENT" })
  paymentStatus: string; // 'PENDING_PAYMENT' | 'APPROVED' | 'REJECTED'

  @Prop({ default: "DRAFT" })
  status: string; // 'DRAFT' | 'PENDING_PAYMENT' | 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'PAUSED_BUDGET_EXHAUSTED' | 'PAUSED_BY_USER' | 'ARCHIVED'

  @Prop({ default: "" })
  rejectReason: string;

  @Prop()
  approvedAt?: Date;

  @Prop()
  lastActiveStartAt?: Date;
}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);
export type AdvertisementDocument = Advertisement & Document;
