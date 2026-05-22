import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoReport, VideoReportDocument } from './schemas/report.schema';
import { Video, VideoDocument } from '../videos/schemas/video.schema';
import { VideosService } from '../videos/videos.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(VideoReport.name) private reportModel: Model<VideoReportDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private readonly videosService: VideosService,
    private readonly notificationsService: NotificationsService
  ) {}

  async createReport(videoId: string, reporterId: string, reason: string) {
    const video = await this.videoModel.findById(videoId).exec();
    if (!video) {
      throw new NotFoundException('Video không tồn tại');
    }

    const newReport = new this.reportModel({
      video: videoId,
      videoId,
      videoTitle: video.title,
      videoThumbnail: video.thumbnail_url,
      reporter: reporterId,
      reason,
      status: 'PENDING'
    });

    return newReport.save();
  }

  async getPendingReports() {
    return this.reportModel
      .find({ status: 'PENDING' })
      .populate('reporter', 'name avatar_url email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserReports(userId: string) {
    return this.reportModel
      .find({ reporter: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async resolveReport(reportId: string, action: 'DELETE_VIDEO' | 'KEEP_VIDEO') {
    const report = await this.reportModel.findById(reportId).exec();
    if (!report) {
      throw new NotFoundException('Báo cáo không tồn tại');
    }

    if (action === 'DELETE_VIDEO') {
      // 1. Fetch video with populated channel to get the owner/creator
      const video = await this.videoModel.findById(report.videoId).populate('channel').exec();
      
      if (video) {
        const creatorId = video.channel?.user?.toString();
        if (creatorId) {
          // 2. Create notification for creator
          await this.notificationsService.createNotification({
            user: creatorId as any,
            type: 'video_deleted',
            actor_name: 'Hệ thống',
            actor_avatar: '/assets/img/logo-admin.jpg', // Admin system avatar
            video_title: video.title,
            video_thumb: video.thumbnail_url,
            message: `Video "${video.title}" của bạn đã bị xóa bởi nhân viên kiểm duyệt do lý do: ${report.reason}.`,
            target_id: '',
            is_read: false
          });
        }

        // 3. Delete the video from DB and Cloudinary using VideosService
        await this.videosService.delete(video._id.toString());
      }

      // 4. Mark all reports for this videoId as RESOLVED_DELETED
      await this.reportModel.updateMany(
        { videoId: report.videoId },
        { status: 'RESOLVED_DELETED' }
      ).exec();

    } else if (action === 'KEEP_VIDEO') {
      // Mark this specific report as RESOLVED_DISMISSED
      report.status = 'RESOLVED_DISMISSED';
      await report.save();
    }

    return { success: true };
  }
}
