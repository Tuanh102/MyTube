import ReportPage from "@/views/pages/ReportPage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getUserReportsAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Lịch sử báo cáo - MyTube",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const reports = await getUserReportsAction(session.user.id);
  
  return <ReportPage reports={reports || []} />;
}
