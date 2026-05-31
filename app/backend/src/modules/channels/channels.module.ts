import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { Channel, ChannelSchema } from "./schemas/channel.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
