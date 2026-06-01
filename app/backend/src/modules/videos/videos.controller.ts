import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
} from "@nestjs/common";
import { VideosService } from "./videos.service";

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get("home")
  async getHomeVideos(
    @Query("search") search?: string,
    @Query("userId") userId?: string,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.videosService.getHomeVideos(search, userId, categoryId);
  }

  @Post("check-copyright")
  async checkCopyright(@Body() dto: { fingerprint: string; title: string; description?: string; channelId: string }) {
    return this.videosService.checkCopyright(dto);
  }

  @Get("studio")
  async getStudioVideos(
    @Query("channelId") channelId?: string,
    @Query("search") search?: string,
    @Query("userId") userId?: string,
  ) {
    return this.videosService.getStudioVideos(channelId, search, userId);
  }

  @Get("studio/overview")
  async getStudioOverview(
    @Query("userId") userId: string,
    @Query("channelId") channelId?: string,
  ) {
    return this.videosService.getStudioOverview(userId, channelId);
  }

  @Post()
  async create(@Body() createVideoDto: any) {
    return this.videosService.create(createVideoDto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateData: any) {
    return this.videosService.update(id, updateData);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.videosService.delete(id);
  }

  @Get("likes")
  async getLikedVideos(@Query("userId") userId: string) {
    return this.videosService.getLikedVideos(userId);
  }

  @Get("shorts")
  async getShorts(@Query("userId") userId?: string) {
    return this.videosService.getShorts(userId);
  }

  @Get(":id")
  async getVideoDetails(
    @Param("id") id: string,
    @Query("userId") userId?: string,
  ) {
    return this.videosService.getVideoDetails(id, userId);
  }

  @Post(":id/like")
  async toggleLike(@Param("id") id: string, @Body("userId") userId: string) {
    return this.videosService.toggleLike(id, userId);
  }

  @Post(":id/dislike")
  async toggleDislike(@Param("id") id: string, @Body("userId") userId: string) {
    return this.videosService.toggleDislike(id, userId);
  }

  @Post(":id/view")
  async incrementViewCount(@Param("id") id: string) {
    return this.videosService.incrementViewCount(id);
  }
}
