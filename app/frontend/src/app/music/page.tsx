export const dynamic = 'force-dynamic';
import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import CategoryExplorePage from '@/views/pages/CategoryExplorePage';

export const metadata = {
  title: "Âm nhạc - MyTube",
  description: "Khám phá âm nhạc thịnh hành, ca khúc mới và các buổi biểu diễn trực tiếp trên MyTube.",
};

export default async function MusicExplorePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";

  let videos: any[] = [];
  try {
    const params = new URLSearchParams();
    params.append('categoryId', '2'); // Category ID for Music
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
        channel_is_verified: v.channel?.is_verified,
        channel_id: v.channel?._id || '',
        channel_user_id: v.channel?.user?._id || v.channel?.user || '',
        view_count: v.view_count || 0,
        created_at: v.createdAt,
        duration: v.duration || 0,
        is_free: v.is_free
      }));
    }
  } catch (error) {
    console.error("Failed to fetch music videos from API", error);
  }

  return (
    <CategoryExplorePage 
      title="Âm nhạc"
      description="Đắm chìm vào thế giới giai điệu với những ca khúc hot nhất, MV chất lượng cao, các màn biểu diễn trực tiếp cùng nhiều playlist độc quyền được tuyển chọn."
      gradient="from-purple-900/60 via-pink-900/40 to-rose-900/60"
      iconName="music"
      videos={videos}
    />
  );
}
