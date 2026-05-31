import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Video, VideoSchema } from "../videos/schemas/video.schema";
import { Order, OrderSchema } from "./schemas/order.schema";
import { Admin, AdminSchema } from "../admin/schemas/admin.schema";
import { Withdrawal, WithdrawalSchema } from "./schemas/withdrawal.schema";
import {
  WalletTransaction,
  WalletTransactionSchema,
} from "../ads/schemas/wallet-transaction.schema";
import { NotificationsModule } from "../notifications/notifications.module";
import { PremiumPackage, PremiumPackageSchema } from "./schemas/premium-package.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Video.name, schema: VideoSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: PremiumPackage.name, schema: PremiumPackageSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, MongooseModule],
})
export class PaymentsModule {}
