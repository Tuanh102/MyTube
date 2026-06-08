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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
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

  @Post("upload-avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = "./uploads";
          const fs = require("fs");
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadAvatar(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("Không có tệp nào được tải lên");
    }
    return { url: `/uploads/${file.filename}` };
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

  @Post("staff")
  async createStaff(@Body() body: { name: string; email: string; password?: string }) {
    return this.adminService.createStaff(body);
  }

  @Post("staff-login")
  async staffLogin(@Body() body: { email: string; password?: string }) {
    return this.adminService.staffLogin(body);
  }

  @Post("staff/:id/delete")
  async deleteStaff(@Param("id") id: string) {
    return this.adminService.deleteStaff(id);
  }

  @Post("staff/:id/lock")
  async lockStaff(@Param("id") id: string) {
    return this.adminService.lockStaff(id);
  }

  @Post("staff/:id/unlock")
  async unlockStaff(@Param("id") id: string) {
    return this.adminService.unlockStaff(id);
  }

  @Post("staff/:id/change-password")
  async changeStaffPassword(
    @Param("id") id: string,
    @Body() body: { password?: string },
  ) {
    if (!body || !body.password) {
      throw new UnauthorizedException("Thiếu mật khẩu mới");
    }
    return this.adminService.changeStaffPassword(id, body.password);
  }

  @Put("staff/:id")
  async updateStaff(
    @Param("id") id: string,
    @Body() body: { name?: string; avatar_url?: string },
  ) {
    return this.adminService.updateStaff(id, body);
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
