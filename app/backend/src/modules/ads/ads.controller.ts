import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
} from "@nestjs/common";
import { AdsService } from "./ads.service";
import { Advertisement } from "./schemas/ad.schema";

@Controller("api/ads")
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  async getAds(
    @Query("mode") mode?: string,
    @Query("advertiserId") advertiserId?: string,
  ) {
    return this.adsService.getAdsData(mode, advertiserId);
  }

  @Get("settings")
  async getSettings() {
    return this.adsService.getSettings();
  }

  @Post("settings")
  async updateSettings(@Body() body: { globalAdEnabled: boolean }) {
    return this.adsService.updateSettings(body.globalAdEnabled);
  }

  @Post("reset")
  async resetData() {
    return this.adsService.resetData();
  }

  @Get("revenue")
  async getRevenue() {
    return this.adsService.getAdRevenueData();
  }

  @Get("wallet/balance/:userId")
  async getWalletBalance(@Param("userId") userId: string) {
    return this.adsService.getWalletBalance(userId);
  }

  @Post("wallet/withdrawal")
  async requestWithdrawal(
    @Body() body: { userId: string; amount: number; bankDetails: string },
  ) {
    return this.adsService.requestWalletWithdrawal(
      body.userId,
      body.amount,
      body.bankDetails,
    );
  }

  @Post()
  async createAd(@Body() adData: Partial<Advertisement>) {
    return this.adsService.createAd(adData);
  }

  @Post(":slotId/pay")
  async payAd(
    @Param("slotId") slotId: string,
    @Body()
    body: { method: string; userId: string; bankTransactionRef?: string },
  ) {
    return this.adsService.payAd(
      slotId,
      body.method,
      body.userId,
      body.bankTransactionRef,
    );
  }

  @Post(":slotId/verify-payment")
  async verifyPayment(
    @Param("slotId") slotId: string,
    @Body() body: { paymentStatus: "APPROVED" | "REJECTED" },
  ) {
    return this.adsService.verifyAdPayment(slotId, body.paymentStatus);
  }

  @Post(":slotId/verify-content")
  async verifyContent(
    @Param("slotId") slotId: string,
    @Body() body: { action: "approve" | "reject"; rejectReason?: string },
  ) {
    return this.adsService.verifyAdContent(
      slotId,
      body.action,
      body.rejectReason,
    );
  }

  @Post(":slotId/track")
  async trackAd(
    @Param("slotId") slotId: string,
    @Body() body: { type: "view" | "click" },
  ) {
    return this.adsService.trackAd(slotId, body.type);
  }

  @Get(":slotId")
  async getAdBySlot(@Param("slotId") slotId: string) {
    const ad = await this.adsService.getAdBySlot(slotId);
    if (!ad) {
      throw new NotFoundException(
        `Quảng cáo với vị trí ${slotId} không tồn tại`,
      );
    }
    return ad;
  }

  @Put(":slotId")
  async updateAd(
    @Param("slotId") slotId: string,
    @Body() updateData: Partial<Advertisement>,
  ) {
    const ad = await this.adsService.updateAd(slotId, updateData);
    if (!ad) {
      throw new NotFoundException(
        `Không thể cập nhật quảng cáo với vị trí ${slotId}`,
      );
    }
    return ad;
  }

  @Delete(":slotId")
  async deleteAd(@Param("slotId") slotId: string) {
    const res = await this.adsService.deleteAd(slotId);
    if (res.deletedCount === 0) {
      throw new NotFoundException(
        `Không tìm thấy quảng cáo với vị trí ${slotId} để xóa`,
      );
    }
    return { success: true };
  }
}
