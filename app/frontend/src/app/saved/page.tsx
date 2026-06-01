export const dynamic = 'force-dynamic';
import SavedPage from "@/views/pages/SavedPage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getUserPlaylistsAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Danh sách đã lưu - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const playlists = await getUserPlaylistsAction();
  
  return <SavedPage playlists={Array.isArray(playlists) ? playlists : []} />;
}
