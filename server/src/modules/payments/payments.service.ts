import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Video, VideoDocument } from '../videos/schemas/video.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { Admin, AdminDocument } from '../admin/schemas/admin.schema';
@Injectable()
export class PaymentsService {
  private payos: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {
    try {
      const PayOSLib = require('@payos/node');
      const PayOSConstructor = PayOSLib.default || PayOSLib;
      
      const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
      const apiKey = this.configService.get<string>('PAYOS_API_KEY');
      const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

      console.log('[PAYOS CONFIG DIAGNOSTIC]:', {
        clientId: clientId ? `${clientId.slice(0, 5)}...` : 'undefined',
        apiKey: apiKey ? `${apiKey.slice(0, 5)}...` : 'undefined',
        checksumKey: checksumKey ? `${checksumKey.slice(0, 5)}...` : 'undefined'
      });

      this.payos = new PayOSConstructor(clientId, apiKey, checksumKey);
      console.log('PayOS initialized successfully');
    } catch (e) {
      console.error('PayOS Initialization Failed:', e);
    }
  }

  async createPaymentLink(amount: number, description: string, userId: string, videoId: string) {
    // 1. Tự động quy đổi từ Coins sang VNĐ nếu số tiền truyền vào nhỏ hơn 1000 (Ví dụ: 25 Coins -> 25.000 VNĐ)
    const finalAmount = amount < 1000 ? amount * 1000 : amount;

    if (!finalAmount || finalAmount < 1000) {
      throw new Error('Số tiền thanh toán phải tối thiểu là 1.000 VNĐ');
    }

    // Sử dụng 9 số cuối của Date.now() để làm mã đơn hàng (đảm bảo ngắn gọn và duy nhất trong thời gian ngắn)
    const orderCode = Number(String(Date.now()).slice(-9)); 
    
    const order = {
      amount: Math.floor(finalAmount), 
      description: `PAY${orderCode}`, 
      orderCode,
      returnUrl: `${this.configService.get<string>('CLIENT_URL')}/payment-success?orderId=${orderCode}&videoId=${videoId}`,
      cancelUrl: `${this.configService.get<string>('CLIENT_URL')}/payment-cancel`,
    };

    console.log('Dữ liệu gửi sang PayOS:', JSON.stringify(order, null, 2));

    try {
      console.log('Đang tạo link thanh toán với order:', order);
      const paymentLinkData = await this.payos.createPaymentLink(order);
      
      await new this.orderModel({
        orderCode,
        userId,
        videoId,
        amount: finalAmount,
        status: 'PENDING'
      }).save();

      return { ...paymentLinkData, userId, videoId };
    } catch (error) {
      console.error('PayOS Create Error Details:', error);
      // Trả về lỗi chi tiết hơn cho Frontend nếu cần
      throw new Error(error.message || 'Lỗi khi gọi API PayOS');
    }
  }

  async processWebhook(body: any) {
    // 1. Kiểm tra mã trạng thái (Thành công = "00")
    if (body.code === '00' || body.success === true) {
        const data = body.data || body;
        const orderCode = Number(data.orderCode); // Ép kiểu số để chắc chắn khớp với DB

        // 2. Tìm đơn hàng trong DB với trạng thái PENDING
        const order = await this.orderModel.findOneAndUpdate(
            { orderCode, status: 'PENDING' },
            { $set: { status: 'SUCCESS' } },
            { new: true }
        );
        
        if (order) {
            console.log(`Webhook: Xác nhận thanh toán thành công cho đơn hàng ${orderCode}`);
            
            // 3. Tự động mở khóa video và cộng tiền (Chỉ gọi 1 lần duy nhất)
            await this.addPurchasedVideo(order.userId, order.videoId);
            
            console.log(`Webhook: Đã xử lý phân phối doanh thu cho đơn hàng ${orderCode}`);
        } else {
            console.log(`Webhook: Đơn hàng ${orderCode} đã được xử lý hoặc không tồn tại.`);
        }
    }
    return { success: true };
  }

