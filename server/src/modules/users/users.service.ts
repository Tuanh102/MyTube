import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).exec();
  }

  async getUserById(id: string) {
    if (!id) return null;
    
    // 1. Kiểm tra nếu là MongoDB ObjectId hợp lệ (24 ký tự hex)
    if (Types.ObjectId.isValid(id)) {
      const user = await this.userModel.findById(id).exec();
      if (user) return user;
    }
    
    // 2. Dự phòng (Fallback): Dò tìm theo OAuth IDs của mạng xã hội
    return this.userModel.findOne({
      $or: [
        { facebook_id: id },
        { google_id: id },
        { github_id: id },
        { discord_id: id }
      ]
    }).exec();
  }

  async getUserByEmail(email: string) {
    if (!email) return null;
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async getUserByUsername(username: string) {
    if (!username) return null;
    return this.userModel.findOne({ username }).exec();
  }

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ phone }).exec();
    if (user && user.password === pass) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async register(userData: { username: string; phone: string; password: string }) {
    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingUser = await this.userModel.findOne({ phone: userData.phone }).exec();
    if (existingUser) {
      throw new Error('Số điện thoại này đã được sử dụng');
    }

    const newUser = await this.userModel.create({
      username: userData.username,
      phone: userData.phone,
      password: userData.password,
      role: 'viewer',
      avatar: '/assets/img/default-avatar.png'
    });

    return newUser;
  }
  async createOrUpdateGoogleUser(googleData: {
    google_id: string;
    username: string;
    email: string;
    avatar: string;
  }) {
    let user = await this.userModel.findOne({ 
      $or: [{ google_id: googleData.google_id }, { email: googleData.email }] 
    }).exec();

    if (user) {
      // Update existing user info from Google
      user.username = googleData.username;
      user.avatar = googleData.avatar;
      user.google_id = googleData.google_id;
      await user.save();
    } else {
      // Create new user
      user = await this.userModel.create({
        username: googleData.username,
        email: googleData.email,
        avatar: googleData.avatar,
        google_id: googleData.google_id,
        role: 'viewer'
      });
    }

    return user;
  }

  async createOrUpdateFacebookUser(facebookData: {
    facebook_id: string;
    username: string;
    email: string;
    avatar: string;
  }) {
    console.log('[FACEBOOK LOGIN] Dữ liệu nhận từ Client:', facebookData);

    try {
      let user;

      // Chỉ tìm kiếm theo email nếu email thực sự hợp lệ (không rỗng)
      if (facebookData.email && facebookData.email.trim() !== '') {
        user = await this.userModel.findOne({ 
          $or: [
            { facebook_id: facebookData.facebook_id },
            { email: facebookData.email.toLowerCase() }
          ] 
        }).exec();
      } else {
        // Nếu không có email, chỉ tìm chính xác theo facebook_id
        user = await this.userModel.findOne({ 
          facebook_id: facebookData.facebook_id 
        }).exec();
      }

      if (user) {
        console.log(`[FACEBOOK LOGIN] Tìm thấy người dùng hiện tại: ${user.username} (ID: ${user._id})`);
        // Cập nhật thông tin mới nhất từ Facebook
        user.username = facebookData.username || user.username;
        user.avatar = facebookData.avatar || user.avatar;
        user.facebook_id = facebookData.facebook_id;
        
        // Chỉ cập nhật email nếu trước đây user chưa có email và email Facebook gửi qua hợp lệ
        if (!user.email && facebookData.email && facebookData.email.trim() !== '') {
          user.email = facebookData.email.toLowerCase();
        }
        await user.save();
      } else {
        console.log('[FACEBOOK LOGIN] Tạo người dùng mới đăng nhập bằng Facebook.');
        // Tạo user mới đăng nhập lần đầu bằng Facebook
        user = await this.userModel.create({
          username: facebookData.username,
          email: (facebookData.email && facebookData.email.trim() !== '') ? facebookData.email.toLowerCase() : undefined,
          avatar: facebookData.avatar || '/assets/img/default-avatar.png',
          facebook_id: facebookData.facebook_id,
          role: 'viewer'
        });
      }

      return user;
    } catch (error) {
      console.error('[FACEBOOK LOGIN ERROR] Lỗi tại UsersService:', error);
      throw error;
    }
  }

  async createOrUpdateGithubUser(githubData: {
    github_id: string;
    username: string;
    email: string;
    avatar: string;
  }) {
    console.log('[GITHUB LOGIN] Dữ liệu nhận từ Client:', githubData);

    try {
      let user;

      // Chỉ tìm kiếm theo email nếu email thực sự hợp lệ (không rỗng)
      if (githubData.email && githubData.email.trim() !== '') {
        user = await this.userModel.findOne({ 
          $or: [
            { github_id: githubData.github_id },
            { email: githubData.email.toLowerCase() }
          ] 
        }).exec();
      } else {
        // Nếu không có email, chỉ tìm chính xác theo github_id
        user = await this.userModel.findOne({ 
          github_id: githubData.github_id 
        }).exec();
      }

      if (user) {
        console.log(`[GITHUB LOGIN] Tìm thấy người dùng hiện tại: ${user.username} (ID: ${user._id})`);
        // Cập nhật thông tin mới nhất từ Github
        user.username = githubData.username || user.username;
        user.avatar = githubData.avatar || user.avatar;
        user.github_id = githubData.github_id;
        
        if (!user.email && githubData.email && githubData.email.trim() !== '') {
          user.email = githubData.email.toLowerCase();
        }
        await user.save();
      } else {
        console.log('[GITHUB LOGIN] Tạo người dùng mới đăng nhập bằng Github.');
        user = await this.userModel.create({
          username: githubData.username,
          email: (githubData.email && githubData.email.trim() !== '') ? githubData.email.toLowerCase() : undefined,
          avatar: githubData.avatar || '/assets/img/default-avatar.png',
          github_id: githubData.github_id,
          role: 'viewer'
        });
      }

      return user;
    } catch (error) {
      console.error('[GITHUB LOGIN ERROR] Lỗi tại UsersService:', error);
      throw error;
    }
  }

  async createOrUpdateDiscordUser(discordData: {
    discord_id: string;
    username: string;
    email: string;
    avatar: string;
  }) {
    console.log('[DISCORD LOGIN] Dữ liệu nhận từ Client:', discordData);

    try {
      let user;

      // Chỉ tìm kiếm theo email nếu email thực sự hợp lệ (không rỗng)
      if (discordData.email && discordData.email.trim() !== '') {
        user = await this.userModel.findOne({ 
          $or: [
            { discord_id: discordData.discord_id },
            { email: discordData.email.toLowerCase() }
          ] 
        }).exec();
      } else {
        // Nếu không có email, chỉ tìm chính xác theo discord_id
        user = await this.userModel.findOne({ 
          discord_id: discordData.discord_id 
        }).exec();
      }

      if (user) {
        console.log(`[DISCORD LOGIN] Tìm thấy người dùng hiện tại: ${user.username} (ID: ${user._id})`);
        // Cập nhật thông tin mới nhất từ Discord
        user.username = discordData.username || user.username;
        user.avatar = discordData.avatar || user.avatar;
        user.discord_id = discordData.discord_id;
        
        if (!user.email && discordData.email && discordData.email.trim() !== '') {
          user.email = discordData.email.toLowerCase();
        }
        await user.save();
      } else {
        console.log('[DISCORD LOGIN] Tạo người dùng mới đăng nhập bằng Discord.');
        user = await this.userModel.create({
          username: discordData.username,
          email: (discordData.email && discordData.email.trim() !== '') ? discordData.email.toLowerCase() : undefined,
          avatar: discordData.avatar || '/assets/img/default-avatar.png',
          discord_id: discordData.discord_id,
          role: 'viewer'
        });
      }

      return user;
    } catch (error) {
      console.error('[DISCORD LOGIN ERROR] Lỗi tại UsersService:', error);
      throw error;
    }
  }

  async getHistory(userId: string) {
    let user = await this.userModel.findById(new Types.ObjectId(userId)).populate({
      path: 'history',
      populate: { path: 'channel' }
    }).exec();
    
    if (!user) {
        user = await this.userModel.findById(userId).populate({
            path: 'history',
            populate: { path: 'channel' }
        }).exec();
    }
    return user?.history || [];
  }

  async getPurchasedVideos(userId: string) {
    let user = await this.userModel.findById(new Types.ObjectId(userId)).populate({
      path: 'purchased_videos',
      populate: { path: 'channel' }
    }).exec();

    if (!user) {
      user = await this.userModel.findById(userId).populate({
        path: 'purchased_videos',
        populate: { path: 'channel' }
      }).exec();
    }

    return user?.purchased_videos || [];
  }

  async addToHistory(userId: string, videoId: string) {
    const user = await this.userModel.findById(new Types.ObjectId(userId)).exec();
    if (!user) return { success: false };

    // Remove if already exists (to move to front)
    user.history = (user.history || []).filter(id => id.toString() !== videoId);
    
    // Add to front
    user.history.unshift(new Types.ObjectId(videoId) as any);
    
    // Limit to 50 items
    if (user.history.length > 50) {
      user.history = user.history.slice(0, 50);
    }

    user.markModified('history');
    await user.save();
    return { success: true };
  }

  async upgradePremium(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('Không tìm thấy người dùng này');
    }

    if (user.is_premium) {
      const { password, ...result } = user.toObject();
      return { success: true, user: result, message: 'Tài khoản của bạn đã là Premium từ trước' };
    }

    if ((user.balance || 0) < 25) {
      throw new Error('Số dư tài khoản không đủ để nâng cấp Premium (Cần $25)');
    }

    // 1. Trừ tiền người dùng và đặt Premium (30 ngày)
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.balance = (user.balance || 0) - 25;
    user.is_premium = true;
    user.premium_type = 'PREMIUM_COINS';
    user.premium_purchased_at = purchasedAt;
    user.premium_expires_at = expiresAt;
    await user.save();

    // 2. Cộng 25 vào số dư của tài khoản Admin
    try {
      const admin = await this.userModel.findOne({ role: 'admin' }).exec();
      if (admin) {
        admin.balance = (admin.balance || 0) + 25;
        await admin.save();
        console.log(`[PREMIUM UPGRADE] Đã cộng 25 coins thành công vào tài khoản Admin (ID: ${admin._id})`);
      } else {
        console.log('[PREMIUM UPGRADE WARNING] Không tìm thấy tài khoản admin nào để cộng 25 coins.');
      }
    } catch (adminErr) {
      console.error('[PREMIUM UPGRADE ADMIN ERROR]: Lỗi khi cộng tiền admin:', adminErr);
    }

    const { password, ...result } = user.toObject();
    return { success: true, user: result, message: 'Nâng cấp tài khoản Premium thành công!' };
  }
}
