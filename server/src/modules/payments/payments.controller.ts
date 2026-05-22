import { Body, Controller, Post, Get, Param, HttpStatus, Res, BadRequestException, UnauthorizedException, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller(['payments', 'api/payments'])
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  async createPayment(@Body() body: { amount: number; description: string; userId: string; videoId: string }) {
    const { amount, description, userId, videoId } = body;
    try {
      const paymentLink = await this.paymentsService.createPaymentLink(amount, description, userId, videoId);
      return paymentLink;
    } catch (err: any) {
      console.error('[PAYMENTS CREATE ERROR]:', err);
      return {
        error: true,
        message: err.message || 'Lỗi hệ thống khi tạo link thanh toán',
        details: err.toString()
      };
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    return this.paymentsService.processWebhook(body);
  }

  @Post('sepay-webhook')
  async handleSePayWebhook(@Body() body: any, @Headers('authorization') authHeader: string) {
    try {
      return await this.paymentsService.processSePayWebhook(body, authHeader);
    } catch (err: any) {
      console.error('[SEPAY WEBHOOK ERROR]:', err);
      throw new UnauthorizedException(err.message || 'Xác thực Webhook SePay thất bại');
    }
  }

  @Post('verify-success')
  async verifySuccess(@Body() body: { userId: string; videoId: string; orderId?: number }) {
    const { userId, videoId, orderId } = body;
    
    if (!orderId) {
      throw new BadRequestException('Mã đơn hàng (orderId) là bắt buộc để xác thực');
    }

    // 1. Kiểm tra đơn hàng trong DB
    const order = await this.paymentsService.getOrder(orderId);
    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại trong hệ thống');
    }

    // 2. Bảo mật: Đảm bảo order này thuộc về đúng user đang gửi yêu cầu xác thực
    if (order.userId.toString() !== userId) {
      throw new UnauthorizedException('Đơn hàng này không thuộc về tài khoản của bạn');
    }

    // 2.1 Bảo mật: Đảm bảo order này khớp với đúng video đang gửi yêu cầu xác thực
    if (order.videoId.toString() !== videoId) {
      throw new BadRequestException('Đơn hàng này không khớp với video bạn đang truy cập');
    }

    // 3. Nếu đơn hàng đã được Webhook đánh dấu là SUCCESS, ta có thể trả về thành công ngay
    if (order.status === 'SUCCESS') {
      // Đảm bảo video đã thực sự được mở khóa cho user này nhưng không cộng tiền trùng lặp (đề phòng Webhook lỗi hoặc chưa lưu kịp)
      await this.paymentsService.addPurchasedVideo(userId, videoId, false, order.amount);
      return { status: 'success', message: 'Video already unlocked by Webhook' };
    }

    // 4. Nếu chưa SUCCESS (ví dụ webhook bị chậm), ta truy vấn trực tiếp cổng thanh toán PayOS để xác thực thời gian thực
    try {
      const result = await this.paymentsService.verifyPayment(orderId, userId, videoId);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Xác thực thanh toán thất bại');
    }
  }

  @Post('withdraw')
  async withdraw(@Body() body: { userId: string; amount: number; bankName: string; bankAccount: string; bankAccountHolder: string }) {
    const { userId, amount, bankName, bankAccount, bankAccountHolder } = body;
    try {
      const withdrawal = await this.paymentsService.requestWithdrawal(userId, amount, bankName, bankAccount, bankAccountHolder);
      return withdrawal;
    } catch (err: any) {
      console.error('[WITHDRAWAL REQUEST ERROR]:', err);
      return {
        error: true,
        message: err.message || 'Lỗi hệ thống khi gửi yêu cầu rút tiền',
        details: err.toString()
      };
    }
  }

  @Get('withdrawals/user/:userId')
  async getUserWithdrawals(@Param('userId') userId: string) {
    try {
      return await this.paymentsService.getUserWithdrawals(userId);
    } catch (err: any) {
      console.error('[GET USER WITHDRAWALS ERROR]:', err);
      return {
        error: true,
        message: err.message || 'Lỗi khi tải lịch sử rút tiền',
        details: err.toString()
      };
    }
  }
}
