import WatchPage from "@/views/pages/WatchPage";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/options";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let title = "Video không tồn tại";
  try {
    const res = await fetch(`http://127.0.0.1:5000/videos/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const apiData = await res.json();
      if (apiData && apiData.video) {
        title = `${apiData.video.title} - MyTube`;
      }
    }
  } catch (err) {}
  
  return {
    title,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || "";
  const { id } = await params;
  let data: any = null;
  try {
    const res = await fetch(`http://127.0.0.1:5000/videos/${id}?userId=${userId}`, { cache: 'no-store' });
    if (res.ok) {
      const apiData = await res.json();
      if (apiData && apiData.video) {
        data = {
          video: {
            video_id: apiData.video._id,
            _id: apiData.video._id,
            title: apiData.video.title,
            description: apiData.video.description,
            thumbnail_url: apiData.video.thumbnail_url,
            video_url: apiData.video.video_url,
            view_count: apiData.video.view_count || 0,
            likes: apiData.video.likes || [],
            dislikes: apiData.video.dislikes || [],
            uploaded_at: apiData.video.createdAt,
            channel_id: apiData.video.channel?._id || '',
            channel_name: apiData.video.channel?.channel_name || 'Unknown',
            channel_avatar: apiData.video.channel?.avatar_url || '/assets/img/default-channel-avatar.jpg',
            channel_user_id: apiData.video.channel?.user?.toString() || '',
            sub_count: apiData.video.channel?.subscribers?.length || 0,
            is_followed: (userId && apiData.video.channel?.subscribers?.map((subId: any) => subId.toString()).includes(userId.toString())) ? 1 : 0,
            is_free: apiData.video.is_free,
            price: apiData.video.price,
            category_id: apiData.video.category_id
          },
          relatedVideos: apiData.relatedVideos.map((v: any) => ({
            video_id: v._id,
            title: v.title,
            thumbnail_url: v.thumbnail_url,
            video_url: v.video_url,
            channel_name: v.channel?.channel_name || 'Unknown Channel',
            channel_avatar: v.channel?.avatar_url || '/assets/img/default-channel-avatar.jpg',
            channel_id: v.channel?._id || '',
            channel_user_id: v.channel?.user?._id || v.channel?.user || '',
            view_count: v.view_count || 0,
            duration: v.duration || 0,
            created_at: v.createdAt,
            is_free: v.is_free,
            price: v.price,
            category_id: v.category_id
          })),
          comments: []
        };

        try {
          const commentsRes = await fetch(`http://127.0.0.1:5000/comments/video/${id}`, { cache: 'no-store' });
          if (commentsRes.ok) {
            const rawComments = await commentsRes.json();
            data.comments = rawComments.map((c: any) => ({
              comment_id: c._id,
              username: c.channel?.channel_name || c.user?.username || c.user?.name || 'Unknown',
              avatar: c.channel?.avatar_url || c.user?.avatar || c.user?.avatar_url || '/assets/img/default-avatar.png',
              is_channel: !!c.channel,
              is_premium: c.user?.is_premium || false,
              content: c.content,
              created_at: c.createdAt,
              likes_count: c.likes?.length || 0,
              dislikes_count: c.dislikes?.length || 0,
              likes: c.likes || [],
              dislikes: c.dislikes || [],
              parent_comment_id: c.parentComment || null,
              replies: c.replies?.map((r: any) => ({
                comment_id: r._id,
                username: r.channel?.channel_name || r.user?.username || r.user?.name || 'Unknown',
                avatar: r.channel?.avatar_url || r.user?.avatar || r.user?.avatar_url || '/assets/img/default-avatar.png',
                is_channel: !!r.channel,
                is_premium: r.user?.is_premium || false,
                content: r.content,
                created_at: r.createdAt,
                likes_count: r.likes?.length || 0,
                dislikes_count: r.dislikes?.length || 0,
                likes: r.likes || [],
                dislikes: r.dislikes || [],
                parent_comment_id: r.parentComment || null,
              })) || []
            }));
          }
        } catch (err) {}
      }
    }
  } catch (error) {
    console.error("Failed to fetch video details from API", error);
  }

  if (!data || !data.video) {
    notFound();
  }

  return (
    <WatchPage 
      video={data.video} 
      relatedVideos={data.relatedVideos} 
      comments={data.comments} 
      user={session?.user} 
    />
  );
}
