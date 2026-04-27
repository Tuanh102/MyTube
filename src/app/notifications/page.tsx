import NotificationsPage from "@/views/pages/NotificationsPage";
import { notificationModel } from "@/lib/models/notification";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Thông báo - MyTube",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { filter: filterParam } = await searchParams;
  const filter = filterParam || 'all';
  const notifications = await notificationModel.getNotifications(Number(session.user.id), filter);

  return <NotificationsPage notifications={notifications} filter={filter} />;
}

