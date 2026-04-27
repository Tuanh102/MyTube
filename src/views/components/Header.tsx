"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, User, LogOut, Key, UserCircle, Plus } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import CreateChannelModal from './modals/CreateChannelModal';
import UploadVideoModal from './modals/UploadVideoModal';

interface HeaderProps {
  unreadCount?: number;
}

export default function Header({ unreadCount = 0 }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toggleSidebar } = useUI();
  const user = session?.user;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setChannels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      signIn();
    } else {
      router.push('/studio');
    }
  };

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/results?search_query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10 z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-full transition text-white"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/assets/img/logoMyTube.png" 
            alt="MyTube Logo" 
            className="h-10 w-auto object-contain group-hover:scale-110 transition-transform"
          />
          <h1 className="text-white font-bold text-2xl tracking-tighter hidden sm:block">
            MyTube<sup className="text-[10px] text-red-500 ml-0.5 font-medium">VN</sup>
          </h1>
        </Link>
      </div>

      <div className="flex-1 max-w-[600px] mx-4 hidden md:block">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Tìm kiếm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-l-full py-2 px-5 text-white focus:outline-none focus:border-red-500 transition"
          />
          <button type="submit" className="bg-white/5 border border-l-0 border-white/10 px-6 py-2 rounded-r-full hover:bg-white/10 transition text-white">
            <Search size={20} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition text-white text-sm font-bold"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Tạo</span>
          </button>
        </div>

        <button 
          onClick={() => router.push('/notifications')}
          title="Thông báo"
          className="relative p-2 hover:bg-white/10 rounded-full transition text-white cursor-pointer"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          {user ? (
            <button 
              onClick={() => setIsAuthOpen(!isAuthOpen)}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-white/30 transition-all shadow-lg active:scale-95"
            >
              <img 
                src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </button>
          ) : (
            <button 
              onClick={() => signIn()}
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-500/50 hover:bg-blue-500/10 text-blue-500 rounded-full transition-all text-sm font-medium active:scale-95"
            >
              <UserCircle size={20} />
              <span>Đăng nhập</span>
            </button>
          )}

          {isAuthOpen && user && (
            <div className="absolute top-12 right-0 w-72 bg-[#282828] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[60]">
              <div className="p-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-md" 
                    alt="User" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate text-base">{user.username || user.name}</p>
                    <p className="text-white/40 text-xs truncate font-medium">{user.email || 'No email'}</p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <ul className="space-y-0.5 px-2">
                  <li>
                    <Link 
                      href="/profile" 
                      onClick={() => setIsAuthOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white transition text-sm font-medium"
                    >
                      <UserCircle size={18} className="text-white/60" /> 
                      <span>Xem Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/change-password" 
                      onClick={() => setIsAuthOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white transition text-sm font-medium"
                    >
                      <Key size={18} className="text-white/60" /> 
                      <span>Đổi mật khẩu</span>
                    </Link>
                  </li>
                </ul>

                <div className="h-px bg-white/10 my-2 mx-2" />

                <ul className="space-y-0.5 px-2 pb-2">
                  <li>
                    <button 
                      onClick={() => {
                        setIsAuthOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-lg text-red-500 transition text-sm font-semibold group"
                    >
                      <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" /> 
                      <span>Đăng xuất</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
