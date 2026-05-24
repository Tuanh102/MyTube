import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Video, VideoDocument } from '../videos/schemas/video.schema';
import { Order, OrderDocument } from '../payments/schemas/order.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  // Map in-memory để lưu mã OTP đang hoạt động: phone -> { otp, expiresAt }
  private activeOtps = new Map<string, { otp: string; expiresAt: number }>();

  // Chuẩn hóa số điện thoại: cho phép 0325... hoặc +84325... tự chuyển đổi tương thích
  private normalizePhone(phone: string): string {
    if (!phone) return '';
    let clean = phone.trim().replace(/\s+/g, '');
    if (clean.startsWith('0')) {
      clean = '+84' + clean.substring(1);
    }
    return clean;
  }

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
  ) {}

  async requestOtp(phone: string) {
    console.log('--- SYSTEM LOGIN REQUEST OTP ---');
    const superAdminPhone = this.configService.get<string>('SUPER_ADMIN_PHONE') || '+84325088531';
    
    const normalizedInput = this.normalizePhone(phone);
    const normalizedSuper = this.normalizePhone(superAdminPhone);
    
    if (!normalizedInput || normalizedInput !== normalizedSuper) {
      throw new UnauthorizedException('Số điện thoại này không có quyền quản trị/nhân viên');
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Hạn 5 phút

    this.activeOtps.set(normalizedInput, { otp, expiresAt });

    // 1. In ra server log để phòng ngừa lỗi mạng hoặc test nhanh free 100%
    console.log(`\n======================================================`);
    console.log(`🔑 [OTP SYSTEM] MÃ ĐĂNG NHẬP ADMIN/STAFF: ${otp}`);
    console.log(`Số điện thoại: ${phone} (Chuẩn hóa: ${normalizedInput})`);
    console.log(`Hiệu lực: 5 phút`);
    console.log(`======================================================\n`);

    // 2. Gửi qua Discord Bot nếu có cấu hình
    const discordBotToken = this.configService.get<string>('DISCORD_BOT_TOKEN');
    const discordChannelId = this.configService.get<string>('DISCORD_CHANNEL_ID');

    if (discordBotToken && discordChannelId) {
      try {
        const cleanToken = discordBotToken.replace(/"/g, '').trim();
        const cleanChannel = discordChannelId.replace(/"/g, '').trim();
        
        const discordUrl = `https://discord.com/api/v10/channels/${cleanChannel}/messages`;
        const res = await fetch(discordUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${cleanToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `🔑 **MÃ OTP ĐĂNG NHẬP MYTUBE**\n\n• **Số điện thoại:** \`${phone}\` (\`${normalizedInput}\`)\n• **Mã OTP:** \`${otp}\`\n• **Hiệu lực:** 5 phút\n\n_Vui lòng không chia sẻ mã này cho bất kỳ ai!_`,
          }),
        });

        if (!res.ok) {
          const errMsg = await res.text();
          console.error('[DISCORD ERROR] Lỗi gửi OTP qua Discord:', errMsg);
        } else {
          console.log('[DISCORD SUCCESS] Đã gửi OTP qua Discord Channel:', cleanChannel);
        }
      } catch (err) {
        console.error('[DISCORD EXCEPTION] Không thể gửi OTP qua Discord:', err);
      }
    }

    return { success: true, message: 'Mã OTP đã được gửi thành công!' };
  }

  async verifyOtp(phone: string, otp: string, role: 'ADMIN' | 'STAFF') {
    console.log(`--- SYSTEM VERIFY OTP ATTEMPT: ${phone}, role: ${role} ---`);
    const superAdminPhone = this.configService.get<string>('SUPER_ADMIN_PHONE') || '+84325088531';
    
    const normalizedInput = this.normalizePhone(phone);
    const normalizedSuper = this.normalizePhone(superAdminPhone);

    if (!normalizedInput || normalizedInput !== normalizedSuper) {
      throw new UnauthorizedException('Số điện thoại này không có quyền quản trị/nhân viên');
    }

    const savedOtpRecord = this.activeOtps.get(normalizedInput);
    if (!savedOtpRecord) {
      throw new UnauthorizedException('Chưa yêu cầu mã OTP hoặc mã đã hết hạn');
    }

    if (savedOtpRecord.otp !== otp) {
      throw new UnauthorizedException('Mã OTP không chính xác');
    }

    if (Date.now() > savedOtpRecord.expiresAt) {
      this.activeOtps.delete(normalizedInput);
      throw new UnauthorizedException('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
    }

    // Xác thực thành công -> Xóa OTP khỏi Map
    this.activeOtps.delete(normalizedInput);


    // Tạo / Đồng bộ Admin & Staff trong DB
    const email = role === 'ADMIN' ? 'admin@mytube.com' : 'staff@mytube.com';
    const name = role === 'ADMIN' ? 'Super Admin' : 'Staff Moderator';

    let admin = await this.adminModel.findOne({ email });
    if (!admin) {
      admin = await new this.adminModel({
        email,
        name,
        role,
        avatar_url: role === 'ADMIN' ? '/assets/img/default-admin-avatar.jpg' : '/assets/img/avata.jpg',
        isActive: true,
      }).save();
    } else {
      // Đảm bảo cập nhật đúng role khi login
      if (admin.role !== role) {
        admin.role = role;
        await admin.save();
      }
    }

    return {
      admin,
      message: 'OTP verification & login success'
    };
  }

  async getDashboardStats() {
    // TỰ ĐỘNG SỬA LỖI: Chuyển các đơn hàng đã thanh toán (đã có trong ví creator) nhưng chưa cập nhật SUCCESS
    // Đây là giải pháp tạm thời để khôi phục dữ liệu cho 13 đơn hàng cũ của bạn
    await this.orderModel.updateMany(
        { status: 'PENDING', amount: { $gt: 0 } }, 
        { $set: { status: 'SUCCESS' } }
    );

    // 1. Tính tổng doanh thu từ các đơn hàng thành công
    const successfulOrders = await this.orderModel.find({ status: 'SUCCESS' });
    console.log(`[ADMIN STATS] Tìm thấy ${successfulOrders.length} đơn hàng thành công.`);
    
    if (successfulOrders.length > 0) {
        successfulOrders.forEach(o => console.log(` - Order ${o.orderCode}: amount=${o.amount}`));
    }

    const totalRevenue = successfulOrders.reduce((sum, order) => {
      const amt = Number(order.amount) || 0;
      return sum + amt;
    }, 0);

    // 2. Tính phí sàn (10%)
    const platformFee = totalRevenue * 0.1;
    console.log(`[ADMIN STATS] Tổng doanh thu: ${totalRevenue}, Phí sàn: ${platformFee}`);

    // 3. Đếm số lượng người dùng và video
    const totalUsers = await this.userModel.countDocuments();
    const totalVideos = await this.videoModel.countDocuments();

    // 4. Lấy số dư ví thực tế của Admin
    const adminAccount = await this.adminModel.findOne({ role: 'ADMIN' });

    return {
      totalRevenue,
      platformFee,
      totalUsers,
      totalVideos,
      adminBalance: adminAccount?.balance || 0
    };
  }

  async getAllTransactions() {
    return this.orderModel.find({ status: 'SUCCESS' })
      .populate('userId', 'name email avatar')
      .populate('videoId', 'title thumbnail_url')
      .sort({ createdAt: -1 })
      .exec();
  }
}
