import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ unique: true, sparse: true })
  phone: string;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ default: "/assets/img/default-avatar.png" })
  avatar: string;

  @Prop({ default: "viewer" })
  role: string;

  @Prop({ unique: true, sparse: true })
  google_id?: string;

  @Prop({ unique: true, sparse: true })
  facebook_id?: string;

  @Prop({ unique: true, sparse: true })
  github_id?: string;

  @Prop({ unique: true, sparse: true })
  discord_id?: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Video" }],
    default: [],
  })
  history: string[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Video" }],
    default: [],
  })
  purchased_videos: string[];

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  adBalance: number;

  @Prop({ default: false })
  is_premium: boolean;

  @Prop()
  premium_type?: string;

  @Prop()
  premium_purchased_at?: Date;

  @Prop()
  premium_expires_at?: Date;

  @Prop({ default: true })
  premium_show_avatar_aura?: boolean;

  @Prop({ default: true })
  premium_show_comment_aura?: boolean;

  @Prop({ default: "ACTIVE" })
  status: string; // ACTIVE, LOCKED, DELETED

  @Prop({ default: Date.now })
  lastActive: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
