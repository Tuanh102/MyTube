import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PremiumPackageDocument = PremiumPackage & Document;

@Schema({ collection: "premiumpackages", timestamps: true })
export class PremiumPackage {
  @Prop({ required: true, unique: true })
  key: string; // e.g. "PREMIUM_MONTH", "PREMIUM_HALF_YEAR", "PREMIUM_YEAR"

  @Prop({ required: true })
  name: string; // e.g. "Gói 1 tháng", "Gói 6 tháng", "Gói 12 tháng"

  @Prop({ required: true })
  price: number; // in VNĐ or coins

  @Prop({ required: true })
  durationDays: number; // e.g. 30, 180, 360

  @Prop({ default: "" })
  description: string;
}

export const PremiumPackageSchema = SchemaFactory.createForClass(PremiumPackage);
