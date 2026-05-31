import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Playlist } from "./schemas/playlist.schema";
import { Video } from "../videos/schemas/video.schema";

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    @InjectModel(Video.name) private videoModel: Model<Video>,
  ) {}

  async getUserPlaylists(userId: string, videoId?: string) {
    const playlists = await this.playlistModel
      .find({ user: new Types.ObjectId(userId) })
      .exec();

    // Manual resolution to avoid population issues with string IDs
    const result = [];
    for (const pl of playlists) {
      let cover_thumbnail = null;
      const videoCount = pl.videos?.length || 0;

      if (videoCount > 0) {
        const firstVideoId = pl.videos[0].toString();
        const firstVideo = await this.videoModel.findById(firstVideoId).exec();
        if (firstVideo) {
          cover_thumbnail = firstVideo.thumbnail_url;
        }
      }

      result.push({
        playlist_id: pl._id,
        playlist_name: pl.name,
        is_private: pl.is_private,
        video_count: videoCount,
        cover_thumbnail,
        has_video: videoId
          ? pl.videos.some((v) => v.toString() === videoId)
            ? 1
            : 0
          : 0,
      });
    }
    return result;
  }

  async create(name: string, userId: string) {
    const playlist = new this.playlistModel({
      name,
      user: new Types.ObjectId(userId),
      videos: [],
    });
    return playlist.save();
  }

  async toggleVideo(playlistId: string, videoId: string) {
    const playlist = await this.playlistModel.findById(playlistId);
    if (!playlist) return { success: false };

    const index = playlist.videos.findIndex((v) => v.toString() === videoId);

    let isIn = false;
    if (index > -1) {
      playlist.videos.splice(index, 1);
      isIn = false;
    } else {
      playlist.videos.push(new Types.ObjectId(videoId));
      isIn = true;
    }

    await playlist.save();
    return { success: true, isIn };
  }

  async getPlaylistVideos(playlistId: string) {
    const playlist = await this.playlistModel.findById(playlistId).exec();
    if (!playlist || !playlist.videos || playlist.videos.length === 0)
      return [];

    // Map strings/ObjectIds to strictly ObjectIds for $in query
    const videoIds = playlist.videos.map((v) => {
      try {
        return new Types.ObjectId(v.toString());
      } catch (e) {
        return v;
      }
    });

    return this.videoModel
      .find({ _id: { $in: videoIds } })
      .populate("channel")
      .exec();
  }
}
