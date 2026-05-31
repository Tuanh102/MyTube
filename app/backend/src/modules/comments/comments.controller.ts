import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body()
    createCommentDto: {
      videoId: string;
      userId: string;
      content: string;
      rating?: number;
      parentCommentId?: string;
    },
  ) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Get("video/:videoId")
  async getCommentsByVideo(@Param("videoId") videoId: string) {
    return this.commentsService.getCommentsByVideo(videoId);
  }

  @Post(":id/like")
  async toggleLike(@Param("id") id: string, @Body("userId") userId: string) {
    return this.commentsService.toggleLike(id, userId);
  }

  @Post(":id/dislike")
  async toggleDislike(@Param("id") id: string, @Body("userId") userId: string) {
    return this.commentsService.toggleDislike(id, userId);
  }

  @Get("studio")
  async getStudioComments(
    @Query("userId") userId: string,
    @Query("videoId") videoId?: string,
  ) {
    return this.commentsService.getStudioComments(userId, videoId);
  }

  @Delete(":id")
  async deleteComment(@Param("id") id: string) {
    return this.commentsService.deleteComment(id);
  }
}
