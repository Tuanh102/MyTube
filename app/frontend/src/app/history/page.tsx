import HistoryPage from "@/views/pages/HistoryPage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getWatchHistoryAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Lịch sử đã xem - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const history = await getWatchHistoryAction();
  
  const formattedVideos = Array.isArray(history) ? history.map((v: any) => ({
    video_id: v._id?.toString() || v.video_id?.toString(),
    title: v.title,
    thumbnail_url: v.thumbnail_url,
    channel_name: v.channel?.channel_name || 'Unknown Channel',
    view_count: v.view_count || 0,
    watched_at: new Date().toISOString(),
    description: v.description || ''
  })) : [];

  return <HistoryPage videos={formattedVideos} />;
}
