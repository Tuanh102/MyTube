import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('api/support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  async createTicket(@Body() data: any) {
    return this.supportService.createTicket(data.userId, data);
  }

  @Get('my-tickets')
  async getMyTickets(@Query('userId') userId: string) {
    return this.supportService.getUserTickets(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Query('userId') userId: string) {
    const count = await this.supportService.getUnreadCount(userId);
    return { count };
  }

  @Post('mark-read/:id')
  async markRead(@Param('id') id: string) {
    return this.supportService.markAsRead(id);
  }

  @Post('message/:id')
  async addMessage(@Param('id') id: string, @Body() data: any) {
    return this.supportService.addMessage(id, data.senderId, data.role, data.message);
  }

  // API cho Staff
  @Get('all-tickets')
  async getAllTickets() {
    return this.supportService.getAllTickets();
  }
}
