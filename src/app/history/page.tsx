import HistoryPage from "@/views/pages/HistoryPage";
import { videoModel } from "@/lib/models/video";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lịch sử đã xem - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const videos = await videoModel.getWatchHistory(Number(session.user.id));

  return <HistoryPage videos={videos} />;
}

