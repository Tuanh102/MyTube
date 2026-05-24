import PurchasedPage from "@/views/pages/PurchasedPage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getPurchasedVideosAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Video đã mua - MyTube Premium",
  description: "Danh sách các video và nội dung cao cấp đã mua trên MyTube.",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!session) {
    redirect("/login");
  }

  // Lấy danh sách video đã mua từ NestJS API
  const purchasedVideos = await getPurchasedVideosAction();
  
  // Lọc bỏ các video mà chính người dùng hiện tại là chủ sở hữu (chủ kênh đăng)
  const filteredVideos = Array.isArray(purchasedVideos) ? purchasedVideos.filter((v: any) => {
    const isMyVideo = v.channel?.user?.toString() === user?.id?.toString() ||
                      v.user_id?.toString() === user?.id?.toString();
    return !isMyVideo;
  }) : [];
  
  const formattedVideos = filteredVideos.map((v: any) => ({
    video_id: v._id?.toString() || v.video_id?.toString(),
    title: v.title,
    thumbnail_url: v.thumbnail_url,
    channel_name: v.channel?.channel_name || 'Kênh hệ thống',
    view_count: v.view_count || 0,
    duration: v.duration || 0,
    description: v.description || 'Không có mô tả cho video này.',
    price: v.price || 0,
    created_at: v.createdAt || v.created_at || new Date().toISOString()
  }));

  return <PurchasedPage videos={formattedVideos} />;
}
