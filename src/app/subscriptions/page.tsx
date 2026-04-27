import SubscriptionsPage from "@/views/pages/SubscriptionsPage";
import { videoController } from "@/lib/controllers/videoController";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Kênh đã đăng ký - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const channels = await videoController.getSubscriptionsData(Number(session.user.id));

  return <SubscriptionsPage channels={channels} />;
}
