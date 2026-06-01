import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type FingerprintDocument = Fingerprint & Document;

@Schema({ timestamps: true })
export class Fingerprint {
  @Prop({ required: true, unique: true, index: true })
  fingerprint: string;

  @Prop()
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Video" })
  video: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel" })
  channel: string;
}

export const FingerprintSchema = SchemaFactory.createForClass(Fingerprint);
