import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Query('userId') userId: string,
    @Query('filter') filter?: string
  ) {
    const rawNotifications = await this.notificationsService.getUserNotifications(userId, filter || 'all');
    // Map backend notifications to match frontend expectations
    return rawNotifications.map(n => ({
      notification_id: n._id.toString(),
      type: n.type,
      actor_name: n.actor_name || 'Hệ thống',
      actor_avatar: n.actor_avatar || '/assets/img/avata.jpg',
      video_title: n.video_title,
      video_thumb: n.video_thumb,
      message: n.message,
      is_read: n.is_read ? 1 : 0,
      created_at: (n as any).createdAt || new Date().toISOString(),
      target_id: n.target_id,
      actor_id: n.actor_id,
    }));
  }

  @Post('read-all')
  async markAllRead(
    @Query('userId') queryUserId?: string,
    @Body('userId') bodyUserId?: string
  ) {
    const userId = queryUserId || bodyUserId;
    if (!userId) return { success: false, message: 'Missing userId' };
    return this.notificationsService.markAllRead(userId);
  }

  @Post(':id/read')
  async markSingleRead(@Param('id') id: string) {
    return this.notificationsService.markSingleRead(id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  @Delete()
  async clearAll(
    @Query('userId') queryUserId?: string,
    @Body('userId') bodyUserId?: string
  ) {
    const userId = queryUserId || bodyUserId;
    if (!userId) return { success: false, message: 'Missing userId' };
    return this.notificationsService.clearAll(userId);
  }
}
