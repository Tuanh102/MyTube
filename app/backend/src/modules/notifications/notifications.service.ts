import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Notification,
  NotificationDocument,
} from "./schemas/notification.schema";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(data: Partial<Notification>) {
    const newNotification = new this.notificationModel(data);
    return newNotification.save();
  }

  async getUserNotifications(userId: string, filter: string) {
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) {
      return [];
    }
    const query: any = { user: userId };
    if (filter === "unread") {
      query.is_read = false;
    }
    return this.notificationModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async markAllRead(userId: string) {
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) {
      return { success: false };
    }
    await this.notificationModel
      .updateMany({ user: userId, is_read: false }, { is_read: true })
      .exec();
    return { success: true };
  }

  async markSingleRead(id: string) {
    await this.notificationModel
      .findByIdAndUpdate(id, { is_read: true })
      .exec();
    return { success: true };
  }

  async deleteNotification(id: string) {
    await this.notificationModel.findByIdAndDelete(id).exec();
    return { success: true };
  }

  async clearAll(userId: string) {
    if (!userId || userId === "undefined" || userId === "null" || !Types.ObjectId.isValid(userId)) {
      return { success: false };
    }
    await this.notificationModel.deleteMany({ user: userId }).exec();
    return { success: true };
  }
}
