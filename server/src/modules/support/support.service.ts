import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async onModuleInit() {
    console.log('[Support] Bắt đầu kiểm tra dữ liệu cần migrate...');
    // Lấy tất cả ticket để kiểm tra thủ công các trường ẩn
    const allTickets = await this.ticketModel.find({});

    let count = 0;
    for (const ticket of allTickets) {
      // Sử dụng .get() để lấy dữ liệu từ các trường không còn trong Schema
      const oldMessage = ticket.get('message');
      const oldReply = ticket.get('reply');
      const oldRepliedAt = ticket.get('repliedAt');
      const oldRepliedById = ticket.get('repliedById');

      if (!oldMessage && !oldReply) continue;

      const newMessages = [...(ticket.messages || [])];
      
      // Nếu chưa có tin nhắn nào trong mảng mới thì mới migrate
      if (oldMessage && !newMessages.some(m => m.message === oldMessage)) {
        newMessages.unshift({
          senderId: ticket.userId,
          senderRole: 'USER',
          message: oldMessage,
          createdAt: ticket.get('createdAt') || new Date()
        });
      }

      if (oldReply && !newMessages.some(m => m.message === oldReply)) {
        newMessages.push({
          senderId: oldRepliedById || ticket.userId,
          senderRole: 'STAFF',
          message: oldReply,
          createdAt: oldRepliedAt || new Date()
        });
      }

      await this.ticketModel.findByIdAndUpdate(ticket._id, {
        $set: { messages: newMessages },
        $unset: { message: "", reply: "", repliedById: "", repliedAt: "" }
      });
      count++;
    }

    if (count > 0) {
      console.log(`[Support] Đã khôi phục và migrate thành công ${count} ticket cũ.`);
    } else {
      console.log('[Support] Không còn dữ liệu cũ cần xử lý.');
    }
  }

  // Người dùng tạo yêu cầu mới
  async createTicket(userId: string, data: any) {
    if (!userId || userId === 'undefined') {
      throw new Error('UserId is required');
    }
    
    const ticket = new this.ticketModel({
      userId: new Types.ObjectId(userId),
      subject: data.subject,
      messages: [{
        senderId: new Types.ObjectId(userId),
        senderRole: 'USER',
        message: data.message,
        createdAt: new Date()
      }],
      isReadByUser: true, // Vừa tạo thì mình đã đọc rồi
      isReadByStaff: false,
    });
    return ticket.save();
  }

  // Thêm tin nhắn mới vào Ticket (Dùng cho cả User và Staff)
  async addMessage(ticketId: string, senderId: string, role: string, message: string) {
    const isStaff = role === 'STAFF';
    
    const updateData: any = {
      $push: {
        messages: {
          senderId: new Types.ObjectId(senderId),
          senderRole: role,
          message,
          createdAt: new Date()
        }
      },
      isReadByUser: isStaff ? false : true, // Nếu Staff nhắn thì User chưa đọc
      isReadByStaff: isStaff ? true : false, // Nếu User nhắn thì Staff chưa đọc
    };

    return this.ticketModel.findByIdAndUpdate(ticketId, updateData, { new: true }).populate('userId', 'name email avatar_url');
  }

  async getUserTickets(userId: string) {
    const tickets = await this.ticketModel.find({ userId: new Types.ObjectId(userId) }).sort({ updatedAt: -1 });
    console.log(`[Support] Lấy ${tickets.length} tickets cho user ${userId}. Ticket đầu tiên có ${tickets[0]?.messages?.length || 0} tin nhắn.`);
    return tickets;
  }

  async getAllTickets() {
    return this.ticketModel.find().populate('userId', 'name email avatar_url').sort({ updatedAt: -1 });
  }

  // Lấy số thông báo chưa đọc cho Header
  async getUnreadCount(userId: string) {
    return this.ticketModel.countDocuments({ 
      userId: new Types.ObjectId(userId), 
      isReadByUser: false 
    });
  }

  // Đánh dấu đã đọc khi mở chat
  async markAsRead(ticketId: string) {
    return this.ticketModel.findByIdAndUpdate(ticketId, { isReadByUser: true });
  }
}
