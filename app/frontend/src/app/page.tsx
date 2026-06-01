export const dynamic = 'force-dynamic';
import VideoCard from "@/views/components/VideoCard";
import HomeBanner from "@/views/components/HomeBanner";
// Legacy imports removed
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";
import { Radio, Users } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, category?: string }>;
}) {
  const { search, category } = await searchParams;
  const searchQuery = search || '';
  const categoryId = category ? Number(category) : undefined;
  
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";

  // Fetch videos from NestJS API
  let videos: any[] = [];
  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (userId) params.append('userId', userId);
    if (categoryId) params.append('categoryId', String(categoryId));
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`http://127.0.0.1:5000/videos/home${queryString}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      // Map MongoDB data to match old MySQL structure the UI expects
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
    console.error("Failed to fetch videos from API", error);
  }

  // Fetch active live streams
  let activeLiveStreams: any[] = [];
  try {
    const liveRes = await fetch('http://127.0.0.1:5000/live/active', { cache: 'no-store' });
    if (liveRes.ok) {
      activeLiveStreams = await liveRes.json();
    }
  } catch (error) {
    console.error("Failed to fetch active live streams", error);
  }

  // Map active live streams to match VideoCard schema
  const liveVideoCards = activeLiveStreams.map((stream: any) => ({
    video_id: stream._id,
    title: stream.title,
    thumbnail_url: stream.thumbnailUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
    channel_name: stream.streamerName,
    channel_avatar: stream.streamerAvatar || '/assets/img/avata.jpg',
    view_count: stream.viewerCount || 0,
    created_at: stream.createdAt,
    isLive: true
  }));

  // Filter live streams if search query is present
  const filteredLiveVideoCards = searchQuery 
    ? liveVideoCards.filter((stream: any) => 
        stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : liveVideoCards;

  // Merge live streams (at the beginning) with normal videos
  const allVideos = [...filteredLiveVideoCards, ...videos];

  const dbCategories: any[] = [];

  const categories = [
    { id: null, name: "Tất cả" },
    { id: 2, name: "Âm nhạc" },
    { id: 3, name: "Trò chơi" },
    { id: 4, name: "Tin tức" },
    { id: 5, name: "Hoạt hình" },
    { id: 6, name: "Giáo dục" },
    { id: 13, name: "Công nghệ" },
    { id: 21, name: "Thể thao" },
    { id: 22, name: "Phim ảnh" },
    { id: 12, name: "Khác" }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Category Chips */}
      <div className="sticky top-14 bg-[#0f0f0f]/95 backdrop-blur-sm z-40 py-3 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-3">
        {categories.map((cat) => {
          const isActive = (cat.id === null && !categoryId) || (cat.id === categoryId);
          const href = cat.id 
            ? `/?category=${cat.id}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`
            : (searchQuery ? `/?search=${encodeURIComponent(searchQuery)}` : '/');

          return (
            <Link 
              key={cat.id || 'all'}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                isActive ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Hero Banner */}
      {!categoryId && !searchQuery && <HomeBanner />}

      {/* Video Grid */}
      {allVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
          {allVideos.map((video) => (
            <VideoCard key={video.video_id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-white/50">
          <p className="text-lg">Không tìm thấy video hay phiên Live nào.</p>
          {(searchQuery || categoryId) && <p className="text-sm">Thử với từ khóa hoặc danh mục khác xem sao!</p>}
        </div>
      )}
    </div>
  );
}
