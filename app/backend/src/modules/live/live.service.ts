import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LiveStream, LiveStreamDocument } from "./schemas/live.schema";
import {
  LiveMessage,
  LiveMessageDocument,
} from "./schemas/live-message.schema";
import { User, UserDocument } from "../users/schemas/user.schema";
import { Channel, ChannelDocument } from "../channels/schemas/channel.schema";

@Injectable()
export class LiveService {
  constructor(
    @InjectModel(LiveStream.name)
    private readonly liveStreamModel: Model<LiveStreamDocument>,
    @InjectModel(LiveMessage.name)
    private readonly liveMessageModel: Model<LiveMessageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Channel.name)
    private readonly channelModel: Model<ChannelDocument>,
  ) {}

  async createStream(
    streamerId: string,
    title: string,
    identityType: "user" | "channel",
    identityId: string,
  ) {
    let streamerName = "Người dùng";
    let streamerAvatar = "";

    if (identityType === "channel") {
      const channel = await this.channelModel.findById(identityId);
      if (!channel) throw new NotFoundException("Kênh không tồn tại");
      if (channel.status === "BANNED") {
        throw new BadRequestException(
          "Kênh của bạn đã bị khóa và không được phép phát trực tiếp.",
        );
      }
      if (channel.banExpiresAt && channel.banExpiresAt > new Date()) {
        throw new BadRequestException(
          `Kênh của bạn đang bị cấm phát trực tiếp đến ${new Date(channel.banExpiresAt).toLocaleString("vi-VN")} do vi phạm chính sách cộng đồng.`,
        );
      }
      streamerName = channel.channel_name;
      streamerAvatar = channel.avatar_url || "";
    } else {
      const user = await this.userModel.findById(identityId);
      if (!user) throw new NotFoundException("Người dùng không tồn tại");
      streamerName = user.username || "Tài khoản cá nhân";
      streamerAvatar = user.avatar || "";
    }

    // Tắt các phiên live cũ của streamer này nếu có để đảm bảo chỉ có 1 phiên hoạt động
    await this.liveStreamModel.updateMany(
      { streamerId, isActive: true },
      { $set: { isActive: false } },
    );

    const newStream = new this.liveStreamModel({
      streamerId,
      streamerName,
      streamerAvatar,
      identityType,
      identityId,
      title,
      isActive: true,
      viewerCount: 0, // Bắt đầu bằng 0 người xem thực tế
      earnings: 0,
    });

    return newStream.save();
  }

  // Quản lý lưu trữ người xem và host thực tế
  private activeViewers = new Map<string, Map<string, number>>();
  private activeHosts = new Map<string, number>();

  // Quản lý báo hiệu WebRTC (Signaling) in-memory
  // Map<streamId, Map<viewerId, { offer?: string; answer?: string }>>
  private signals = new Map<
    string,
    Map<string, { offer?: string; answer?: string }>
  >();

  async postSignal(
    streamId: string,
    viewerId: string,
    type: "offer" | "answer",
    sdp: string,
  ) {
    if (!this.signals.has(streamId)) {
      this.signals.set(streamId, new Map());
    }
    const streamSignals = this.signals.get(streamId);

    if (type === "offer") {
      streamSignals.set(viewerId, { offer: sdp });
    } else if (type === "answer") {
      if (streamSignals.has(viewerId)) {
        const sig = streamSignals.get(viewerId);
        sig.answer = sdp;
      }
    }
    return { success: true };
  }

  async getViewerSignal(streamId: string, viewerId: string) {
    const streamSignals = this.signals.get(streamId);
    if (!streamSignals) return null;
    return streamSignals.get(viewerId) || null;
  }

  async getStreamSignals(streamId: string) {
    const streamSignals = this.signals.get(streamId);
    if (!streamSignals) return [];
    return Array.from(streamSignals.entries()).map(([viewerId, sig]) => ({
      viewerId,
      offer: sig.offer,
      answer: sig.answer,
    }));
  }

  async registerHostHeartbeat(streamId: string) {
    this.activeHosts.set(streamId, Date.now());
  }

  async registerHeartbeat(streamId: string, viewerId: string) {
    if (!this.activeViewers.has(streamId)) {
      this.activeViewers.set(streamId, new Map<string, number>());
    }
    const viewersMap = this.activeViewers.get(streamId);
    viewersMap.set(viewerId, Date.now());

    // Dọn dẹp người xem hết hạn (quá 5 giây không gửi heartbeat)
    const now = Date.now();
    for (const [vId, lastSeen] of viewersMap.entries()) {
      if (now - lastSeen > 5000) {
        viewersMap.delete(vId);
      }
    }

    const realCount = viewersMap.size;
    await this.liveStreamModel.findByIdAndUpdate(streamId, {
      $set: { viewerCount: realCount },
    });
  }

  async endStream(streamId: string, isViolation = false) {
    this.activeViewers.delete(streamId);
    this.activeHosts.delete(streamId);
    this.signals.delete(streamId);

    // 1. Xóa tất cả tin nhắn chat của phiên live này khỏi CSDL
    try {
      await this.liveMessageModel.deleteMany({ streamId }).exec();
    } catch (err) {
      console.error("Lỗi khi xóa tin nhắn live:", err);
    }

    // 2. Xóa phiên livestream này khỏi CSDL để không lưu dấu vết
    const stream = await this.liveStreamModel.findById(streamId).exec();
    if (!stream) throw new NotFoundException("Phiên Live không tồn tại");

    if (isViolation && stream.identityType === "channel") {
      const channel = await this.channelModel.findById(stream.identityId);
      if (channel) {
        channel.strikes = (channel.strikes || 0) + 1;
        channel.banExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ban
        if (channel.strikes >= 3) {
          channel.status = "BANNED";
          try {
            await this.channelModel.db
              .model("Video")
              .updateMany(
                { channel: channel._id },
                { $set: { status: "REJECTED" } },
              );
          } catch (videoErr) {
            console.error(
              "Error rejecting videos for banned channel:",
              videoErr,
            );
          }
        }
        await channel.save();
      }
    }

    await this.liveStreamModel.findByIdAndDelete(streamId).exec();
    return stream;
  }

  async getActiveStreams() {
    const streams = await this.liveStreamModel.find({ isActive: true }).exec();
    const now = Date.now();
    const activeList = [];

    for (const stream of streams) {
      const streamId = stream._id.toString();
      const lastSeen = this.activeHosts.get(streamId);

      // Nếu là stream mới tạo dưới 15 giây hoặc nhận được heartbeat gần đây (trong vòng 12 giây)
      const streamCreatedAt =
        (stream as any).createdAt || (stream as any).created_at || new Date();
      const isNew = now - new Date(streamCreatedAt).getTime() < 15000;
      const isAlive = lastSeen && now - lastSeen < 12000;

      if (isNew || isAlive) {
        activeList.push(stream);
      } else {
        // Tự động xóa stream ma (ghost stream) trong cơ sở dữ liệu
        await this.liveStreamModel.findByIdAndDelete(stream._id).exec();
        try {
          await this.liveMessageModel.deleteMany({ streamId }).exec();
        } catch (err) {
          console.error("Lỗi khi xóa tin nhắn live ma:", err);
        }
        this.activeViewers.delete(streamId);
        this.activeHosts.delete(streamId);
        this.signals.delete(streamId);
      }
    }

    return activeList.sort((a, b) => {
      const dateA = new Date(
        (a as any).createdAt || (a as any).created_at || 0,
      ).getTime();
      const dateB = new Date(
        (b as any).createdAt || (b as any).created_at || 0,
      ).getTime();
      return dateB - dateA;
    });
  }

  async getStreamDetails(streamId: string) {
    const stream = await this.liveStreamModel.findById(streamId).exec();
    if (!stream) throw new NotFoundException("Phiên Live không tồn tại");
    return stream;
  }

  async postMessage(
    streamId: string,
    senderId: string,
    content: string,
    type: "chat" | "donation" = "chat",
    donationAmount: number = 0,
  ) {
    const user = await this.userModel.findById(senderId);
    if (!user) throw new NotFoundException("Người dùng không tồn tại");

    const message = new this.liveMessageModel({
      streamId,
      senderId,
      senderName: user.username || "Khán giả",
      senderAvatar: user.avatar || "",
      content,
      type,
      donationAmount,
    });

    return message.save();
  }

  async getMessages(streamId: string) {
    return this.liveMessageModel
      .find({ streamId })
      .sort({ createdAt: 1 })
      .limit(100)
      .exec();
  }

  async donate(streamId: string, viewerId: string, amount: number) {
    const stream = await this.liveStreamModel.findById(streamId);
    if (!stream) throw new NotFoundException("Phiên Live không tồn tại");
    if (!stream.isActive)
      throw new BadRequestException("Phiên Live đã kết thúc");

    const viewer = await this.userModel.findById(viewerId);
    if (!viewer) throw new NotFoundException("Khán giả không tồn tại");

    const amountInCoins = amount / 1000;
    if (viewer.balance < amountInCoins) {
      throw new BadRequestException(
        "Số dư ví không đủ để thực hiện quyên góp! Vui lòng nạp thêm tiền.",
      );
    }

    // 1. Trừ tiền viewer
    const updatedViewer = await this.userModel.findByIdAndUpdate(
      viewerId,
      { $inc: { balance: -amountInCoins } },
      { new: true },
    );

    // 2. Cộng 100% tiền cho Streamer (chủ sở hữu phiên live)
    const updatedStreamer = await this.userModel.findByIdAndUpdate(
      stream.streamerId,
      { $inc: { balance: amountInCoins } },
      { new: true },
    );

    // 3. Cộng doanh thu vào stream session
    await this.liveStreamModel.findByIdAndUpdate(streamId, {
      $inc: { earnings: amount },
    });

    // 4. Tạo tin nhắn thông báo Donate đặc biệt
    const viewerName = viewer.username || "Khán giả ẩn danh";
    const alertContent = `${viewerName} đã gửi tặng ${amount.toLocaleString("vi-VN")} VNĐ!`;
    const donateMessage = await this.postMessage(
      streamId,
      viewerId,
      alertContent,
      "donation",
      amount,
    );

    return {
      success: true,
      message: "Quyên góp thành công!",
      donateMessage,
      viewerBalance: updatedViewer.balance,
      streamerBalance: updatedStreamer.balance,
    };
  }

  async pinMessage(streamId: string, messageId: string) {
    const stream = await this.liveStreamModel.findById(streamId);
    if (!stream) throw new NotFoundException("Phiên Live không tồn tại");

    // Kiểm tra xem tin nhắn đã có trong danh sách ghim chưa
    const alreadyPinned = stream.pinnedMessages?.some(
      (msg: any) => msg._id?.toString() === messageId,
    );
    if (alreadyPinned) return stream;

    // Giới hạn tối đa 3 bình luận ghim
    if (stream.pinnedMessages && stream.pinnedMessages.length >= 3) {
      throw new BadRequestException(
        "Chỉ được ghim tối đa 3 bình luận. Vui lòng bỏ ghim bình luận cũ trước khi ghim mới!",
      );
    }

    const message = await this.liveMessageModel.findById(messageId);
    if (!message) throw new NotFoundException("Bình luận không tồn tại");

    const updatedStream = await this.liveStreamModel.findByIdAndUpdate(
      streamId,
      { $push: { pinnedMessages: message } },
      { new: true },
    );
    return updatedStream;
  }

  async unpinMessage(streamId: string, messageId: string) {
    const updatedStream = await this.liveStreamModel.findByIdAndUpdate(
      streamId,
      { $pull: { pinnedMessages: { _id: messageId } } },
      { new: true },
    );
    if (updatedStream && updatedStream.pinnedMessages) {
      const filtered = updatedStream.pinnedMessages.filter(
        (msg: any) => msg._id?.toString() !== messageId,
      );
      if (filtered.length !== updatedStream.pinnedMessages.length) {
        updatedStream.pinnedMessages = filtered;
        await updatedStream.save();
      }
    }
    return updatedStream;
  }

  async likeStream(streamId: string) {
    const updatedStream = await this.liveStreamModel.findByIdAndUpdate(
      streamId,
      { $inc: { likeCount: 1 } },
      { new: true },
    );
    if (!updatedStream) throw new NotFoundException("Phiên Live không tồn tại");
    return updatedStream;
  }

  async reportStream(
    streamId: string,
    reporterId: string,
    reason: string,
    content: string = "",
  ) {
    const reporter = await this.userModel.findById(reporterId);
    const reporterName = reporter
      ? reporter.username || (reporter as any).name || "Khán giả"
      : "Khán giả";

    const reportObj = {
      reporterId,
      reporterName,
      reason,
      content,
      createdAt: new Date(),
    };

    const updatedStream = await this.liveStreamModel.findByIdAndUpdate(
      streamId,
      { $push: { reports: reportObj } },
      { new: true },
    );
    if (!updatedStream) throw new NotFoundException("Phiên Live không tồn tại");
    return updatedStream;
  }
}
