import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Video, VideoDocument } from "./schemas/video.schema";
import { User, UserDocument } from "../users/schemas/user.schema";
import { Fingerprint, FingerprintDocument } from "./schemas/fingerprint.schema";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { NotificationsService } from "../notifications/notifications.service";

function makeDiacriticRegex(term: string): string {
  if (!term) return "";
  const escaped = term.toLowerCase().replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  return escaped
    .replace(/[aàáảãạăằắẳẵặâầấẩẫậ]/g, "[aàáảãạăằắẳẵặâầấẩẫậ]")
    .replace(/[dđ]/g, "[dđ]")
    .replace(/[eèéẻẽẹêềếểễệ]/g, "[eèéẻẽẹêềếểễệ]")
    .replace(/[iìíỉĩị]/g, "[iìíỉĩị]")
    .replace(/[oòóỏõọôồốổỗộơờớởỡợ]/g, "[oòóỏõọôồốổỗộơờớởỡợ]")
    .replace(/[uùúủũụưừứửữự]/g, "[uùúủũụưừứửữự]")
    .replace(/[yỳýỷỹỵ]/g, "[yỳýỷỹỵ]");
}

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Fingerprint.name) private fingerprintModel: Model<FingerprintDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    // Tự động chuyển tất cả các video cũ hoặc đang PENDING sang APPROVED để hiển thị ngay lập tức
    const result = await this.videoModel.updateMany(
      {
        $or: [{ status: { $exists: false } }, { status: "PENDING" }],
      },
      { $set: { status: "APPROVED" } },
    );
    if (result.modifiedCount > 0) {
      console.log(
        `[System] Đã tự động kích hoạt hiển thị ${result.modifiedCount} video sang trạng thái APPROVED.`,
      );
    }
  }
  async checkUserStatus(userId?: string) {
    if (!userId || userId === "undefined" || userId === "null") return;
    if (Types.ObjectId.isValid(userId)) {
      const user = await this.userModel.findById(userId).select("status").exec();
      if (user && (user.status === "LOCKED" || user.status === "DELETED")) {
        throw new HttpException(
          "Tài khoản của bạn đã bị khóa hoặc bị xóa. Tạm thời không thể xem video.",
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }

  async checkPermission(video: any, userId?: string): Promise<boolean> {
    const isPaid =
      video.is_free === false ||
      String(video.is_free) === "false" ||
      (video.price && Number(video.price) > 0);
    if (!isPaid) return true;
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) return false;

    try {
      // 1. Kiểm tra nếu user đã mua video
      const user = await this.userModel.findById(userId).exec();
      if (
        user &&
        user.purchased_videos &&
        user.purchased_videos.some(
          (id) => id.toString() === video._id.toString(),
        )
      ) {
        return true;
      }

      // 2. Kiểm tra nếu user là chủ sở hữu kênh của video
      const channelId = video.channel?._id || video.channel;
      if (channelId) {
        const channel = await this.videoModel.db
          .model("Channel")
          .findById(channelId)
          .exec();
        if (channel && channel.user?.toString() === userId) {
          return true;
        }
      }
    } catch (err) {
      console.error("[checkPermission ERROR]:", err);
    }

    return false;
  }

  async redactVideoUrl(video: any, userId?: string): Promise<any> {
    if (!video) return null;
    const videoObj = video.toObject ? video.toObject() : video;
    const hasPermission = await this.checkPermission(videoObj, userId);
    if (!hasPermission) {
      videoObj.video_url = "";
    }
    return videoObj;
  }

  async checkCopyrightViolation(createVideoDto: any): Promise<boolean> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Gemini AI] GEMINI_API_KEY is not defined. Skipping copyright check.",
      );
      return false;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const channelId = createVideoDto.channel;
      const words = createVideoDto.title
        .split(/\s+/)
        .filter((w: string) => w.length > 2);
      const searchConditions = words.map((w: string) => ({
        title: { $regex: w, $options: "i" },
      }));

      const query =
        searchConditions.length > 0
          ? {
              $or: searchConditions,
              status: "APPROVED",
              channel: { $ne: new Types.ObjectId(channelId) },
            }
          : {
              status: "APPROVED",
              channel: { $ne: new Types.ObjectId(channelId) },
            };

      const candidates = await this.videoModel
        .find(query)
        .limit(10)
        .select("title description")
        .exec();
      if (candidates.length === 0) return false;

      const candidatesListString = candidates
        .map(
          (v, i) =>
            `[ID: ${i}] Title: "${v.title}", Description: "${v.description || ""}"`,
        )
        .join("\n");

      const prompt = `
You are a copyright duplication detector AI for MyTube.
A user is attempting to upload a new video:
New Video Title: "${createVideoDto.title}"
New Video Description: "${createVideoDto.description || ""}"

Here is the list of existing videos from other creators on the platform:
${candidatesListString}

Determine if the new video metadata represents an illegal duplicate upload of any existing video content (i.e. the topic, title, and description are semantically the same or extremely similar, meaning it's the exact same content re-uploaded). We allow similar topics but NOT duplicate re-uploads.
Respond with a JSON object in this format:
{
  "isDuplicate": true / false,
  "reason": "Brief explanation of why it is or is not a duplicate"
}
Do not wrap your response in markdown formatting or write anything other than the raw JSON block.
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      let jsonString = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      const decision = JSON.parse(jsonString.trim());

      console.log("[Gemini Copyright Decision]:", decision);
      return decision.isDuplicate === true;
    } catch (err) {
      console.error("[checkCopyrightViolation Error]:", err);
      return false;
    }
  }

  async checkCopyright(dto: { fingerprint: string; title: string; description?: string; channelId: string }) {
    let isViolation = false;
    let reason = "";

    // 1. Kiểm tra vân tay trước
    if (dto.fingerprint) {
      const match = await this.fingerprintModel.findOne({ fingerprint: dto.fingerprint }).exec();
      if (match) {
        isViolation = true;
        reason = `Phát hiện tệp video trùng lặp hoàn toàn với video đã tồn tại trên hệ thống (Tiêu đề gốc: "${match.title}").`;
      }
    }

    // 2. Nếu không trùng vân tay, dùng Gemini kiểm tra tiêu đề/mô tả trùng lặp
    if (!isViolation) {
      isViolation = await this.checkCopyrightViolation({
        title: dto.title,
        description: dto.description || "",
        channel: dto.channelId,
      });
      if (isViolation) {
        reason = "Phát hiện nội dung (tiêu đề/mô tả) trùng lặp bản quyền cực kỳ giống với một video khác trên hệ thống.";
      }
    }

    // Nếu vi phạm bản quyền, xử lý cộng gậy cảnh cáo hoặc khóa kênh
    if (isViolation) {
      const channelId = dto.channelId;
      const channel = await this.videoModel.db
        .model("Channel")
        .findById(channelId)
        .exec();
      if (channel) {
        channel.strikes = (channel.strikes || 0) + 1;
        if (channel.strikes >= 3) {
          channel.status = "BANNED";
          await channel.save();
          // Reject all videos from this channel
          await this.videoModel.updateMany(
            { channel: channelId },
            { status: "REJECTED" },
          );
          throw new HttpException(
            `Kênh của bạn đã bị KHÓA vĩnh viễn do nhận đủ 3 gậy bản quyền trùng lặp nội dung. Lý do: ${reason}`,
            HttpStatus.FORBIDDEN,
          );
        } else {
          await channel.save();
          throw new HttpException(
            `Phát hiện trùng lặp nội dung bản quyền. Kênh của bạn nhận thêm 1 gậy cảnh cáo (${channel.strikes}/3). Lý do: ${reason}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          `Phát hiện trùng lặp nội dung bản quyền. Lý do: ${reason}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return {
      success: true,
      message: "Video hợp lệ.",
    };
  }

  async expandSearchQuery(search: string): Promise<string[]> {
    const cleanQuery = (search || "").trim().toLowerCase();
    
    // 1. Khởi tạo mảng các từ khóa mở rộng với từ khóa gốc
    let expandedTerms: string[] = [search];

    // 2. Thêm các từ khóa từ từ điển đồng nghĩa cục bộ (Local Fallback)
    const fallbackSynonyms: Record<string, string[]> = {
      "music": ["music", "nhạc", "nhac", "bài hát", "bai hat", "âm nhạc", "am nhac", "ca khúc", "ca khuc", "song"],
      "nhạc": ["nhạc", "nhac", "music", "song", "bài hát", "bai hat", "âm nhạc", "am nhac", "ca khúc", "ca khuc"],
      "nhac": ["nhạc", "nhac", "music", "song", "bài hát", "bai hat", "âm nhạc", "am nhac", "ca khúc", "ca khuc"],
      "song": ["song", "bài hát", "bai hat", "music", "nhạc", "nhac", "ca khúc"],
      "bài hát": ["song", "bài hát", "bai hat", "music", "nhạc", "nhac", "ca khúc"],
      "bai hat": ["song", "bài hát", "bai hat", "music", "nhạc", "nhac", "ca khúc"],
      "phim": ["phim", "movie", "film", "cinema", "video", "clip"],
      "movie": ["movie", "phim", "film", "video", "clip"],
      "film": ["film", "phim", "movie", "video", "clip"],
      "game": ["game", "gaming", "trò chơi", "tro choi", "chơi game", "play"],
      "gaming": ["game", "gaming", "trò chơi", "tro choi", "chơi game"],
      "trò chơi": ["game", "gaming", "trò chơi", "tro choi", "chơi game"],
      "tro choi": ["game", "gaming", "trò chơi", "tro choi", "chơi game"],
      "live": ["live", "livestream", "trực tiếp", "truc tiep", "stream"],
      "livestream": ["live", "livestream", "trực tiếp", "truc tiep", "stream"],
      "trực tiếp": ["live", "livestream", "trực tiếp", "truc tiep", "stream"],
      "truc tiep": ["live", "livestream", "trực tiếp", "truc tiep", "stream"],
      "học": ["học", "hoc", "learn", "study", "hướng dẫn", "tutorial"],
      "hoc": ["học", "hoc", "learn", "study", "hướng dẫn", "tutorial"],
      "learn": ["học", "hoc", "learn", "study", "hướng dẫn", "tutorial"],
      "study": ["học", "hoc", "learn", "study", "hướng dẫn", "tutorial"],
      "hướng dẫn": ["hướng dẫn", "huong dan", "tutorial", "guide", "how to"],
      "huong dan": ["hướng dẫn", "huong dan", "tutorial", "guide", "how to"],
      "tutorial": ["tutorial", "guide", "hướng dẫn", "huong dan", "how to"],
    };

    // Tra cứu đồng nghĩa cho bất cứ từ khóa nào xuất hiện trong query gốc
    for (const key of Object.keys(fallbackSynonyms)) {
      if (cleanQuery.includes(key)) {
        expandedTerms = Array.from(new Set([...expandedTerms, ...fallbackSynonyms[key]]));
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return expandedTerms;
    }
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
You are a search query expansion assistant for MyTube.
The user is searching for: "${search}"
Please generate a list of related search terms, synonyms, and translations in both English and Vietnamese.
For example:
- If query is "student", return ["student", "học sinh", "sinh viên", "học tập", "school", "trường học"]
- If query is "nhạc trẻ", return ["nhạc trẻ", "pop music", "vpop", "âm nhạc", "music"]

Return ONLY a JSON array of strings containing the query and its expansions, up to 10 terms. Do not include markdown formatting or extra text.
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      let jsonString = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      const terms = JSON.parse(jsonString.trim());
      if (Array.isArray(terms) && terms.length > 0) {
        expandedTerms = Array.from(new Set([...expandedTerms, ...terms]));
      }
      return expandedTerms;
    } catch (err) {
      console.error("[expandSearchQuery Error]:", err);
      return expandedTerms;
    }
  }

  async getHomeVideos(search?: string, userId?: string, categoryId?: string) {
    await this.checkUserStatus(userId);
    const query: any = { status: "APPROVED" };

    if (search) {
      const searchTerms = await this.expandSearchQuery(search);
      const searchConditions: any[] = [];
      for (const term of searchTerms) {
        searchConditions.push({ title: { $regex: makeDiacriticRegex(term), $options: "i" } });
        searchConditions.push({ description: { $regex: makeDiacriticRegex(term), $options: "i" } });
      }
      query.$or = searchConditions;

      let videos = await this.videoModel
        .find(query)
        .populate("channel")
        .exec();

      // Exclude ghost videos (where channel is null)
      videos = videos.filter((v) => v.channel !== null && v.channel !== undefined);

      // Sort to prioritize same language / closest matches containing original search query
      videos.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        const descA = (a.description || "").toLowerCase();
        const descB = (b.description || "").toLowerCase();
        const term = search.toLowerCase();

        const aHasTitle = titleA.includes(term);
        const bHasTitle = titleB.includes(term);
        if (aHasTitle && !bHasTitle) return -1;
        if (!aHasTitle && bHasTitle) return 1;

        const aHasDesc = descA.includes(term);
        const bHasDesc = descB.includes(term);
        if (aHasDesc && !bHasDesc) return -1;
        if (!aHasDesc && bHasDesc) return 1;

        return 0;
      });

      return Promise.all(
        videos.slice(0, 25).map((video) => this.redactVideoUrl(video, userId)),
      );
    }

    if (categoryId) {
      query.category_id = categoryId;
    }

    let recommendedCategoryId: string | null = null;

    if (userId && userId !== "undefined" && userId !== "null" && Types.ObjectId.isValid(userId) && !categoryId && !search) {
      try {
        const user = await this.userModel
          .findById(userId)
          .populate({
            path: "history",
            select: "category_id",
          })
          .exec();

        if (user && user.history && user.history.length > 0) {
          const categoryCounts: Record<string, number> = {};
          for (const item of user.history as any[]) {
            if (item && item.category_id) {
              categoryCounts[item.category_id] =
                (categoryCounts[item.category_id] || 0) + 1;
            }
          }
          let maxCount = 0;
          for (const catId of Object.keys(categoryCounts)) {
            if (categoryCounts[catId] > maxCount) {
              maxCount = categoryCounts[catId];
              recommendedCategoryId = catId;
            }
          }
        }
      } catch (err) {
        console.error("[category recommendation error]:", err);
      }
    }

    let videos: any[] = [];
    if (recommendedCategoryId) {
      const recommendedVideos = await this.videoModel
        .find({ ...query, category_id: recommendedCategoryId })
        .populate("channel")
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();

      const recommendedIds = recommendedVideos.map((v) => v._id.toString());
      const otherVideos = await this.videoModel
        .find({ ...query, _id: { $nin: recommendedIds } })
        .populate("channel")
        .sort({ createdAt: -1 })
        .limit(15)
        .exec();

      videos = [...recommendedVideos, ...otherVideos].filter((v) => v.channel !== null && v.channel !== undefined);
    } else {
      videos = await this.videoModel
        .find(query)
        .populate("channel")
        .sort({ view_count: -1, createdAt: -1 })
        .limit(20)
        .exec();
      videos = videos.filter((v) => v.channel !== null && v.channel !== undefined);
    }

    return Promise.all(
      videos.map((video) => this.redactVideoUrl(video, userId)),
    );
  }

  async getShorts(userId?: string) {
    await this.checkUserStatus(userId);
    let videos = await this.videoModel
      .find({ is_short: true, status: "APPROVED" })
      .populate("channel")
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();

    videos = videos.filter((v) => v.channel !== null && v.channel !== undefined);

    return Promise.all(
      videos.map((video) => this.redactVideoUrl(video, userId)),
    );
  }

  async getVideoDetails(id: string, userId?: string) {
    await this.checkUserStatus(userId);
    const video = await this.videoModel.findById(id).populate("channel").exec();
    if (!video) return null;

    const relatedVideos = await this.videoModel
      .find({ _id: { $ne: id }, status: "APPROVED" })
      .populate("channel")
      .limit(10)
      .exec();

    const redactedVideo = await this.redactVideoUrl(video, userId);
    const redactedRelated = await Promise.all(
      relatedVideos.map((v) => this.redactVideoUrl(v, userId)),
    );

    return {
      video: redactedVideo,
      relatedVideos: redactedRelated,
      comments: [],
    };
  }

  async create(createVideoDto: any) {
    // 1. Kiểm tra bản quyền trùng lặp bằng Gemini chỉ khi chưa check bằng vân tay trước đó
    if (!createVideoDto.fingerprint) {
      const isViolation = await this.checkCopyrightViolation(createVideoDto);
      if (isViolation) {
        const channelId = createVideoDto.channel;
        const channel = await this.videoModel.db
          .model("Channel")
          .findById(channelId)
          .exec();
        if (channel) {
          channel.strikes = (channel.strikes || 0) + 1;
          if (channel.strikes >= 3) {
            channel.status = "BANNED";
            await channel.save();
            // Reject all videos from this channel
            await this.videoModel.updateMany(
              { channel: channelId },
              { status: "REJECTED" },
            );
            throw new HttpException(
              "Kênh của bạn đã bị KHÓA vĩnh viễn do nhận đủ 3 gậy bản quyền trùng lặp nội dung.",
              HttpStatus.FORBIDDEN,
            );
          } else {
            await channel.save();
            throw new HttpException(
              `Phát hiện trùng lặp nội dung bản quyền. Kênh của bạn nhận thêm 1 gậy cảnh cáo (${channel.strikes}/3).`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }
    }

    const is_short = createVideoDto.duration
      ? Number(createVideoDto.duration) <= 90
      : false;
    const newVideo = new this.videoModel({
      ...createVideoDto,
      is_short,
      status: "APPROVED",
    });
    const savedVideo = await newVideo.save();

    // 2. Đăng ký dấu vân tay mới của video để chặn trùng lặp sau này
    if (createVideoDto.fingerprint) {
      try {
        await new this.fingerprintModel({
          fingerprint: createVideoDto.fingerprint,
          title: savedVideo.title,
          video: savedVideo._id,
          channel: savedVideo.channel,
        }).save();
        console.log(`[Fingerprint Registered]: ${createVideoDto.fingerprint}`);
      } catch (fErr) {
        console.error("[Fingerprint Registration Error]:", fErr);
      }
    }

    try {
      const channelId = createVideoDto.channel;
      const channel = await this.videoModel.db
        .model("Channel")
        .findById(channelId)
        .exec();
      if (
        channel &&
        Array.isArray(channel.subscribers) &&
        channel.subscribers.length > 0
      ) {
        for (const subId of channel.subscribers) {
          await this.notificationsService.createNotification({
            user: subId as any,
            type: "new_video",
            actor_name: channel.channel_name,
            actor_avatar: channel.avatar_url || "/assets/img/avata.jpg",
            video_title: savedVideo.title,
            video_thumb: savedVideo.thumbnail_url || "",
            message: `Kênh ${channel.channel_name} vừa tải lên video mới: "${savedVideo.title}"`,
            target_id: savedVideo._id.toString(),
            actor_id: channel._id.toString(),
          });
        }
      }
    } catch (notificationErr) {
      console.error(
        "[UPLOAD NOTIFICATION ERROR]: Failed to notify subscribers:",
        notificationErr,
      );
    }

    return savedVideo;
  }

  // --- HÀM DÀNH CHO STAFF ---
  async getPendingVideos() {
    return this.videoModel
      .find({ status: "PENDING" })
      .populate("channel")
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveVideo(id: string) {
    return this.videoModel.findByIdAndUpdate(
      id,
      { status: "APPROVED" },
      { new: true },
    );
  }

  async rejectVideo(id: string) {
    return this.videoModel.findByIdAndUpdate(
      id,
      { status: "REJECTED" },
      { new: true },
    );
  }

  async getStudioVideos(channelId?: string, search?: string, userId?: string) {
    if (!userId || userId === "undefined" || userId === "null") {
      throw new HttpException("Missing userId", HttpStatus.BAD_REQUEST);
    }
    await this.checkUserStatus(userId);

    // 1. Lấy tất cả channel thuộc về userId
    const userChannels = await this.videoModel.db
      .model("Channel")
      .find({ user: userId })
      .exec();
    const userChannelIds = userChannels.map((c) => c._id.toString());

    // 2. Lọc danh sách channelId được yêu cầu
    let targetChannelIds: string[] = [...userChannelIds];
    if (channelId && channelId !== "all") {
      const requestedIds = channelId.split(",");
      targetChannelIds = requestedIds.filter((id) => userChannelIds.includes(id));
    }

    // Nếu không sở hữu bất kỳ channel nào trong danh sách yêu cầu, trả về mảng rỗng
    if (targetChannelIds.length === 0) {
      return [];
    }

    const query: any = { channel: { $in: targetChannelIds } };
    if (search) {
      query.title = { $regex: makeDiacriticRegex(search), $options: "i" };
    }

    const videos = await this.videoModel
      .find(query)
      .populate("channel")
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(
      videos.map((video) => this.redactVideoUrl(video, userId)),
    );
  }

  async update(id: string, updateData: any) {
    // Tự động tính toán lại nếu thời lượng của video thay đổi
    if (updateData.duration !== undefined) {
      updateData.is_short = Number(updateData.duration) <= 90;
    }
    return this.videoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string) {
    const video = await this.videoModel.findById(id).exec();
    if (video) {
      if (video.video_public_id || video.thumbnail_public_id) {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          if (video.video_public_id) {
            await cloudinary.uploader.destroy(video.video_public_id, {
              resource_type: "video",
            });
          }
          if (video.thumbnail_public_id) {
            await cloudinary.uploader.destroy(video.thumbnail_public_id);
          }
          console.log(`Cloudinary resources deleted for video ${id}`);
        } catch (err) {
          console.error(
            `Error deleting Cloudinary assets for video ${id}:`,
            err,
          );
        }
      }
    }
    return this.videoModel.findByIdAndDelete(id).exec();
  }

  async getStudioOverview(userId: string, channelId?: string) {
    if (!userId || userId === "undefined" || userId === "null") {
      throw new HttpException("Missing userId", HttpStatus.BAD_REQUEST);
    }
    // 1. Get relevant channels
    let channelsQuery: any = { user: userId };
    if (channelId && channelId !== "all") {
      channelsQuery = { _id: channelId, user: userId };
    }

    const userChannels = await this.videoModel.db
      .model("Channel")
      .find(channelsQuery)
      .exec();
    const channelIds = userChannels.map((c) => c._id);

    if (channelIds.length === 0) {
      return {
        summary: {
          totalViews: 0,
          totalSubscribers: 0,
          totalVideos: 0,
          totalInteractions: 0,
        },
        topVideos: [],
        topChannel: null,
      };
    }

    // 2. Get videos stats
    const videos = await this.videoModel
      .find({ channel: { $in: channelIds } })
      .exec();
    const totalViews = videos.reduce((acc, v) => acc + (v.view_count || 0), 0);
    const totalVideos = videos.length;

    // Subscribers (simple sum for now)
    const totalSubscribers = userChannels.reduce(
      (acc, c) => acc + (c.sub_count || 0),
      0,
    );

    // Top videos
    const topVideos = await this.videoModel
      .find({ channel: { $in: channelIds } })
      .sort({ view_count: -1 })
      .limit(5)
      .exec();

    // Top channel
    const topChannel = userChannels.sort(
      (a, b) => (b.sub_count || 0) - (a.sub_count || 0),
    )[0];

    // 3. Get User Balance and Frozen Balance
    const user = await this.userModel.findById(userId).exec();
    let frozenBalance = 0;
    try {
      const pendingWithdrawals = await this.videoModel.db
        .model("Withdrawal")
        .find({ userId: new Types.ObjectId(userId), status: "PENDING" })
        .exec();
      frozenBalance = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    } catch (err) {
      console.error("[getStudioOverview frozenBalance calculation error]:", err);
    }

    return {
      summary: {
        totalViews,
        totalSubscribers,
        totalVideos,
        totalInteractions: totalViews + totalSubscribers,
        balance: (user?.balance || 0) * 1000,
        frozenBalance,
      },
      topVideos,
      topChannel,
    };
  }
  async toggleLike(id: string, userId: string) {
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) {
      return { success: false };
    }
    const userObjId = new Types.ObjectId(userId);
    const video = await this.videoModel.findById(id);
    if (!video) return { success: false };

    const isLiked = video.likes.map((id) => id.toString()).includes(userId);

    if (isLiked) {
      // Unlike
      await this.videoModel.findByIdAndUpdate(id, {
        $pull: { likes: userObjId },
      });
    } else {
      // Like
      await this.videoModel.findByIdAndUpdate(id, {
        $addToSet: { likes: userObjId },
        $pull: { dislikes: userObjId },
      });
    }

    const updatedVideo = await this.videoModel.findById(id);
    return {
      success: true,
      isLiked: updatedVideo.likes.map((id) => id.toString()).includes(userId),
      isDisliked: updatedVideo.dislikes
        .map((id) => id.toString())
        .includes(userId),
      likesCount: updatedVideo.likes.length,
      dislikesCount: updatedVideo.dislikes.length,
    };
  }

  async toggleDislike(id: string, userId: string) {
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) {
      return { success: false };
    }
    const userObjId = new Types.ObjectId(userId);
    const video = await this.videoModel.findById(id);
    if (!video) return { success: false };

    const isDisliked = video.dislikes
      .map((id) => id.toString())
      .includes(userId);

    if (isDisliked) {
      // Un-dislike
      await this.videoModel.findByIdAndUpdate(id, {
        $pull: { dislikes: userObjId },
      });
    } else {
      // Dislike
      await this.videoModel.findByIdAndUpdate(id, {
        $addToSet: { dislikes: userObjId },
        $pull: { likes: userObjId },
      });
    }

    const updatedVideo = await this.videoModel.findById(id);
    return {
      success: true,
      isLiked: updatedVideo.likes.map((id) => id.toString()).includes(userId),
      isDisliked: updatedVideo.dislikes
        .map((id) => id.toString())
        .includes(userId),
      likesCount: updatedVideo.likes.length,
      dislikesCount: updatedVideo.dislikes.length,
    };
  }

  async getLikedVideos(userId: string) {
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) {
      return [];
    }
    await this.checkUserStatus(userId);
    try {
      const userObjId = new Types.ObjectId(userId);
      const videos = await this.videoModel
        .find({
          $or: [{ likes: userId }, { likes: userObjId }],
        })
        .populate("channel")
        .exec();

      return Promise.all(
        videos.map((video) => this.redactVideoUrl(video, userId)),
      );
    } catch (error: any) {
      return { error: error.message, stack: error.stack };
    }
  }

  async incrementViewCount(id: string) {
    return this.videoModel.findByIdAndUpdate(
      id,
      { $inc: { view_count: 1 } },
      { new: true },
    );
  }
}
