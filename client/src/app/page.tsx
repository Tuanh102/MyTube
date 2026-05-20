import VideoCard from "@/views/components/VideoCard";
import HomeBanner from "@/views/components/HomeBanner";
// Legacy imports removed
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, category?: string }>;
}) {
  const { search, category } = await searchParams;
  const searchQuery = search || '';
  const categoryId = category ? Number(category) : undefined;
  
  // Fetch videos from NestJS API
  let videos: any[] = [];
  try {
    const res = await fetch(`http://127.0.0.1:5000/videos/home${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`, { cache: 'no-store' });
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

  const dbCategories: any[] = [];

  const categories = [
    { id: null, name: "Tất cả" }
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
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video.video_id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-white/50">
          <p className="text-lg">Không tìm thấy video nào.</p>
          {(searchQuery || categoryId) && <p className="text-sm">Thử với từ khóa hoặc danh mục khác xem sao!</p>}
        </div>
      )}
    </div>
  );
}
