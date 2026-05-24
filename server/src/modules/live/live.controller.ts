import { Body, Controller, Post, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { LiveService } from './live.service';

@Controller(['live', 'api/live'])
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Post('create')
  async createStream(
    @Body() body: { streamerId: string; title: string; identityType: 'user' | 'channel'; identityId: string },
  ) {
    const { streamerId, title, identityType, identityId } = body;
    if (!streamerId || !title || !identityType || !identityId) {
      throw new BadRequestException('Vui lòng điền đầy đủ thông tin tạo stream');
    }
    return this.liveService.createStream(streamerId, title, identityType, identityId);
  }

  @Post(':id/end')
  async endStream(@Param('id') id: string) {
    return this.liveService.endStream(id);
  }

  @Post(':id/signal')
  async postSignal(
    @Param('id') id: string,
    @Body() body: { viewerId: string; type: 'offer' | 'answer'; sdp: string }
  ) {
    const { viewerId, type, sdp } = body;
    if (!viewerId || !type || !sdp) {
      throw new BadRequestException('Thông tin báo hiệu không đầy đủ');
    }
    return this.liveService.postSignal(id, viewerId, type, sdp);
  }

  @Get(':id/signals')
  async getStreamSignals(@Param('id') id: string) {
    return this.liveService.getStreamSignals(id);
  }

  @Get(':id/signal/:viewerId')
  async getViewerSignal(
    @Param('id') id: string,
    @Param('viewerId') viewerId: string
  ) {
    return this.liveService.getViewerSignal(id, viewerId);
  }

  @Get('active')
  async getActiveStreams() {
    return this.liveService.getActiveStreams();
  }

  @Get(':id')
  async getStreamDetails(
    @Param('id') id: string,
    @Query('viewerId') viewerId?: string,
    @Query('isHost') isHost?: string
  ) {
    if (isHost === 'true') {
      await this.liveService.registerHostHeartbeat(id);
    }
    if (viewerId) {
      await this.liveService.registerHeartbeat(id, viewerId);
    }
    return this.liveService.getStreamDetails(id);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.liveService.getMessages(id);
  }

  @Post(':id/message')
  async postMessage(
    @Param('id') id: string,
    @Body() body: { senderId: string; content: string },
  ) {
    const { senderId, content } = body;
    if (!senderId || !content) {
      throw new BadRequestException('Thông tin người gửi hoặc nội dung không hợp lệ');
    }
    return this.liveService.postMessage(id, senderId, content);
  }

  @Post(':id/donate')
  async donate(
    @Param('id') id: string,
    @Body() body: { viewerId: string; amount: number },
  ) {
    const { viewerId, amount } = body;
    if (!viewerId || !amount || amount <= 0) {
      throw new BadRequestException('Thông tin người quyên góp hoặc số tiền không hợp lệ');
    }
    return this.liveService.donate(id, viewerId, amount);
  }

  @Post(':id/pin')
  async pinMessage(
    @Param('id') id: string,
    @Body() body: { messageId: string }
  ) {
    const { messageId } = body;
    if (!messageId) {
      throw new BadRequestException('ID tin nhắn không hợp lệ');
    }
    return this.liveService.pinMessage(id, messageId);
  }

  @Post(':id/unpin')
  async unpinMessage(
    @Param('id') id: string,
    @Body() body: { messageId: string }
  ) {
    const { messageId } = body;
    if (!messageId) {
      throw new BadRequestException('ID tin nhắn không hợp lệ');
    }
    return this.liveService.unpinMessage(id, messageId);
  }

  @Post(':id/like')
  async likeStream(@Param('id') id: string) {
    return this.liveService.likeStream(id);
  }

  @Post(':id/report')
  async reportStream(
    @Param('id') id: string,
    @Body() body: { reporterId: string; reason: string; content?: string }
  ) {
    const { reporterId, reason, content } = body;
    if (!reporterId || !reason) {
      throw new BadRequestException('Thông tin báo cáo không hợp lệ');
    }
    return this.liveService.reportStream(id, reporterId, reason, content || '');
  }
}
