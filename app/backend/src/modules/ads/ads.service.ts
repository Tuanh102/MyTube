import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Advertisement, AdvertisementDocument } from "./schemas/ad.schema";
import { AdSetting, AdSettingDocument } from "./schemas/ad-setting.schema";
import {
  WalletTransaction,
  WalletTransactionDocument,
} from "./schemas/wallet-transaction.schema";
import { Order, OrderDocument } from "../payments/schemas/order.schema";
import { User, UserDocument } from "../users/schemas/user.schema";
import {
  Withdrawal,
  WithdrawalDocument,
} from "../payments/schemas/withdrawal.schema";
import * as fs from "fs";
import * as path from "path";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class AdsService implements OnModuleInit {
  constructor(
    @InjectModel(Advertisement.name)
    private readonly adModel: Model<AdvertisementDocument>,
    @InjectModel(AdSetting.name)
    private readonly adSettingModel: Model<AdSettingDocument>,
    @InjectModel(WalletTransaction.name)
    private readonly walletTxModel: Model<WalletTransactionDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<WithdrawalDocument>,
  ) {}

  // Auto-initialize default settings and ads if database is empty on start
  async onModuleInit() {
    try {
      const settingCount = await this.adSettingModel.countDocuments();
      if (settingCount === 0) {
        await this.adSettingModel.create({ globalAdEnabled: true });
        console.log(
          "🌱 Seeded default global AdSetting (globalAdEnabled = true)",
        );
      }

      // Start the 30-day expiration cleanup loop (runs every 1 hour)
      this.checkAndCleanExpiredAds();
      setInterval(() => this.checkAndCleanExpiredAds(), 60 * 60 * 1000);
    } catch (err) {
      console.error("Error in onModuleInit of AdsService:", err);
    }
  }

  // Get global settings
  async getSettings(): Promise<any> {
    let setting = await this.adSettingModel.findOne().exec();
    if (!setting) {
      setting = await this.adSettingModel.create({ globalAdEnabled: true });
    }
    const settingObj = setting.toObject ? setting.toObject() : setting;
    return {
      ...settingObj,
      adminBankName: process.env.ADMIN_MB_BANK_NAME || "CONG TY MYTUBE VIET NAM",
      adminBankAccount: process.env.ADMIN_MB_BANK_ACCOUNT || "0999999999999",
    };
  }

  // Update global settings
  async updateSettings(globalAdEnabled: boolean): Promise<AdSetting> {
    let setting = await this.adSettingModel.findOne();
    if (!setting) {
      setting = new this.adSettingModel({ globalAdEnabled });
    } else {
      setting.globalAdEnabled = globalAdEnabled;
    }
    return setting.save();
  }

  // Get all advertisements with filters
  async getAdsData(mode?: string, advertiserId?: string) {
    const setting = await this.getSettings();

    // First, sync spent for all active CPD ads to handle budget exhaustion automatically
    const activeCpdAds = await this.adModel
      .find({
        status: "ACTIVE",
        pricingModel: "CPD",
      })
      .exec();

    for (const ad of activeCpdAds) {
      await this.syncAdSpent(ad);
    }

    let query: any = {};
    if (mode === "public") {
      // Only serve active, paid, and un-exhausted ads
      query = {
        isActive: true,
        paymentStatus: "APPROVED",
        status: "ACTIVE",
        $expr: { $lt: ["$spent", "$totalBudget"] },
      };
    } else if (advertiserId) {
      query = { advertiserId };
    }

    const ads = await this.adModel.find(query).sort({ createdAt: -1 }).exec();

    // Compute dynamic live spent on-the-fly for active CPD ads without persisting small writes
    const mappedAds = ads.map((ad) => {
      const adObj = ad.toObject();
      if (
        ad.status === "ACTIVE" &&
        ad.pricingModel === "CPD" &&
        ad.lastActiveStartAt
      ) {
        const elapsedMs = Date.now() - new Date(ad.lastActiveStartAt).getTime();
        const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
        const currentSessionCost = elapsedDays * ad.pricePerUnit;
        adObj.spent = Math.min(ad.totalBudget, ad.spent + currentSessionCost);
      }
      return adObj;
    });

    return {
      globalAdEnabled: setting.globalAdEnabled,
      ads: mappedAds,
    };
  }

  // Get details of a single ad slot
  async getAdBySlot(slotId: string): Promise<Advertisement | null> {
    return this.adModel.findOne({ slotId }).exec();
  }

  // Update an ad slot configuration
  async updateAd(
    slotId: string,
    updateData: Partial<Advertisement>,
  ): Promise<Advertisement | null> {
    const ad = await this.adModel.findOne({ slotId }).exec();
    if (!ad) return null;

    // Check if activating this ad
    if (updateData.status === "ACTIVE" || updateData.isActive === true) {
      // 1. Enforce max 1 active ad per user
      if (ad.advertiserId) {
        const activeAd = await this.adModel
          .findOne({
            advertiserId: ad.advertiserId,
            status: "ACTIVE",
            slotId: { $ne: slotId },
          })
          .exec();
        if (activeAd) {
          throw new BadRequestException(
            "Bạn chỉ được chạy tối đa 1 quảng cáo tại cùng một thời điểm. Vui lòng dừng quảng cáo khác trước.",
          );
        }
      }

      // 2. Set lastActiveStartAt if starting now
      if (ad.status !== "ACTIVE") {
        updateData.lastActiveStartAt = new Date();
      }
    }

    // Check if pausing or stopping this ad
    if (
      (updateData.status && updateData.status !== "ACTIVE") ||
      updateData.isActive === false
    ) {
      if (ad.status === "ACTIVE") {
        // Accumulate spent for CPD
        if (ad.pricingModel === "CPD" && ad.lastActiveStartAt) {
          const elapsedMs =
            Date.now() - new Date(ad.lastActiveStartAt).getTime();
          const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
          const currentSessionCost = elapsedDays * ad.pricePerUnit;
          updateData.spent = ad.spent + currentSessionCost;
        }
        updateData.lastActiveStartAt = null as any; // Clear it
      }
    }

    return this.adModel
      .findOneAndUpdate({ slotId }, { $set: updateData }, { new: true })
      .exec();
  }

  // Create a new ad slot
  async createAd(adData: Partial<Advertisement>): Promise<Advertisement> {
    const prefix = adData.slotId || "homepage_main";
    const uniqueSlotId = `${prefix}_${Date.now()}`;
    const status = adData.status || "DRAFT";
    const newAd = new this.adModel({
      ...adData,
      slotId: uniqueSlotId,
      status,
      paymentStatus: adData.paymentStatus || "PENDING_PAYMENT",
      lastActiveStartAt: status === "ACTIVE" ? new Date() : undefined,
      views: 0,
      clicks: 0,
      spent: 0,
    });
    return newAd.save();
  }

  // Delete an ad slot by slotId
  async deleteAd(slotId: string): Promise<any> {
    const ad = await this.adModel.findOne({ slotId }).exec();
    if (!ad) return { deletedCount: 0 };

    // 1. Hoàn trả số tiền dư chưa chạy hết của chiến dịch quảng cáo khi bị xóa
    if (ad.paymentStatus === "APPROVED" && ad.advertiserId) {
      const refundAmount = ad.totalBudget - ad.spent;
      if (refundAmount > 0) {
        const user = await this.userModel.findById(ad.advertiserId).exec();
        if (user) {
          user.adBalance += refundAmount;
          await user.save();

          // Ghi nhận lịch sử giao dịch ví quảng cáo
          await new this.walletTxModel({
            userId: ad.advertiserId,
            amount: refundAmount,
            type: "REFUND",
            description: `Hoàn tiền ngân sách chưa tiêu khi xóa chiến dịch quảng cáo: ${ad.title} (${slotId})`,
          }).save();
          console.log(
            `[AD REFUND] Đã hoàn trả ${refundAmount} VNĐ vào ví quảng cáo của Advertiser: ${ad.advertiserId}`,
          );
        }
      }
    }

    if (ad.mediaUrl) {
      // Clean up files immediately upon explicit deletion
      const publicId = this.extractCloudinaryPublicId(ad.mediaUrl);
      if (publicId) {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
        } catch (err) {
          console.error(
            `Failed to delete Cloudinary file during ad delete:`,
            err,
          );
        }
      } else if (ad.mediaUrl.startsWith("/uploads/ads/")) {
        const filename = ad.mediaUrl.replace("/uploads/ads/", "");
        const localPath = path.join(process.cwd(), "uploads", "ads", filename);
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch (err) {
            console.error(`Failed to delete local file during ad delete:`, err);
          }
        }
      }
    }
    return this.adModel.deleteOne({ slotId }).exec();
  }

  // Pay for an ad (Option 1: VietQR QR request, Option 2: Wallet Deduct)
  async payAd(
    slotId: string,
    method: string,
    userId: string,
    bankTransactionRef?: string,
  ) {
    const ad = await this.adModel.findOne({ slotId }).exec();
    if (!ad) {
      throw new NotFoundException("Không tìm thấy chiến dịch quảng cáo");
    }

    if (method === "wallet") {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException("Không tìm thấy tài khoản người dùng");
      }

      if (user.adBalance < ad.totalBudget) {
        throw new BadRequestException(
          "Số dư ví ảo không đủ để thanh toán. Vui lòng nạp thêm tiền.",
        );
      }

      // Deduct wallet balance
      user.adBalance -= ad.totalBudget;
      await user.save();

      // Log transaction
      await new this.walletTxModel({
        userId,
        amount: -ad.totalBudget,
        type: "SPENT",
        description: `Thanh toán quảng cáo: ${ad.title} (${slotId})`,
      }).save();

      ad.paymentStatus = "APPROVED";
      ad.status = "PENDING_REVIEW"; // Ready for content review
      ad.approvedAt = new Date();
      await ad.save();

      return {
        success: true,
        paymentStatus: "APPROVED",
        status: "PENDING_REVIEW",
        adBalance: user.adBalance,
      };
    } else if (method === "vietqr") {
      if (!bankTransactionRef || bankTransactionRef.trim() === "") {
        throw new BadRequestException(
          "Mã giao dịch là bắt buộc khi chọn thanh toán chuyển khoản",
        );
      }

      ad.paymentStatus = "PENDING_PAYMENT";
      ad.status = "PENDING_PAYMENT";
      ad.bankTransactionRef = bankTransactionRef;
      await ad.save();

      return {
        success: true,
        paymentStatus: "PENDING_PAYMENT",
        status: "PENDING_PAYMENT",
      };
    } else {
      throw new BadRequestException("Phương thức thanh toán không hợp lệ");
    }
  }

  // Admin verifies VietQR bank transfer payment
  async verifyAdPayment(
    slotId: string,
    paymentStatus: "APPROVED" | "REJECTED",
  ) {
    const ad = await this.adModel.findOne({ slotId }).exec();
    if (!ad) {
      throw new NotFoundException("Không tìm thấy quảng cáo");
    }

    if (paymentStatus === "APPROVED") {
      ad.paymentStatus = "APPROVED";
      ad.status = "PENDING_REVIEW"; // Move to content review
      ad.approvedAt = new Date();

      // Log virtual deposit representing the verified cash nạp
      if (ad.advertiserId) {
        await new this.walletTxModel({
          userId: ad.advertiserId,
          amount: ad.totalBudget,
          type: "DEPOSIT",
          description: `Nạp tiền chuyển khoản ngân hàng được duyệt (QC: ${slotId})`,
        }).save();
      }
    } else {
      ad.paymentStatus = "REJECTED";
      ad.status = "REJECTED";
    }

    await ad.save();
    return ad;
  }

  // Staff moderates ad content
  async verifyAdContent(
    slotId: string,
    action: "approve" | "reject",
    rejectReason?: string,
  ) {
    const ad = await this.adModel.findOne({ slotId }).exec();
    if (!ad) {
      throw new NotFoundException("Không tìm thấy quảng cáo");
    }

    if (action === "approve") {
      let alreadyHasActive = false;
      if (ad.advertiserId) {
        const activeAd = await this.adModel
          .findOne({
            advertiserId: ad.advertiserId,
            status: "ACTIVE",
            slotId: { $ne: slotId },
          })
          .exec();
        if (activeAd) {
          alreadyHasActive = true;
        }
      }

      if (alreadyHasActive) {
        ad.status = "PAUSED_BY_USER";
        ad.isActive = false;
      } else {
        ad.status = "ACTIVE";
        ad.isActive = true;
        ad.lastActiveStartAt = new Date();
      }
      ad.rejectReason = "";
    } else {
      ad.status = "REJECTED";
      ad.isActive = false;
      ad.rejectReason = rejectReason || "Nội dung không hợp lệ";
      ad.lastActiveStartAt = undefined;

      // Automatically refund 100% of budget back to user's ad virtual balance
      if (ad.advertiserId) {
        const user = await this.userModel.findById(ad.advertiserId).exec();
        if (user) {
          user.adBalance += ad.totalBudget;
          await user.save();

          // Log transaction
          await new this.walletTxModel({
            userId: ad.advertiserId,
            amount: ad.totalBudget,
            type: "REFUND",
            description: `Hoàn tiền quảng cáo bị từ chối (${slotId}): ${ad.rejectReason}`,
          }).save();
        }
      }
    }

    await ad.save();
    return ad;
  }

  // Track impressions and clicks
  async trackAd(slotId: string, type: "view" | "click") {
    const ad = await this.adModel.findOne({ slotId }).exec();
    if (!ad) return null;

    // First sync spent for CPD ads to ensure correct budget exhaustion
    if (ad.status === "ACTIVE" && ad.pricingModel === "CPD") {
      await this.syncAdSpent(ad);
    }

    if (type === "view") {
      ad.views += 1;
    } else if (type === "click") {
      ad.clicks += 1;
    }

    // Dynamic cost calculations based on pricing model
    if (ad.pricingModel === "CPC" && type === "click") {
      ad.spent += ad.pricePerUnit;
    } else if (ad.pricingModel === "CPM" && type === "view") {
      ad.spent += ad.pricePerUnit / 1000;
    }

    // Auto pause campaign if budget is exhausted (for CPC/CPM)
    if (ad.spent >= ad.totalBudget) {
      ad.isActive = false;
      ad.status = "PAUSED_BUDGET_EXHAUSTED";
      ad.lastActiveStartAt = undefined;
    }

    await ad.save();
    return ad;
  }

  // Reset all advertisement data
  async resetData(): Promise<any> {
    // 1. Delete ALL advertisements (completely empty)
    await this.adModel.deleteMany({}).exec();

    // 2. Clear all wallet transactions
    await this.walletTxModel.deleteMany({}).exec();

    // 3. Clear premium orders
    await this.orderModel
      .deleteMany({
        videoId: { $regex: /^PREMIUM/i },
      })
      .exec();

    // 4. Reset all users' adBalance to 0
    await this.userModel.updateMany({}, { $set: { adBalance: 0 } }).exec();

    return {
      success: true,
      message: "All advertising data has been completely reset to 0",
    };
  }

  // Sync spent helper for CPD
  async syncAdSpent(ad: AdvertisementDocument) {
    if (
      ad.status === "ACTIVE" &&
      ad.pricingModel === "CPD" &&
      ad.lastActiveStartAt
    ) {
      const elapsedMs = Date.now() - new Date(ad.lastActiveStartAt).getTime();
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
      const currentSessionCost = elapsedDays * ad.pricePerUnit;
      const totalSpent = ad.spent + currentSessionCost;

      if (totalSpent >= ad.totalBudget) {
        ad.spent = ad.totalBudget;
        ad.isActive = false;
        ad.status = "PAUSED_BUDGET_EXHAUSTED";
        ad.lastActiveStartAt = undefined;
        await ad.save();
      }
    }
  }

  // Get advertising revenue statistics
  async getAdRevenueData() {
    // 1. Premium subscription revenues
    const premiumOrders = await this.orderModel
      .find({
        status: { $in: ["SUCCESS", "PAID"] },
        videoId: { $regex: /^PREMIUM/i },
      })
      .exec();

    const premiumRevenue = premiumOrders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0,
    );

    // 2. Advertisers metrics
    const ads = await this.adModel.find().exec();
    let contractRevenue = 0; // Commited approved ads
    let earnedRevenue = 0; // Spent ads
    let pendingRevenue = 0; // Waiting for payment approval

    for (const ad of ads) {
      if (ad.paymentStatus === "APPROVED") {
        contractRevenue += ad.totalBudget;
        earnedRevenue += ad.spent;
      } else if (ad.paymentStatus === "PENDING_PAYMENT") {
        pendingRevenue += ad.totalBudget;
      }
    }

    return {
      premiumRevenue,
      contractRevenue,
      earnedRevenue,
      pendingRevenue,
      totalRevenue: premiumRevenue + earnedRevenue,
      perAdMetrics: ads,
    };
  }

  // Get ad wallet details
  async getWalletBalance(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    const balance = user ? user.adBalance : 0;

    const transactions = await this.walletTxModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    return {
      balance,
      transactions,
    };
  }

  // Request withdrawal of virtual balance
  async requestWalletWithdrawal(
    userId: string,
    amount: number,
    bankDetails: string,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("Không tìm thấy tài khoản người dùng");
    }

    if (user.adBalance < amount) {
      throw new BadRequestException(
        "Số dư ví ảo không đủ để thực hiện yêu cầu rút tiền",
      );
    }

    // Deduct balance immediately to prevent double withdrawal
    user.adBalance -= amount;
    await user.save();

    // Log pending withdrawal log
    const tx = await new this.walletTxModel({
      userId,
      amount: -amount,
      type: "WITHDRAWAL",
      description: `Yêu cầu rút tiền mặt về ngân hàng: ${bankDetails}`,
    }).save();

    // Phân tích thông tin ngân hàng từ bankDetails để ghi nhận vào collection Withdrawal dùng chung
    let bankName = "Ví quảng cáo";
    let bankAccount = "Ví số dư";
    let bankAccountHolder = user.username.toUpperCase();

    if (bankDetails && bankDetails.includes("-")) {
      const parts = bankDetails.split("-").map((p) => p.trim());
      if (parts[0]) bankName = parts[0];
      if (parts[1]) bankAccount = parts[1];
      if (parts[2]) bankAccountHolder = parts[2].toUpperCase();
    } else if (bankDetails) {
      bankAccount = bankDetails;
    }

    // Lưu vào bảng Withdrawal dùng chung cho cả hệ thống quản trị để Admin đối soát duyệt tiền
    await new this.withdrawalModel({
      userId: new Types.ObjectId(userId),
      amount: amount, // Số tiền VNĐ
      bankName,
      bankAccount,
      bankAccountHolder,
      status: "PENDING",
      method: "MANUAL",
      type: "ADVERTISER",
    }).save();

    return {
      success: true,
      balance: user.adBalance,
      transaction: tx,
    };
  }

  // Periodic task: delete file uploads of ads paused > 30 days
  async checkAndCleanExpiredAds() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find ads where budget is exhausted and updated (expired) more than 30 days ago
      const expiredAds = await this.adModel
        .find({
          status: "PAUSED_BUDGET_EXHAUSTED",
          updatedAt: { $lt: thirtyDaysAgo },
        })
        .exec();

      for (const ad of expiredAds) {
        console.log(
          `🧹 Dọn dẹp tài nguyên quảng cáo hết hạn của slot: ${ad.slotId}`,
        );
        if (ad.mediaUrl) {
          const publicId = this.extractCloudinaryPublicId(ad.mediaUrl);
          if (publicId) {
            try {
              cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
              });
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "video",
              });
              console.log(`- Đã xóa video ${publicId} trên Cloudinary`);
            } catch (err) {
              console.error(
                `- Lỗi xóa video ${publicId} trên Cloudinary:`,
                err,
              );
            }
          } else if (ad.mediaUrl.startsWith("/uploads/ads/")) {
            const filename = ad.mediaUrl.replace("/uploads/ads/", "");
            // Process local folder upload
            const localPath = path.join(
              process.cwd(),
              "uploads",
              "ads",
              filename,
            );
            if (fs.existsSync(localPath)) {
              try {
                fs.unlinkSync(localPath);
                console.log(`- Đã xóa ảnh quảng cáo cục bộ: ${localPath}`);
              } catch (err) {
                console.error(
                  `- Lỗi xóa ảnh quảng cáo cục bộ ${localPath}:`,
                  err,
                );
              }
            }
          }
        }

        // Move status to ARCHIVED and empty mediaUrl
        ad.status = "ARCHIVED";
        ad.mediaUrl = ""; // Mark empty so client knows they must re-upload to renew
        await ad.save();
      }
    } catch (err) {
      console.error("Error during expired ads cleanup check:", err);
    }
  }

  private extractCloudinaryPublicId(url: string): string | null {
    if (!url || !url.includes("cloudinary.com")) return null;
    const parts = url.split("/video/upload/");
    if (parts.length < 2) return null;
    const pathPart = parts[1];
    const cleanPath = pathPart.replace(/^v\d+\//, "");
    const dotIndex = cleanPath.lastIndexOf(".");
    if (dotIndex === -1) return cleanPath;
    return cleanPath.substring(0, dotIndex);
  }
}
