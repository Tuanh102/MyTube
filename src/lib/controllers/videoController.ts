import { videoModel } from "../models/video";
import { commentModel } from "../models/comment";

export const videoController = {
  // Controller cho trang chủ
  async getHomePageData(searchQuery: string, categoryId?: number) {
    return await videoModel.getAllVideos({ search: searchQuery, categoryId });
  },

  // Controller cho trang xem video
  async getWatchPageData(id: string, userId?: number) {
    const video = await videoModel.getVideoById(id, userId);
    if (!video) return null;

    const relatedVideos = await videoModel.getRelatedVideos(video.video_id, video.category_id);
    const comments = (await commentModel.getVideoComments(video.video_id, userId)).map(c => ({
      ...c,
      created_at: c.created_at.toString()
    }));
    
    return { video, relatedVideos, comments };
  },

  // Controller cho trang Shorts
  async getShortsData() {
    return await videoModel.getShorts();
  },

  // Controller cho trang video đã thích
  async getLikedVideosData(userId: number) {
    return await videoModel.getLikedVideos(userId);
  },

  // Controller cho trang kênh đã đăng ký
  async getSubscriptionsData(userId: number) {
    const { userModel } = await import("../models/user");
    return await userModel.getFollowedChannels(userId);
  },

  // Controller cho trang video đã lưu (giờ trả về danh sách playlist)
  async getSavedVideosData(userId: number) {
    const { playlistModel } = await import("../models/playlist");
    return await playlistModel.getUserPlaylists(userId);
  }
};


