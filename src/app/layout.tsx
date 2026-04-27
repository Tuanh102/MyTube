import type { Metadata } from "next";
import "./globals.css";
import Header from "@/views/components/Header";
import Sidebar from "@/views/components/Sidebar";
import MiniPlayer from "@/views/components/MiniPlayer";

import { Providers } from "@/views/components/Providers";

export const metadata: Metadata = {
  title: "MyTube - Nền tảng chia sẻ video",
  description: "Bản clone YouTube hiện đại xây dựng bằng Next.js và TSX",
  icons: {
    icon: "/favicon-square.png",
    apple: "/favicon-square.png",
  },
};

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { notificationModel } from "@/lib/models/notification";
import { userModel } from "@/lib/models/user";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  let unreadCount = 0;
  let followedChannels: any[] = [];

  if (user) {
    unreadCount = await notificationModel.countUnread(Number(user.id));
    followedChannels = await userModel.getFollowedChannels(Number(user.id));
  }

  return (
    <html lang="vi">
      <body className="bg-[#0f0f0f] text-white antialiased">
        <Providers>
          <Header unreadCount={unreadCount} />
          <div className="flex pt-14">
            <Sidebar user={user} followedChannels={followedChannels} />
            <main className="flex-1 p-4 min-h-[calc(100vh-3.5rem)]">
              {children}
            </main>
          </div>
          <MiniPlayer />
        </Providers>
      </body>
    </html>
  );
}
