import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { Comment, CommentSchema } from "./schemas/comment.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Video, VideoSchema } from "../videos/schemas/video.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Video.name, schema: VideoSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
