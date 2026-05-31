import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LiveStreamDocument = LiveStream & Document;

@Schema({ timestamps: true })
export class LiveStream {
  @Prop({ required: true })
  streamerId: string;

  @Prop({ required: true })
  streamerName: string;

  @Prop()
  streamerAvatar: string;

  @Prop({ required: true, enum: ["user", "channel"], default: "user" })
  identityType: string;

  @Prop({ required: true })
  identityId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  viewerCount: number;

  @Prop({ default: 0 })
  earnings: number;

  @Prop({ type: [Object], default: [] })
  pinnedMessages: any[];

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ type: [Object], default: [] })
  reports: any[];
}

export const LiveStreamSchema = SchemaFactory.createForClass(LiveStream);
