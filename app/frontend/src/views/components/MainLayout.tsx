"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MiniPlayer from "./MiniPlayer";

export default function MainLayout({ children, user, followedChannels }: any) {
  const pathname = usePathname();
  
  // Kiểm tra nếu là trang Admin hoặc Staff thì ẩn Header/Sidebar mặc định
  const isAdminPage = pathname?.startsWith('/admin');
  const isStaffPage = pathname?.startsWith('/staff');

  if (isAdminPage || isStaffPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="flex pt-14">
        <Sidebar user={user} followedChannels={followedChannels} />
        <main className="flex-1 p-4 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
      <MiniPlayer />
    </>
  );
}
