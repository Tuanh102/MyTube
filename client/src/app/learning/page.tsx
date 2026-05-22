import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import CategoryExplorePage from '@/views/pages/CategoryExplorePage';

export const metadata = {
  title: "Học tập - MyTube",
  description: "Khám phá các video giáo dục, bài học khoa học lý thú, khóa học trực tuyến và hướng dẫn kỹ năng sống hữu ích.",
};

export default async function LearningExplorePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";

  let videos: any[] = [];
  try {
    const params = new URLSearchParams();
    params.append('categoryId', '6'); // Category ID for Learning/Education
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
    console.error("Failed to fetch learning videos from API", error);
  }

  return (
    <CategoryExplorePage 
      title="Học tập"
      description="Mỗi ngày thêm một kiến thức mới! Khám phá kho tàng bài học bổ ích từ khoa học vũ trụ, lịch sử nhân loại, ngoại ngữ, cho tới các kỹ năng mềm thực tế cuộc sống."
      gradient="from-emerald-950 via-teal-900/40 to-green-950"
      iconName="learning"
      videos={videos}
    />
  );
}
