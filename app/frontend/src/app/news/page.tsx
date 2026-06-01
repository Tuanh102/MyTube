export const dynamic = 'force-dynamic';
import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import CategoryExplorePage from '@/views/pages/CategoryExplorePage';

export const metadata = {
  title: "Tin tức - MyTube",
  description: "Cập nhật tin tức thế giới nóng hổi, phân tích thời sự, phóng sự xã hội và thông tin công nghệ mới nhất.",
};

export default async function NewsExplorePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";

  let videos: any[] = [];
  try {
    const params = new URLSearchParams();
    params.append('categoryId', '4'); // Category ID for News
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
    console.error("Failed to fetch news videos from API", error);
  }

  return (
    <CategoryExplorePage 
      title="Tin tức"
      description="Cập nhật dòng chảy thông tin thế giới! Kênh tin tức uy tín tổng hợp tình hình thời sự, xã hội, phân tích chuyên sâu và những tiêu điểm nóng hổi 24/7."
      gradient="from-slate-900 via-sky-950 to-blue-900/40"
      iconName="news"
      videos={videos}
    />
  );
}
