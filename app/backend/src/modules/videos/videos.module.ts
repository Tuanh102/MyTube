import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { Video, VideoSchema } from "./schemas/video.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Fingerprint, FingerprintSchema } from "./schemas/fingerprint.schema";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: User.name, schema: UserSchema },
      { name: Fingerprint.name, schema: FingerprintSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
