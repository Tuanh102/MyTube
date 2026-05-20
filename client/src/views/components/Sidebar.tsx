"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Home, Film, Users, History, Heart, Clock, Music, Gamepad, Clapperboard, Newspaper, Lightbulb, Flag, Ticket } from 'lucide-react';

interface SidebarProps {
  followedChannels?: any[];
  user?: any;
}

export default function Sidebar({ followedChannels = [], user }: SidebarProps) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar, setIsLoginDropdownOpen } = useUI(); // Nhận hàm kích hoạt login từ UIContext

  // Các đường dẫn yêu cầu phải có tài khoản (đăng nhập)
  const authRequiredHrefs = ['/subscriptions', '/history', '/likes', '/saved', '/purchased'];

  const handleItemClick = (e: React.MouseEvent, item: any) => {
    // Nếu trang yêu cầu đăng nhập mà user chưa đăng nhập
    if (authRequiredHrefs.includes(item.href) && !user) {
      e.preventDefault(); // Ngăn chuyển trang
      closeSidebar(); // Đóng sidebar

      const confirmLogin = window.confirm(`Bạn cần đăng nhập bằng tài khoản mạng xã hội để xem [${item.name}]. Click OK để đăng nhập ngay!`);
      if (confirmLogin) {
        setIsLoginDropdownOpen(true); // Bung form đăng nhập ở Header
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu
      }
    } else {
      closeSidebar(); // Chuyển trang bình thường và đóng sidebar
    }
  };

  const menuGroups = [
    {
      items: [
        { name: 'Trang chủ', icon: Home, href: '/' },
        { name: 'Shorts', icon: Film, href: '/shorts' },
      ]
    },
    {
      title: 'Của bạn',
      items: [
        { name: 'Kênh đăng ký', icon: Users, href: '/subscriptions' },
        { name: 'Đã xem', icon: History, href: '/history' },
        { name: 'Đã thích', icon: Heart, href: '/likes' },
        { name: 'Xem sau', icon: Clock, href: '/saved' },
        { name: 'Video đã mua', icon: Ticket, href: '/purchased' },
      ]
    },
    {
      title: 'Khám phá',
      items: [
        { name: 'Âm nhạc', icon: Music, href: '/music' },
        { name: 'Trò chơi', icon: Gamepad, href: '/games' },
        { name: 'Phim ảnh', icon: Clapperboard, href: '/movies' },
        { name: 'Tin tức', icon: Newspaper, href: '/news' },
        { name: 'Học tập', icon: Lightbulb, href: '/learning' },
      ]
    },
    {
      items: [
        { name: 'Báo cáo', icon: Flag, href: '/report' },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[45] transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      <aside className={`fixed left-0 top-14 bottom-0 w-64 bg-[#0f0f0f] border-r border-white/5 overflow-y-auto z-50 transition-all duration-300 ease-in-out custom-scrollbar ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              {group.title && (
                <h3 className="px-4 py-2 text-white font-semibold text-sm">{group.title}</h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        onClick={(e) => handleItemClick(e, item)}
                        className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition ${
                          isActive ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon size={20} className={isActive ? 'text-red-500' : ''} />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {groupIndex < menuGroups.length - 1 && <hr className="border-white/5 my-4 mx-4" />}
            </div>
          ))}

          {user && followedChannels.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 py-2 text-white font-semibold text-sm">Kênh đăng ký</h3>
              <ul className="space-y-1">
                {followedChannels.map((channel) => (
                  <li key={channel.channel_id}>
                    <Link 
                      href={`/channel/${channel.channel_id}`}
                      onClick={closeSidebar}
                      className="flex items-center gap-4 px-4 py-2 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition"
                    >
                      <img 
                        src={channel.avatar || '/assets/img/avata.jpg'} 
                        className="w-6 h-6 rounded-full object-cover" 
                        alt="" 
                      />
                      <span className="text-sm truncate">{channel.channel_name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <hr className="border-white/5 my-4 mx-4" />
            </div>
          )}
          
          <div className="px-4 py-2 text-[11px] text-white/30 space-y-4">
            <p>Dự án MyTube Next.js Migration. @ 2026 MyTube. All rights reserved.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
