import SavedPage from "@/views/pages/SavedPage";
import { videoController } from "@/lib/controllers/videoController";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Video đã lưu - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const playlists = await videoController.getSavedVideosData(Number(session.user.id));

  return <SavedPage playlists={playlists} />;
}
