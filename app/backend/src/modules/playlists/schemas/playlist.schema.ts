import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Playlist extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Video" }], default: [] })
  videos: Types.ObjectId[];

  @Prop({ default: false })
  is_private: boolean;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
