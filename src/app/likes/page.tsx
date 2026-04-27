import LikesPage from "@/views/pages/LikesPage";
import { videoController } from "@/lib/controllers/videoController";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Video đã thích - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const videos = await videoController.getLikedVideosData(Number(session.user.id));

  return <LikesPage videos={videos} />;
}
