import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { VideoReport, VideoReportDocument } from "./schemas/report.schema";
import { Video, VideoDocument } from "../videos/schemas/video.schema";
import { VideosService } from "../videos/videos.service";
import { NotificationsService } from "../notifications/notifications.service";
import { Channel, ChannelDocument } from "../channels/schemas/channel.schema";

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(VideoReport.name)
    private reportModel: Model<VideoReportDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    private readonly videosService: VideosService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createChannelReport(
    channelId: string,
    reporterId: string,
    reason: string,
  ) {
    const channel = await this.channelModel.findById(channelId).exec();
    if (!channel) {
      throw new NotFoundException("Kênh không tồn tại");
    }

    const newReport = new this.reportModel({
      reporter: reporterId,
      reason,
      status: "PENDING",
      type: "channel",
      channelId: channel._id.toString(),
      channelName: channel.channel_name,
      channelAvatar: channel.avatar_url,
    });

    return newReport.save();
  }

  async createReport(videoId: string, reporterId: string, reason: string) {
    const video = await this.videoModel.findById(videoId).exec();
    if (!video) {
      throw new NotFoundException("Video không tồn tại");
    }

    const newReport = new this.reportModel({
      video: videoId,
      videoId,
      videoTitle: video.title,
      videoThumbnail: video.thumbnail_url,
      reporter: reporterId,
      reason,
      status: "PENDING",
    });

    return newReport.save();
  }

  async getPendingReports() {
    return this.reportModel
      .find({ status: "PENDING" })
      .populate("reporter", "username avatar email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserReports(userId: string) {
    return this.reportModel
      .find({ reporter: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async resolveReport(
    reportId: string,
    action: "DELETE_VIDEO" | "KEEP_VIDEO" | "DELETE_CHANNEL" | "KEEP_CHANNEL",
  ) {
    const report = await this.reportModel.findById(reportId).exec();
    if (!report) {
      throw new NotFoundException("Báo cáo không tồn tại");
    }

    if (action === "DELETE_VIDEO") {
      // 1. Fetch video with populated channel to get the owner/creator
      const video = await this.videoModel
        .findById(report.videoId)
        .populate("channel")
        .exec();

      if (video) {
        const creatorId = video.channel?.user?.toString();
        if (creatorId) {
          // 2. Create notification for creator
          await this.notificationsService.createNotification({
            user: creatorId as any,
            type: "video_deleted",
            actor_name: "Hệ thống",
            actor_avatar: "/assets/img/logo-admin.jpg", // Admin system avatar
            video_title: video.title,
            video_thumb: video.thumbnail_url,
            message: `Video "${video.title}" của bạn đã bị xóa bởi nhân viên kiểm duyệt do lý do: ${report.reason}.`,
            target_id: "",
            is_read: false,
          });
        }

        // 3. Delete the video from DB and Cloudinary using VideosService
        await this.videosService.delete(video._id.toString());
      }

      // 4. Mark all reports for this videoId as RESOLVED_DELETED
      await this.reportModel
        .updateMany({ videoId: report.videoId }, { status: "RESOLVED_DELETED" })
        .exec();
    } else if (action === "KEEP_VIDEO" || action === "KEEP_CHANNEL") {
      // Mark this specific report as RESOLVED_DISMISSED
      report.status = "RESOLVED_DISMISSED";
      await report.save();
    } else if (action === "DELETE_CHANNEL") {
      // 1. Find the channel
      const channel = await this.channelModel.findById(report.channelId).exec();

      if (channel) {
        const creatorId = channel.user?.toString();
        if (creatorId) {
          // 2. Notify the channel creator
          await this.notificationsService.createNotification({
            user: creatorId as any,
            type: "video_deleted",
            actor_name: "Hệ thống",
            actor_avatar: "/assets/img/logo-admin.jpg",
            video_title: channel.channel_name,
            video_thumb: channel.avatar_url || "/assets/img/avata.jpg",
            message: `Kênh "${channel.channel_name}" của bạn đã bị xóa bởi nhân viên kiểm duyệt do lý do: ${report.reason}.`,
            target_id: "",
            is_read: false,
          });
        }

        // 3. Find and delete all videos belonging to this channel
        const videos = await this.videoModel
          .find({ channel: channel._id })
          .exec();
        for (const video of videos) {
          try {
            await this.videosService.delete(video._id.toString());
          } catch (err) {
            console.error(`Lỗi xóa video ${video._id} khi xóa kênh:`, err);
          }
        }

        // 4. Delete the channel from DB
        await this.channelModel.findByIdAndDelete(channel._id).exec();
      }

      // 5. Mark all reports for this channelId as RESOLVED_DELETED
      await this.reportModel
        .updateMany(
          { channelId: report.channelId },
          { status: "RESOLVED_DELETED" },
        )
        .exec();
    }

    return { success: true };
  }
}
