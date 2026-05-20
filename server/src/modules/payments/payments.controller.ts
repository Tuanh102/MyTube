import { Body, Controller, Post, Get, HttpStatus, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
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

  @Post('verify-success')
  async verifySuccess(@Body() body: { userId: string; videoId: string; orderId?: number }) {
    const { userId, videoId, orderId } = body;
    
    // Nếu có orderId, ta kiểm tra xem Webhook đã xử lý chưa
    if (orderId) {
      const order = await this.paymentsService.getOrder(orderId);
      if (order && order.status === 'SUCCESS') {
        return { status: 'success', message: 'Video already unlocked by Webhook' };
      }
    }

    await this.paymentsService.addPurchasedVideo(userId, videoId);
    return { status: 'success', message: 'Video unlocked' };
  }
}
