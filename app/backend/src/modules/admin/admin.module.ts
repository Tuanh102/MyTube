import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { Admin, AdminSchema } from "./schemas/admin.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Video, VideoSchema } from "../videos/schemas/video.schema";
import { Order, OrderSchema } from "../payments/schemas/order.schema";
import { Channel, ChannelSchema } from "../channels/schemas/channel.schema";
import { Comment, CommentSchema } from "../comments/schemas/comment.schema";
import {
  Withdrawal,
  WithdrawalSchema,
} from "../payments/schemas/withdrawal.schema";
import { Ticket, TicketSchema } from "../support/schemas/ticket.schema";
import { VideosModule } from "../videos/videos.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Video.name, schema: VideoSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    VideosModule,
    PaymentsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
