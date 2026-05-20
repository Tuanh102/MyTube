import { Controller, Get, Post, Patch, Delete, Body, Query, Param } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('home')
  async getHomeVideos(@Query('search') search?: string) {
    return this.videosService.getHomeVideos(search);
  }

  @Get('studio')
  async getStudioVideos(
    @Query('channelId') channelId?: string,
    @Query('search') search?: string,
  ) {
    return this.videosService.getStudioVideos(channelId, search);
  }

  @Get('studio/overview')
  async getStudioOverview(
    @Query('userId') userId: string,
    @Query('channelId') channelId?: string,
  ) {
    return this.videosService.getStudioOverview(userId, channelId);
  }

  @Post()
  async create(@Body() createVideoDto: any) {
    return this.videosService.create(createVideoDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.videosService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.videosService.delete(id);
  }

  @Get('likes')
  async getLikedVideos(@Query('userId') userId: string) {
    return this.videosService.getLikedVideos(userId);
  }

  @Get('shorts')
  async getShorts() {
    return this.videosService.getShorts();
  }

  @Get(':id')
  async getVideoDetails(@Param('id') id: string) {
    return this.videosService.getVideoDetails(id);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Body('userId') userId: string) {
    return this.videosService.toggleLike(id, userId);
  }

  @Post(':id/dislike')
  async toggleDislike(@Param('id') id: string, @Body('userId') userId: string) {
    return this.videosService.toggleDislike(id, userId);
  }

  @Post(':id/view')
  async incrementViewCount(@Param('id') id: string) {
    return this.videosService.incrementViewCount(id);
  }
}
