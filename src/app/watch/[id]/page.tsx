import WatchPage from "@/views/pages/WatchPage";
import { videoController } from "@/lib/controllers/videoController";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await videoController.getWatchPageData(id);
  return {
    title: data?.video ? `${data.video.title} - MyTube` : "Video không tồn tại",
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const data = await videoController.getWatchPageData(id, session?.user?.id ? Number(session.user.id) : undefined);
  
  if (!data) {
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
