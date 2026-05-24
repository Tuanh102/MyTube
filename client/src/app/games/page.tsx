import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import CategoryExplorePage from '@/views/pages/CategoryExplorePage';

export const metadata = {
  title: "Trò chơi - MyTube",
  description: "Khám phá video gaming, hướng dẫn chơi game, livestream và các giải đấu eSports đỉnh cao.",
};

export default async function GamesExplorePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";

  let videos: any[] = [];
  try {
    const params = new URLSearchParams();
    params.append('categoryId', '3'); // Category ID for Gaming
    if (userId) params.append('userId', userId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`http://127.0.0.1:5000/videos/home${queryString}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      videos = data.map((v: any) => ({
        video_id: v._id,
        title: v.title,
        thumbnail_url: v.thumbnail_url,
        video_url: v.video_url,
        channel_name: v.channel?.channel_name || 'Unknown Channel',
        channel_avatar: v.channel?.avatar_url || '/assets/img/default-channel-avatar.jpg',
        channel_id: v.channel?._id || '',
        channel_user_id: v.channel?.user?._id || v.channel?.user || '',
        view_count: v.view_count || 0,
        created_at: v.createdAt,
        duration: v.duration || 0,
        is_free: v.is_free
      }));
    }
  } catch (error) {
    console.error("Failed to fetch gaming videos from API", error);
  }

  return (
    <CategoryExplorePage 
      title="Trò chơi"
      description="Nơi hội tụ của các game thủ hàng đầu! Theo dõi những màn highlights đỉnh cao, hướng dẫn chơi game chi tiết, và những buổi livestream kịch tính."
      gradient="from-indigo-950 via-purple-900/40 to-violet-950"
      iconName="games"
      videos={videos}
    />
  );
}
