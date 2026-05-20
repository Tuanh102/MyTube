import { Controller, Post, Get, Body, Param, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VideosService } from '../videos/videos.service';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly videosService: VideosService
  ) {}

  @Post('google-login')
  async googleLogin(@Body() body: any) {
    console.log('Admin Login Request received for email:', body?.email);
    return this.adminService.googleLogin(body);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('transactions')
  async getTransactions() {
    return this.adminService.getAllTransactions();
  }

  // --- API KIỂM DUYỆT VIDEO ---
  @Get('pending-videos')
  async getPendingVideos() {
    return this.videosService.getPendingVideos();
  }

  @Post('approve-video/:id')
  async approveVideo(@Param('id') id: string) {
    return this.videosService.approveVideo(id);
  }

  @Post('reject-video/:id')
  async rejectVideo(@Param('id') id: string) {
    return this.videosService.rejectVideo(id);
  }
}
