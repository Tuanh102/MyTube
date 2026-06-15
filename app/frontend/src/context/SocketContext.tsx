"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:5000";

    console.log("[Socket] Khởi tạo kết nối tới:", socketUrl);

    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Đã kết nối thành công, ID:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Đã ngắt kết nối. Lý do:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket] Lỗi kết nối:", error);
    });

    setSocket(socketInstance);

    return () => {
      console.log("[Socket] Cleanup kết nối");
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
