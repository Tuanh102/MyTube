import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: false })
  actor: User;

  @Prop({ required: true })
  type: string; // new_video, like, comment, reply, subscription, video_deleted, system

  @Prop()
  actor_name: string;

  @Prop()
  actor_avatar: string;

  @Prop()
  video_title: string;

  @Prop()
  video_thumb: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  is_read: boolean;

  @Prop()
  target_id: string;

  @Prop()
  actor_id: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
