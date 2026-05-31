import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "ad_settings", timestamps: true })
export class AdSetting extends Document {
  @Prop({ required: true, default: true })
  globalAdEnabled: boolean;
}

export const AdSettingSchema = SchemaFactory.createForClass(AdSetting);
export type AdSettingDocument = AdSetting & Document;
