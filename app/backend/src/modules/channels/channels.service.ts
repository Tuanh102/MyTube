import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Channel, ChannelDocument } from "./schemas/channel.schema";
import { User, UserDocument } from "../users/schemas/user.schema";

import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.channelModel.find().populate("user", "username email").exec();
  }

  async updateVerification(id: string, isVerified: boolean) {
    const updatedChannel = await this.channelModel
      .findByIdAndUpdate(id, { is_verified: isVerified }, { new: true })
      .exec();

    if (updatedChannel) {
      const owner = await this.userModel.findById(updatedChannel.user).exec();
      if (owner) {
        await this.notificationsService.createNotification({
          user: owner as any,
          type: "system",
          message: isVerified
            ? `Chúc mừng! Kênh "${updatedChannel.channel_name}" của bạn đã được xác minh chính thức (cấp tích xanh).`
            : `Thông báo: Kênh "${updatedChannel.channel_name}" của bạn đã bị thu hồi trạng thái xác minh.`,
          target_id: updatedChannel._id.toString(),
        });
      }
    }
    return updatedChannel;
  }

  async penalize(
    id: string,
    action: "STRIKE" | "BAN_7DAYS" | "BAN_30DAYS" | "BAN_FOREVER",
  ) {
    const channel = await this.channelModel.findById(id).exec();
    if (!channel) throw new NotFoundException("Kênh không tồn tại");

    if (action === "STRIKE") {
      channel.strikes = (channel.strikes || 0) + 1;
      if (channel.strikes >= 3) {
        channel.status = "BANNED";
      }
    } else if (action === "BAN_7DAYS") {
      channel.banExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (action === "BAN_30DAYS") {
      channel.banExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (action === "BAN_FOREVER") {
      channel.status = "BANNED";
    }

    const saved = await channel.save();

    try {
      const owner = await this.userModel.findById(saved.user).exec();
      if (owner) {
        let penaltyMessage = "";
        if (action === "STRIKE") {
          penaltyMessage = `Cảnh báo: Kênh "${saved.channel_name}" của bạn vừa nhận 1 gậy cảnh cáo vi phạm từ ban quản trị. Số gậy hiện tại: ${saved.strikes || 1}/3.`;
          if (saved.strikes >= 3) {
            penaltyMessage += ` Kênh của bạn đã bị khóa vĩnh viễn do tích lũy đủ 3 gậy.`;
          }
        } else if (action === "BAN_7DAYS") {
          penaltyMessage = `Thông báo: Kênh "${saved.channel_name}" của bạn đã bị tạm khóa 7 ngày do vi phạm chính sách cộng đồng.`;
        } else if (action === "BAN_30DAYS") {
          penaltyMessage = `Thông báo: Kênh "${saved.channel_name}" của bạn đã bị tạm khóa 30 ngày do vi phạm chính sách cộng đồng.`;
        } else if (action === "BAN_FOREVER") {
          penaltyMessage = `Thông báo: Kênh "${saved.channel_name}" của bạn đã bị khóa vĩnh viễn từ ban quản trị.`;
        }

        await this.notificationsService.createNotification({
          user: owner as any,
          type: "system",
          message: penaltyMessage,
          target_id: saved._id.toString(),
        });
      }
    } catch (notificationErr) {
      console.error("[Penalize Notification Error]:", notificationErr);
    }

    if (saved.status === "BANNED") {
      try {
        await this.channelModel.db
          .model("Video")
          .updateMany({ channel: saved._id }, { $set: { status: "REJECTED" } })
          .exec();
        console.log(
          `[Penalize] Đã chuyển tất cả video của kênh bị khóa ${saved._id} sang REJECTED.`,
        );
      } catch (err) {
        console.error(
          "Lỗi khi chuyển video của kênh bị khóa sang REJECTED:",
          err,
        );
      }
    }

    return saved;
  }

  async create(createChannelDto: {
    channel_name: string;
    description?: string;
    user: string;
    avatar_url?: string;
    banner_url?: string;
  }) {
    const newChannel = new this.channelModel(createChannelDto);
    const savedChannel = await newChannel.save();

    // Change user role to creator if it's their first channel
    const userChannelsCount = await this.channelModel.countDocuments({
      user: createChannelDto.user,
    });
    if (userChannelsCount === 1) {
      await this.userModel.findByIdAndUpdate(createChannelDto.user, {
        role: "creator",
      });
    }

    return savedChannel;
  }

  async findByUser(userId: string) {
    return this.channelModel.find({ user: userId }).exec();
  }

  async findById(id: string) {
    return this.channelModel.findById(id).exec();
  }

  async update(
    id: string,
    updateData: {
      channel_name?: string;
      description?: string;
      avatar_url?: string;
      banner_url?: string;
    },
  ) {
    return this.channelModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string) {
    const channel = await this.channelModel.findById(id).exec();
    if (!channel) return null;

    const userId = channel.user.toString();
    await this.channelModel.findByIdAndDelete(id).exec();

    // Check if user has any channels left
    const remainingChannels = await this.channelModel.countDocuments({
      user: userId,
    });
    if (remainingChannels === 0) {
      await this.userModel.findByIdAndUpdate(userId, { role: "viewer" });
    }

    return { success: true };
  }

  async toggleFollow(id: string, userId: string) {
    const channel = await this.channelModel.findById(id).exec();
    if (!channel) return { success: false, message: "Kênh không tồn tại" };

    const subscribers = (channel.subscribers || []).map((s) => s.toString());
    const isFollowed = subscribers.includes(userId);

    let updatedChannel;
    if (isFollowed) {
      updatedChannel = await this.channelModel
        .findByIdAndUpdate(
          id,
          { $pull: { subscribers: userId } },
          { new: true },
        )
        .exec();
    } else {
      updatedChannel = await this.channelModel
        .findByIdAndUpdate(
          id,
          { $addToSet: { subscribers: userId } },
          { new: true },
        )
        .exec();

      try {
        const follower = await this.userModel.findById(userId).exec();
        const owner = await this.userModel.findById(channel.user).exec();
        if (follower && owner) {
          await this.notificationsService.createNotification({
            user: owner as any,
            type: "subscription",
            actor_name: follower.username,
            actor_avatar: follower.avatar || "/assets/img/default-avatar.png",
            message: `@${follower.username} đã đăng ký theo dõi kênh "${channel.channel_name}" của bạn.`,
            target_id: channel._id.toString(),
            actor_id: follower._id.toString(),
          });
        }
      } catch (err) {
        console.error("[FOLLOW NOTIFICATION ERROR]:", err);
      }
    }

    return {
      success: true,
      isFollowed: !isFollowed,
      subCount: updatedChannel.subscribers?.length || 0,
    };
  }
}
