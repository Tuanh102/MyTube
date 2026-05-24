import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Video, VideoDocument } from '../videos/schemas/video.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { Admin, AdminDocument } from '../admin/schemas/admin.schema';
import { Withdrawal, WithdrawalDocument } from './schemas/withdrawal.schema';

@Injectable()
export class PaymentsService {
  private payos: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
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
            await this.addPurchasedVideo(order.userId, order.videoId, true, order.amount);
            
            console.log(`Webhook: Đã xử lý phân phối doanh thu cho đơn hàng ${orderCode}`);
        } else {
            console.log(`Webhook: Đơn hàng ${orderCode} đã được xử lý hoặc không tồn tại.`);
        }
    }
    return { success: true };
  }

  async processSePayWebhook(body: any, authHeader: string) {
    console.log('[SEPAY WEBHOOK] Received request header authorization:', authHeader);
    console.log('[SEPAY WEBHOOK] Received request body:', JSON.stringify(body, null, 2));

    // 1. Xác thực API Key từ SePay
    if (!authHeader) {
      throw new Error('Thiếu Header Authorization');
    }
    const parts = authHeader.split(' ');
    const expectedSecret = this.configService.get<string>('SEPAY_API_KEY') || 'mytube_sepay_secret_2024_xK9mN3pQ';
    
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'apikey' || parts[1] !== expectedSecret) {
      console.error('[SEPAY WEBHOOK] Invalid API Key. Expected:', expectedSecret, 'Received:', authHeader);
      throw new Error('API Key không hợp lệ');
    }

    // 2. Kiểm tra loại giao dịch phải là tiền ra (out)
    const transferType = body.transferType?.toLowerCase();
    if (transferType !== 'out') {
      console.log(`[SEPAY WEBHOOK] Bỏ qua giao dịch vì loại giao dịch là ${transferType} (không phải 'out')`);
      return { success: true, message: 'Bỏ qua giao dịch không phải tiền ra (out)' };
    }

    // 3. Tìm nội dung chuyển khoản để khớp mã rút tiền
    const content = body.content || body.description || '';
    if (!content) {
      console.log('[SEPAY WEBHOOK] Bỏ qua giao dịch vì không có nội dung chuyển khoản');
      return { success: true, message: 'Bỏ qua giao dịch không có nội dung' };
    }

    const contentUpper = content.toUpperCase();
    
    // Lấy danh sách các yêu cầu rút tiền đang chờ duyệt (PENDING)
    const pendingWithdrawals = await this.withdrawalModel.find({ status: 'PENDING' }).exec();
    console.log(`[SEPAY WEBHOOK] Đang quét ${pendingWithdrawals.length} yêu cầu rút tiền PENDING...`);

    // Khớp mã: tìm yêu cầu có 6 ký tự cuối của ID xuất hiện trong nội dung chuyển khoản
    const matchingWithdrawal = pendingWithdrawals.find(w => {
      const withdrawalCode = w._id.toString().slice(-6).toUpperCase();
      return contentUpper.includes(withdrawalCode);
    });

    if (!matchingWithdrawal) {
      console.log(`[SEPAY WEBHOOK] Không tìm thấy yêu cầu rút tiền PENDING nào khớp với nội dung: "${content}"`);
      return { success: true, message: 'Không tìm thấy yêu cầu rút tiền khớp với nội dung' };
    }

    console.log(`[SEPAY WEBHOOK] Đã tìm thấy yêu cầu rút tiền khớp: ID=${matchingWithdrawal._id}, Số tiền yêu cầu=${matchingWithdrawal.amount}`);

    // 4. Kiểm tra số tiền chuyển khoản
    const transferAmount = Number(body.transferAmount);
    if (transferAmount !== matchingWithdrawal.amount) {
      console.error(`[SEPAY WEBHOOK] Số tiền không khớp! SePay gửi: ${transferAmount}, Yêu cầu rút: ${matchingWithdrawal.amount}`);
      return { success: false, message: 'Số tiền chuyển khoản không khớp với yêu cầu rút tiền' };
    }

    // 5. Duyệt yêu cầu rút tiền tự động
    try {
      const result = await this.approveWithdrawal(matchingWithdrawal._id.toString(), 'AUTOMATIC_SEPAY');
      console.log(`[SEPAY WEBHOOK] Tự động duyệt thành công yêu cầu rút tiền ID=${matchingWithdrawal._id}`);
      return { success: true, message: 'Tự động duyệt thành công', data: result };
    } catch (approveErr: any) {
      console.error(`[SEPAY WEBHOOK] Lỗi khi thực hiện duyệt tự động:`, approveErr);
      return { success: false, message: approveErr.message || 'Lỗi khi phê duyệt giao dịch' };
    }
  }

  async getOrder(orderCode: number) {
    return this.orderModel.findOne({ orderCode });
  }

  async verifyPayment(orderCode: number, userId: string, videoId: string) {
    // Bảo mật: Xác thực đơn hàng trong DB trước khi truy vấn cổng thanh toán
    const orderCheck = await this.orderModel.findOne({ orderCode });
    if (!orderCheck) {
      throw new Error('Đơn hàng không tồn tại trên hệ thống của chúng tôi');
    }
    if (orderCheck.userId.toString() !== userId) {
      throw new Error('Đơn hàng này không thuộc về tài khoản của bạn');
    }
    if (orderCheck.videoId.toString() !== videoId) {
      throw new Error('Đơn hàng này không khớp với video bạn đang cố gắng truy cập');
    }

    try {
      console.log(`[PAYOS VERIFY] Đang xác thực đơn hàng ${orderCode} với PayOS...`);
      const paymentInfo = await this.payos.getPaymentLinkInformation(orderCode);
      console.log(`[PAYOS VERIFY] Trạng thái đơn hàng ${orderCode} từ PayOS:`, paymentInfo?.status);

      if (paymentInfo && paymentInfo.status === 'PAID') {
        // Cập nhật trạng thái đơn hàng trong DB thành SUCCESS nếu nó đang PENDING
        const order = await this.orderModel.findOneAndUpdate(
          { orderCode, status: 'PENDING' },
          { $set: { status: 'SUCCESS' } },
          { new: true }
        );

        if (order) {
          console.log(`[PAYOS VERIFY] Webhook chưa xử lý. Tiến hành cộng tiền và mở khóa video...`);
          await this.addPurchasedVideo(userId, videoId, true, order.amount);
        } else {
          // Nếu đơn hàng đã được cập nhật trước đó rồi (bởi Webhook), ta vẫn đảm bảo video được mở khóa cho user này nhưng không cộng tiền trùng lặp
          const oldOrder = await this.orderModel.findOne({ orderCode });
          await this.addPurchasedVideo(userId, videoId, false, oldOrder?.amount);
        }
        return { status: 'success', message: 'Video unlocked successfully' };
      } else {
        throw new Error(`Đơn hàng chưa được thanh toán (Trạng thái PayOS: ${paymentInfo?.status || 'UNKNOWN'})`);
      }
    } catch (err: any) {
      console.error(`[PAYOS VERIFY ERROR] Lỗi xác thực đơn hàng ${orderCode}:`, err);
      throw new Error(err.message || 'Lỗi kết nối hoặc đơn hàng không tồn tại trên PayOS');
    }
  }


  async addPurchasedVideo(userId: string, videoId: string, shouldIncBalance: boolean = false, paidAmount?: number) {
    // Xử lý đặc biệt nếu đây là giao dịch nạp tiền (Deposit)
    if (videoId && videoId.startsWith('DEPOSIT_')) {
      const parts = videoId.split('_');
      const amountStr = parts[1];
      let depositAmount = parseInt(amountStr, 10);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        depositAmount = paidAmount || 0;
      }

      // 1. Tăng balance của User nạp tiền
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: depositAmount } },
        { new: true }
      );
      console.log(`[PAYOS DEPOSIT] Đã cộng ${depositAmount} VNĐ vào ví của User: ${userId}`);

      // 2. Cộng doanh thu thực vào ví của Admin MyTube
      if (shouldIncBalance) {
        await this.adminModel.findOneAndUpdate(
          { role: 'ADMIN' },
          { $inc: { balance: depositAmount } }
        );
        console.log(`[PAYOS DEPOSIT] Đã chuyển ${depositAmount} VNĐ vào ví Admin thành công.`);
      }
      
      return updatedUser;
    }

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
      if (shouldIncBalance) {
        await this.adminModel.findOneAndUpdate(
          { role: 'ADMIN' },
          { $inc: { balance: premiumPrice } }
        );
        console.log(`[PAYOS PREMIUM] Đã chuyển ${premiumPrice} VNĐ tiền gói Premium vào ví Admin thành công.`);
      }
      
      return updatedUser;
    }

    // 1. Lấy thông tin video để biết giá và chủ sở hữu
    const video = await this.videoModel.findById(videoId).populate('channel').exec();
    if (!video) throw new Error('Video không tồn tại');

    // 2. Tính toán tiền chia (Ví dụ: Creator nhận 90% từ số tiền thực tế đã thanh toán)
    const creatorId = (video.channel as any)?.user; 
    
    // Tự động quy đổi từ Coins sang VNĐ nếu nhỏ hơn 1000 (Ví dụ: 10 Coins -> 10,000 VNĐ)
    const price = video.price || 0;
    const finalAmount = paidAmount !== undefined ? paidAmount : (price < 1000 ? price * 1000 : price);
    const creatorEarnings = finalAmount * 0.9; // 90% cho Creator

    // 3. Cộng tiền vào ví cho Creator (Chỉ cộng khi được yêu cầu và chưa cộng trùng lặp)
    if (shouldIncBalance && creatorId && creatorEarnings > 0) {
      await this.userModel.findByIdAndUpdate(
        creatorId,
        { $inc: { balance: creatorEarnings } }
      );
      console.log(`Đã cộng ${creatorEarnings} VNĐ vào ví của Creator ${creatorId}`);
      
      // 3.1 Cộng phí sàn 10% cho Admin
      const adminFee = finalAmount * 0.1;
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

  async requestWithdrawal(userId: string, amount: number, bankName: string, bankAccount: string, bankAccountHolder: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('Người dùng không tồn tại');

    if (amount <= 0) throw new Error('Số tiền rút phải lớn hơn 0');
    if (user.balance < amount) throw new Error('Số dư không đủ để thực hiện rút tiền');

    const withdrawal = new this.withdrawalModel({
      userId: new Types.ObjectId(userId),
      amount,
      bankName,
      bankAccount,
      bankAccountHolder: bankAccountHolder.toUpperCase(),
      status: 'PENDING'
    });

    return withdrawal.save();
  }

  async getUserWithdrawals(userId: string) {
    return this.withdrawalModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async getAllWithdrawals() {
    return this.withdrawalModel.find()
      .populate('userId', 'username name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getWithdrawalById(id: string) {
    return this.withdrawalModel.findById(id)
      .populate('userId', 'username name email avatar')
      .exec();
  }

  async approveWithdrawal(withdrawalId: string, method: string = 'MANUAL') {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) throw new Error('Yêu cầu rút tiền không tồn tại');
    if (withdrawal.status !== 'PENDING') throw new Error('Yêu cầu này đã được xử lý trước đó');

    const user = await this.userModel.findById(withdrawal.userId);
    if (!user) throw new Error('Không tìm thấy tài khoản Creator');
    if (user.balance < withdrawal.amount) throw new Error('Số dư của Creator không đủ để thực hiện rút tiền');

    // Deduct creator's balance
    user.balance -= withdrawal.amount;
    await user.save();

    // Update withdrawal request status
    withdrawal.status = 'SUCCESS';
    withdrawal.method = method;
    await withdrawal.save();

    // Deduct from Admin's balance if admin exists
    const admin = await this.adminModel.findOne({ role: 'ADMIN' });
    if (admin) {
      admin.balance = (admin.balance || 0) - withdrawal.amount;
      await admin.save();
    }

    return withdrawal;
  }

  async rejectWithdrawal(withdrawalId: string, reason?: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) throw new Error('Yêu cầu rút tiền không tồn tại');
    if (withdrawal.status !== 'PENDING') throw new Error('Yêu cầu này đã được xử lý trước đó');

    withdrawal.status = 'REJECTED';
    withdrawal.rejectReason = reason || 'Thông tin ngân hàng không hợp lệ';
    return withdrawal.save();
  }
}
