import { userModel } from "../models/user";

export const userController = {
  // Đăng ký người dùng mới
  async register(username: string, phone: string, password: string) {
    const existingUser = await userModel.findByPhone(phone);
    if (existingUser) {
      return { success: false, message: 'Số điện thoại này đã được đăng ký' };
    }

    const userId = await userModel.createLocal(username, phone, password);
    return { success: true, userId };
  },

  // Lấy các kênh đã theo dõi cho Layout/Sidebar
  async getSidebarData(userId: number) {
    return await userModel.getFollowedChannels(userId);
  }
};
