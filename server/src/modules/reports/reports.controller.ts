import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(
    @Body('videoId') videoId: string,
    @Body('userId') userId: string,
    @Body('reason') reason: string
  ) {
    return this.reportsService.createReport(videoId, userId, reason);
  }

  @Get()
  async getPendingReports() {
    return this.reportsService.getPendingReports();
  }

  @Get('user')
  async getUserReports(@Query('userId') userId: string) {
    return this.reportsService.getUserReports(userId);
  }

  @Post(':id/resolve')
  async resolveReport(
    @Param('id') id: string,
    @Body('action') action: 'DELETE_VIDEO' | 'KEEP_VIDEO'
  ) {
    return this.reportsService.resolveReport(id, action);
  }
}
