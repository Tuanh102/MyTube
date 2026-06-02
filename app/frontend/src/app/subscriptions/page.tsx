export const dynamic = 'force-dynamic';
import SubscriptionsPage from "@/views/pages/SubscriptionsPage";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Kênh đã đăng ký - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) {
    redirect('/login');
  }

  let channels = [] as any[];
  try {
    const res = await fetch(`http://127.0.0.1:5000/channels/subscribed?userId=${user.id}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const rawChannels = await res.json();
      channels = (rawChannels || []).map((c: any) => ({
        channel_id: c._id,
        channel_name: c.channel_name,
        avatar: c.avatar_url || '/assets/img/default-channel-avatar.jpg',
        sub_count: c.subscribers?.length || 0
      }));
    }
  } catch (err) {
    console.error("Error fetching subscribed channels:", err);
  }

  return <SubscriptionsPage channels={channels} />;
}
