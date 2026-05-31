import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdsController } from "./ads.controller";
import { AdsService } from "./ads.service";
import { Advertisement, AdvertisementSchema } from "./schemas/ad.schema";
import { AdSetting, AdSettingSchema } from "./schemas/ad-setting.schema";
import {
  WalletTransaction,
  WalletTransactionSchema,
} from "./schemas/wallet-transaction.schema";
import { Order, OrderSchema } from "../payments/schemas/order.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import {
  Withdrawal,
  WithdrawalSchema,
} from "../payments/schemas/withdrawal.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advertisement.name, schema: AdvertisementSchema },
      { name: AdSetting.name, schema: AdSettingSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
  ],
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
