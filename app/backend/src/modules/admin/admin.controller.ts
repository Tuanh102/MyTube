import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { VideosService } from "../videos/videos.service";
import { PaymentsService } from "../payments/payments.service";

@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly videosService: VideosService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get("smart-search")
  async smartSearch(@Query("q") query: string, @Query("role") role?: string) {
    return this.adminService.smartSearch(query, role);
  }

  @Post("request-otp")
  async requestOtp(@Body() body: { phone: string }) {
    return this.adminService.requestOtp(body.phone);
  }

  @Post("verify-otp")
  async verifyOtp(
    @Body() body: { phone: string; otp: string; role: "ADMIN" | "STAFF" },
  ) {
    const { phone, otp, role } = body;
    if (!phone || !otp || !role) {
      throw new UnauthorizedException("Thiếu thông tin đăng nhập");
    }
    return this.adminService.verifyOtp(phone, otp, role);
  }

  @Get("stats")
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("transactions")
  async getTransactions() {
    return this.adminService.getAllTransactions();
  }

  // --- API KIỂM DUYỆT VIDEO ---
  @Get("pending-videos")
  async getPendingVideos() {
    return this.videosService.getPendingVideos();
  }

  @Post("approve-video/:id")
  async approveVideo(@Param("id") id: string) {
    return this.videosService.approveVideo(id);
  }

  @Post("reject-video/:id")
  async rejectVideo(@Param("id") id: string) {
    return this.videosService.rejectVideo(id);
  }

  // --- API QUẢN LÝ RÚT TIỀN ---
  @Get("withdrawals")
  async getWithdrawals() {
    return this.paymentsService.getAllWithdrawals();
  }

  @Get("withdrawals/:id")
  async getWithdrawalById(@Param("id") id: string) {
    return this.paymentsService.getWithdrawalById(id);
  }

  @Post("withdrawals/:id/approve")
  async approveWithdrawal(
    @Param("id") id: string,
    @Body() body: { method?: string },
  ) {
    return this.paymentsService.approveWithdrawal(id, body?.method);
  }

  @Post("withdrawals/:id/reject")
  async rejectWithdrawal(
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    return this.paymentsService.rejectWithdrawal(id, body?.reason);
  }

  // --- API QUẢN LÝ NGƯỜI DÙNG & HỆ THỐNG ---
  @Get("users")
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get("system-status")
  async getSystemStatus() {
    return this.adminService.getSystemStatus();
  }

  @Get("backup")
  async getBackup() {
    return this.adminService.getBackupData();
  }

  @Post("restore")
  async restoreBackup(@Body() body: any) {
    return this.adminService.restoreBackupData(body);
  }

  @Get("videos")
  async getAllVideos() {
    return this.adminService.getAllVideos();
  }

  @Delete("videos/:id")
  async deleteVideo(@Param("id") id: string) {
    return this.adminService.deleteVideo(id);
  }

  @Get("staff")
  async getAllStaff() {
    return this.adminService.getAllStaff();
  }

  @Get("premium-packages")
  async getPremiumPackages() {
    return this.paymentsService.getPremiumPackages();
  }

  @Put("premium-packages/:key")
  async updatePremiumPackage(
    @Param("key") key: string,
    @Body() body: { name: string; price: number; durationDays: number; description?: string },
  ) {
    return this.paymentsService.updatePremiumPackage(key, body);
  }

  // --- API QUẢN LÝ THÀNH VIÊN ---
  @Post("users/:id/lock")
  async lockUser(@Param("id") id: string) {
    return this.adminService.lockUser(id);
  }

  @Post("users/:id/unlock")
  async unlockUser(@Param("id") id: string) {
    return this.adminService.unlockUser(id);
  }

  @Post("users/:id/delete")
  async deleteUser(@Param("id") id: string) {
    return this.adminService.deleteUser(id);
  }

  // --- API QUẢN LÝ GÓI HỘI VIÊN BỔ SUNG ---
  @Post("premium-packages")
  async createPremiumPackage(
    @Body() body: { key: string; name: string; price: number; durationDays: number; description?: string },
  ) {
    return this.paymentsService.createPremiumPackage(body);
  }

  @Delete("premium-packages/:key")
  async deletePremiumPackage(@Param("key") key: string) {
    return this.paymentsService.deletePremiumPackage(key);
  }
}
