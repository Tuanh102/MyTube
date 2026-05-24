import LikesPage from "@/views/pages/LikesPage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getLikedVideosAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Video đã thích - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const likedVideos = await getLikedVideosAction();
  
  const formattedVideos = Array.isArray(likedVideos) ? likedVideos.map((v: any) => ({
    video_id: v._id?.toString() || v.video_id?.toString(),
    title: v.title,
    thumbnail_url: v.thumbnail_url,
    channel_name: v.channel?.channel_name || 'Unknown Channel',
    view_count: v.view_count || 0,
    duration: v.duration || 0,
    description: v.description || ''
  })) : [];

  return <LikesPage videos={formattedVideos} />;
}
