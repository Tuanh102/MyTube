import ShortsPage from "@/views/pages/ShortsPage";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Shorts - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  let shorts: any[] = [];
  try {
    const res = await fetch(`http://127.0.0.1:5000/videos/shorts`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      shorts = data.map((v: any) => ({
        video_id: v._id,
        title: v.title,
        description: v.description,
        thumbnail_url: v.thumbnail_url,
        video_url: v.video_url,
        channel_name: v.channel?.channel_name || 'Unknown Channel',
        channel_avatar: v.channel?.avatar_url || '/assets/img/default-channel-avatar.jpg',
        channel_id: v.channel?._id || '',
        view_count: v.view_count || 0,
        uploaded_at: v.createdAt,
        duration: v.duration || 0,
        likes_count: v.likes?.length || 0,
        dislikes_count: v.dislikes?.length || 0,
        isLiked: session?.user?.id ? v.likes?.includes(session.user.id) : false
      }));
    }
  } catch (error) {
    console.error("Failed to fetch shorts from API", error);
  }

  return <ShortsPage shorts={shorts} user={session?.user} />;
}