  async getOrder(orderCode: number) {
    return this.orderModel.findOne({ orderCode });
  }

  async addPurchasedVideo(userId: string, videoId: string) {
    // Xử lý đặc biệt nếu đây là giao dịch nâng cấp tài khoản Premium
    if (videoId === 'PREMIUM_MONTH' || videoId === 'PREMIUM_6MONTHS' || videoId === 'PREMIUM_YEAR') {
      let premiumPrice = 25000;
      if (videoId === 'PREMIUM_6MONTHS') premiumPrice = 135000;
      if (videoId === 'PREMIUM_YEAR') premiumPrice = 250000;
      
      let durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days default
      if (videoId === 'PREMIUM_6MONTHS') durationMs = 180 * 24 * 60 * 60 * 1000;
      if (videoId === 'PREMIUM_YEAR') durationMs = 365 * 24 * 60 * 60 * 1000;
      
      const purchasedAt = new Date();
      const expiresAt = new Date(purchasedAt.getTime() + durationMs);

      // 1. Cập nhật trạng thái Premium cho User
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            is_premium: true,
            premium_type: videoId,
            premium_purchased_at: purchasedAt,
            premium_expires_at: expiresAt
          } 
        },
        { new: true }
      );
      console.log(`[PAYOS PREMIUM] Đã kích hoạt Premium thành công cho User: ${userId} (Hết hạn lúc: ${expiresAt.toISOString()})`);

      // 2. Cộng 100% tiền đăng ký gói Premium vào tài khoản Admin MyTube
      await this.adminModel.findOneAndUpdate(
        { role: 'ADMIN' },
        { $inc: { balance: premiumPrice } }
      );
      console.log(`[PAYOS PREMIUM] Đã chuyển ${premiumPrice} VNĐ tiền gói Premium vào ví Admin thành công.`);
      
      return updatedUser;
    }

    // 1. Lấy thông tin video để biết giá và chủ sở hữu
    const video = await this.videoModel.findById(videoId).populate('channel').exec();
    if (!video) throw new Error('Video không tồn tại');

    // 2. Tính toán tiền chia (Ví dụ: Creator nhận 90%)
    // Lấy ID người dùng từ thông tin Kênh (trường 'user' trong Channel schema)
    const creatorId = (video.channel as any)?.user; 
    const amount = video.price || 0;
    const creatorEarnings = amount * 0.9; // 90% cho Creator

    // 3. Cộng tiền vào ví cho Creator
    if (creatorId && creatorEarnings > 0) {
      await this.userModel.findByIdAndUpdate(
        creatorId,
        { $inc: { balance: creatorEarnings } }
      );
      console.log(`Đã cộng ${creatorEarnings} VNĐ vào ví của Creator ${creatorId}`);
      
      // 3.1 Cộng phí sàn 10% cho Admin
      const adminFee = amount * 0.1;
      if (adminFee > 0) {
        // Tìm admin đầu tiên trong hệ thống để cộng tiền
        await this.adminModel.findOneAndUpdate(
          { role: 'ADMIN' },
          { $inc: { balance: adminFee } }
        );
        console.log(`Đã cộng ${adminFee} VNĐ phí sàn vào ví Admin`);
      }
    }

    // 4. Mở khóa video cho người mua
    try {
        const userObjId = new Types.ObjectId(userId);
        const videoObjId = new Types.ObjectId(videoId);

        const updatedUser = await this.userModel.findByIdAndUpdate(
            userObjId,
            { $addToSet: { purchased_videos: videoObjId } },
            { new: true }
        );

        if (updatedUser) {
            console.log(`[PAYMENT] Mở khóa THÀNH CÔNG! User ${userId} hiện có ${updatedUser.purchased_videos.length} video.`);
        } else {
            console.error(`[PAYMENT] Mở khóa THẤT BẠI: Không tìm thấy User ${userId}`);
        }
        return updatedUser;
    } catch (error) {
        console.error(`[PAYMENT] Lỗi khi mở khóa video:`, error);
        return null;
    }
  }
}
