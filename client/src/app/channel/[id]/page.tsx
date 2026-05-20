import ChannelPage from "@/views/pages/ChannelPage";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let title = "Kênh không tồn tại";
  try {
    const res = await fetch(`http://127.0.0.1:5000/channels/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const channel = await res.json();
      if (channel) {
        title = `${channel.channel_name} - MyTube`;
      }
    }
  } catch (err) {}
  
  return {
    title,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  let channel: any = null;
  let videos: any[] = [];

  try {
    // 1. Fetch channel info
    const channelRes = await fetch(`http://127.0.0.1:5000/channels/${id}`, { cache: 'no-store' });
    if (channelRes.ok) {
      channel = await channelRes.json();
    }

    // 2. Fetch channel videos
    // Use the existing studio/public endpoint for videos by channel ID
    const videosRes = await fetch(`http://127.0.0.1:5000/videos/studio?channelId=${id}`, { cache: 'no-store' });
    if (videosRes.ok) {
      videos = await videosRes.json();
    }
  } catch (error) {
    console.error("Failed to fetch channel details", error);
  }

  if (!channel) {
    notFound();
  }

  return (
    <ChannelPage 
      channel={channel} 
      videos={videos}
      user={session?.user} 
    />
  );
}
