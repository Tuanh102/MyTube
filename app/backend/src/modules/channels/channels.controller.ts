import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
} from "@nestjs/common";
import { ChannelsService } from "./channels.service";

@Controller("channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  async create(
    @Body()
    createChannelDto: {
      channel_name: string;
      description?: string;
      user: string;
      avatar_url?: string;
      banner_url?: string;
    },
  ) {
    return this.channelsService.create(createChannelDto);
  }

  @Get("all")
  async findAll() {
    return this.channelsService.findAll();
  }

  @Patch(":id/verify")
  async verify(
    @Param("id") id: string,
    @Body("is_verified") isVerified: boolean,
  ) {
    return this.channelsService.updateVerification(id, isVerified);
  }

  @Post(":id/penalize")
  async penalize(
    @Param("id") id: string,
    @Body("action")
    action: "STRIKE" | "BAN_7DAYS" | "BAN_30DAYS" | "BAN_FOREVER",
  ) {
    return this.channelsService.penalize(id, action);
  }

  @Get()
  async findByUser(@Query("userId") userId: string) {
    // If no userId is provided, return all channels as fallback (or we can handle it safely)
    if (!userId) {
      return this.channelsService.findAll();
    }
    return this.channelsService.findByUser(userId);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.channelsService.findById(id);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body()
    updateData: {
      channel_name?: string;
      description?: string;
      avatar_url?: string;
      banner_url?: string;
    },
  ) {
    return this.channelsService.update(id, updateData);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.channelsService.delete(id);
  }

  @Post(":id/follow")
  async toggleFollow(
    @Param("id") id: string,
    @Body() body: { userId: string },
  ) {
    return this.channelsService.toggleFollow(id, body.userId);
  }
}
