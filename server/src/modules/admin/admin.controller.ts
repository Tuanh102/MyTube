import { Controller, Post, Get, Body, Param, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VideosService } from '../videos/videos.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly videosService: VideosService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Post('request-otp')
  async requestOtp(@Body() body: { phone: string }) {
    return this.adminService.requestOtp(body.phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; otp: string; role: 'ADMIN' | 'STAFF' }) {
    const { phone, otp, role } = body;
    if (!phone || !otp || !role) {
      throw new UnauthorizedException('Thiếu thông tin đăng nhập');
    }
    return this.adminService.verifyOtp(phone, otp, role);
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

  // --- API QUẢN LÝ RÚT TIỀN ---
  @Get('withdrawals')
  async getWithdrawals() {
    return this.paymentsService.getAllWithdrawals();
  }

  @Get('withdrawals/:id')
  async getWithdrawalById(@Param('id') id: string) {
    return this.paymentsService.getWithdrawalById(id);
  }

  @Post('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string, @Body() body: { method?: string }) {
    return this.paymentsService.approveWithdrawal(id, body?.method);
  }

  @Post('withdrawals/:id/reject')
  async rejectWithdrawal(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.paymentsService.rejectWithdrawal(id, body?.reason);
  }
}
