import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { VideoReport, VideoReportSchema } from './schemas/report.schema';
import { VideosModule } from '../videos/videos.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Video, VideoSchema } from '../videos/schemas/video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoReport.name, schema: VideoReportSchema },
      { name: Video.name, schema: VideoSchema }
    ]),
    VideosModule,
    NotificationsModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule {}
