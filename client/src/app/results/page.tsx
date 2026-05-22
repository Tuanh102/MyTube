import ResultsPage from "@/views/pages/ResultsPage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search_query?: string }>;
}) {
  const { search_query } = await searchParams;
  const query = search_query || '';
  
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";

  let videos: any[] = [];
  try {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (userId) params.append('userId', userId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`http://127.0.0.1:5000/videos/home${queryString}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      videos = data.map((v: any) => ({
        video_id: v._id,
        title: v.title,
        description: v.description,
        thumbnail_url: v.thumbnail_url,
        video_url: v.video_url,
        channel_name: v.channel?.channel_name || 'Unknown Channel',
        channel_avatar: v.channel?.avatar_url || '/assets/img/default-channel-avatar.jpg',
        view_count: v.view_count || 0,
        uploaded_at: v.createdAt,
        duration: v.duration || 0,
        is_free: v.is_free
      }));
    }
  } catch (error) {
    console.error("Failed to fetch search results from API", error);
  }

  return (
    <ResultsPage videos={videos} query={query} />
  );
}
