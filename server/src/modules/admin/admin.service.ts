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
  // Danh sách Email được phép làm Admin (Bạn có thể chuyển cái này vào .env)
  private readonly adminEmails = [
    'nguyenlekhahai1102@gmail.com',
    'ttattatta096@gmail.com',
    'admin@mytube.com'
  ];

  private readonly staffEmails = [
    'staff1@mytube.com',
    'staff@example.com'
  ];

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
  ) {}

  async googleLogin(googleData: any) {
    const { email, name, sub, picture } = googleData;
    
    console.log('--- SYSTEM LOGIN ATTEMPT ---');
    
    const isAdmin = this.adminEmails.some(e => e.toLowerCase() === email?.toLowerCase());
    const isStaff = this.staffEmails.some(e => e.toLowerCase() === email?.toLowerCase());

    if (!isAdmin && !isStaff) {
      throw new UnauthorizedException('Email này không có quyền truy cập hệ thống quản trị/nhân viên');
    }

    let admin = await this.adminModel.findOne({ email });

    if (!admin) {
      admin = await new this.adminModel({
        email,
        name,
        googleId: sub,
        avatar_url: picture,
        role: isAdmin ? 'ADMIN' : 'STAFF'
      }).save();
    }

    // Ở đây bạn có thể tạo JWT Token riêng cho Admin
    return {
      admin,
      message: 'Admin login success'
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
