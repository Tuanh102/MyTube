import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { LiveService } from "./live/live.service";
import { SupportService } from "./support/support.service";

@WebSocketGateway({
  cors: {
    origin: "*", // Cho phép kết nối từ mọi nguồn trong môi trường dev
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly liveService: LiveService,
    private readonly supportService: SupportService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[Socket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Socket] Client disconnected: ${client.id}`);
  }

  // Client join vào room cụ thể
  @SubscribeMessage("join_room")
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!data || !data.roomId) return;
    client.join(data.roomId);
    console.log(`[Socket] Client ${client.id} joined room: ${data.roomId}`);
    client.emit("joined_room", { roomId: data.roomId });
  }

  // --- HỖ TRỢ LIVE CHAT ---
  @SubscribeMessage("send_live_message")
  async handleLiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; senderId: string; content: string },
  ) {
    try {
      if (!data.streamId || !data.senderId || !data.content) {
        throw new Error("Dữ liệu gửi lên không hợp lệ");
      }

      // Gọi LiveService có sẵn để lưu DB
      const newMessage = await this.liveService.postMessage(
        data.streamId,
        data.senderId,
        data.content,
      );

      // Broadcast tới tất cả client trong room stream
      const roomId = `live_${data.streamId}`;
      this.server.to(roomId).emit("new_live_message", newMessage);
      console.log(`[Socket] Live message broadcasted to ${roomId}`);
    } catch (error) {
      console.error("[Socket] Lỗi Live Chat:", error.message);
      client.emit("socket_error", { message: error.message });
    }
  }

  // --- HỖ TRỢ LIVE DONATION ---
  @SubscribeMessage("send_live_donation")
  async handleLiveDonation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; viewerId: string; amount: number },
  ) {
    try {
      if (!data.streamId || !data.viewerId || !data.amount) {
        throw new Error("Dữ liệu quyên góp không hợp lệ");
      }

      const donationResult = await this.liveService.donate(
        data.streamId,
        data.viewerId,
        data.amount,
      );

      // Broadcast tới tất cả client trong room stream để hiển thị thông báo/hiệu ứng
      const roomId = `live_${data.streamId}`;
      this.server.to(roomId).emit("new_live_donation", donationResult);
      console.log(`[Socket] Live donation broadcasted to ${roomId}`);
    } catch (error) {
      console.error("[Socket] Lỗi Live Donation:", error.message);
      client.emit("socket_error", { message: error.message });
    }
  }

  @SubscribeMessage("broadcast_live_donation")
  handleBroadcastLiveDonation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      streamId: string;
      senderName: string;
      amount: number;
      donateMessage: any;
    },
  ) {
    const roomId = `live_${data.streamId}`;
    this.server.to(roomId).emit("new_live_donation", {
      senderName: data.senderName,
      amount: data.amount,
      donateMessage: data.donateMessage,
    });
    console.log(`[Socket] Broadcasted live donation message to ${roomId}`);
  }

  // --- HỖ TRỢ CHAT TICKET ---
  @SubscribeMessage("send_support_message")
  async handleSupportMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      ticketId: string;
      senderId: string;
      role: string;
      message: string;
    },
  ) {
    try {
      if (!data.ticketId || !data.senderId || !data.role || !data.message) {
        throw new Error("Dữ liệu tin nhắn hỗ trợ không hợp lệ");
      }

      // Lưu tin nhắn vào DB qua SupportService
      const updatedTicket = await this.supportService.addMessage(
        data.ticketId,
        data.senderId,
        data.role,
        data.message,
      );

      // Lấy tin nhắn vừa tạo (tin nhắn cuối cùng trong mảng)
      const lastMessage =
        updatedTicket.messages[updatedTicket.messages.length - 1];

      // Broadcast tới room của ticket cụ thể
      const roomId = `ticket_${data.ticketId}`;
      this.server.to(roomId).emit("new_support_message", {
        ticketId: data.ticketId,
        message: lastMessage,
      });

      // Broadcast global event cho các Staff đang xem danh sách Ticket cập nhật danh sách
      this.server.emit("ticket_updated", {
        ticketId: data.ticketId,
        status: updatedTicket.status,
        lastMessage: lastMessage,
      });

      console.log(`[Socket] Support message broadcasted to ${roomId}`);
    } catch (error) {
      console.error("[Socket] Lỗi Chat Ticket:", error.message);
      client.emit("socket_error", { message: error.message });
    }
  }
}
