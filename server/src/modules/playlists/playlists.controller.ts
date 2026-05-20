import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  async getUserPlaylists(@Query('userId') userId: string, @Query('videoId') videoId?: string) {
    return this.playlistsService.getUserPlaylists(userId, videoId);
  }

  @Post()
  async create(@Body('name') name: string, @Body('userId') userId: string) {
    return this.playlistsService.create(name, userId);
  }

  @Post(':id/toggle-video')
  async toggleVideo(@Param('id') id: string, @Body('videoId') videoId: string) {
    return this.playlistsService.toggleVideo(id, videoId);
  }

  @Get(':id/videos')
  async getPlaylistVideos(@Param('id') id: string) {
    return this.playlistsService.getPlaylistVideos(id);
  }
}
