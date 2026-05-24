"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Play, Users, Info, ChevronRight, Share2, MoreHorizontal, Flag, AlertTriangle, X, Copy, ShieldCheck, Trash2 } from 'lucide-react';
import VideoCard from '@/views/components/VideoCard';
import { getUploadUrl } from '@/lib/utils';
import Link from 'next/link';
import { toggleFollow, submitChannelReportAction } from '@/lib/actions'; // Nhập action toggleFollow & submitChannelReportAction
import { useUI } from '@/context/UIContext'; // Nhập useUI

interface ChannelPageProps {
  channel: any;
  videos: any[];
  user?: any;
}

export default function ChannelPage({ channel, videos, user }: ChannelPageProps) {
  const [activeTab, setActiveTab] = useState('home');
  const { setIsLoginDropdownOpen } = useUI(); // Lấy trigger login toàn cục

  // Trạng thái theo dõi động
  const [isFollowed, setIsFollowed] = useState(channel.is_followed === 1);
  const [subCount, setSubCount] = useState(channel.sub_count || 0);

  // Đảm bảo đồng bộ trạng thái khi component render
  React.useEffect(() => {
    setIsFollowed(channel.is_followed === 1);
    setSubCount(channel.sub_count || 0);
  }, [channel]);

  // Share & Report menu states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam hoặc gây hiểu lầm');
  const [customReportReason, setCustomReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Toast automatic dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check if owner of the channel
  const isOwner = user && (channel.user?._id || channel.user || '').toString() === (user.id || '').toString();

  const ensureUserLoggedIn = (actionName: string) => {
    if (!user) {
      const confirmLogin = window.confirm(`Bạn cần đăng nhập để ${actionName}. Bạn có muốn đăng nhập ngay không?`);
      if (confirmLogin) {
        setIsLoginDropdownOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return false;
    }
    return true;
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureUserLoggedIn('Báo cáo kênh vi phạm')) return;
    
    setIsSubmittingReport(true);
    const finalReason = reportReason === 'Lý do khác' && customReportReason.trim()
      ? `Lý do khác: ${customReportReason.trim()}`
      : reportReason;
      
    try {
      const res = await submitChannelReportAction(channel.channel_id.toString(), user.id.toString(), finalReason);
      if (res && (res._id || res.success !== false)) {
        setToast({ message: 'Gửi báo cáo kênh thành công! Chúng tôi sẽ kiểm duyệt nội dung sớm nhất.', type: 'success' });
        setIsReportModalOpen(false);
        setCustomReportReason('');
      } else {
        setToast({ message: res.message || 'Lỗi gửi báo cáo. Vui lòng thử lại sau!', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Lỗi kết nối server.', type: 'error' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!channel) return <div className="text-white p-10 text-center">Kênh không tồn tại</div>;

  const handleToggleFollow = async () => {
    if (!user) {
      const confirmLogin = window.confirm(`Bạn cần đăng nhập bằng tài khoản mạng xã hội để đăng ký kênh [${channel.channel_name}]. Click OK để đăng nhập ngay!`);
      if (confirmLogin) {
        setIsLoginDropdownOpen(true); // Bung form đăng nhập ở Header
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt lên trên cùng
      }
      return;
    }

    const res = await toggleFollow(channel.channel_id, user.id.toString());
    if (res.success) {
      setIsFollowed(res.isFollowed);
      setSubCount(prev => res.isFollowed ? prev + 1 : prev - 1);
    }
  };

  const tabs = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'videos', label: 'Video' },
    { id: 'shorts', label: 'Shorts' },
    { id: 'about', label: 'Giới thiệu' },
  ];

  return (
    <div className="max-w-[1284px] mx-auto pb-20 animate-in fade-in duration-700">
      {/* Channel Header */}
      <div className="px-4 md:px-0">
        {/* Banner */}
        <div className="relative w-full aspect-[6/1] md:aspect-[6.2/1] rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/5 shadow-2xl mb-6">
          {channel.banner_url ? (
            <img 
              src={getUploadUrl(channel.banner_url)} 
              className="w-full h-full object-cover" 
              alt="Channel Banner" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
               <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-800 to-black" />
            </div>
          )}
        </div>

        {/* Channel Info */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-black shadow-2xl bg-zinc-800">
            <img 
              src={getUploadUrl(channel.avatar_url, '/assets/img/avata.jpg')} 
              className="w-full h-full object-cover" 
              alt={channel.channel_name} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
              }}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{channel.channel_name}</h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400 text-sm mb-4">
              <span className="font-medium text-white/90">@{channel.channel_name.toLowerCase().replace(/\s+/g, '')}</span>
              <span>•</span>
              <span>{subCount.toLocaleString('vi-VN')} người đăng ký</span>
              <span>•</span>
              <span>{videos.length} video</span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <p className="text-zinc-400 text-sm line-clamp-1 max-w-xl">
                {channel.description || "Chào mừng bạn đến với kênh của tôi!"}
              </p>
              <button 
                onClick={() => setActiveTab('about')}
                className="text-white hover:text-red-500 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handleToggleFollow}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
                  isFollowed 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isFollowed ? 'Đã theo dõi' : 'Theo dõi'}
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2"
              >
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all active:scale-95"
                >
                  <MoreHorizontal size={20} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2.5 w-48 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl py-1.5 shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {isOwner ? (
                      <Link
                        href="/studio"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-white/5 hover:text-red-400 flex items-center gap-2 transition font-medium"
                      >
                        <Trash2 size={16} />
                        <span>Xóa kênh</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (ensureUserLoggedIn('Báo cáo kênh vi phạm')) {
                            setIsReportModalOpen(true);
                          }
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-2 transition font-medium"
                      >
                        <Flag size={16} />
                        <span>Báo cáo kênh</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-4 md:px-0 sticky top-0 bg-[#0f0f0f]/80 backdrop-blur-md z-10 mb-8">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold whitespace-nowrap transition-all relative ${
                activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-current rounded-t-full" />
              )}
            </button>
          ))}
          <div className="flex-1" />
          <button className="pb-3 text-zinc-400 hover:text-white">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-0">
        {activeTab === 'home' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Featured Section */}
            {videos.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-900/40 p-6 rounded-2xl border border-white/5">
                <div className="lg:col-span-4 aspect-video rounded-xl overflow-hidden shadow-2xl">
                    <Link href={`/watch/${videos[0]._id || videos[0].video_id}`}>
                        <img 
                            src={getUploadUrl(videos[0].thumbnail_url)} 
                            className="w-full h-full object-cover hover:scale-105 transition-all duration-700" 
                            alt={videos[0].title} 
                        />
                    </Link>
                </div>
                <div className="lg:col-span-8 flex flex-col justify-center">
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {videos[0].title}
                  </h2>
                  <p className="text-zinc-400 text-xs mb-4">
                    {videos[0].view_count} lượt xem • {new Date(videos[0].createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-zinc-300 text-sm line-clamp-3 mb-6">
                    {videos[0].description || "Không có mô tả cho video này."}
                  </p>
                  <Link 
                    href={`/watch/${videos[0]._id || videos[0].video_id}`}
                    className="flex items-center gap-2 text-white font-bold text-sm bg-white/10 hover:bg-white/20 self-start px-4 py-2 rounded-full transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                    Xem ngay
                  </Link>
                </div>
              </div>
            )}

            {/* Latest Videos Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Video mới nhất
                    <ChevronRight size={20} className="text-zinc-500" />
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.slice(0, 8).map((video) => (
                  <VideoCard 
                    key={video._id} 
                    video={{
                        video_id: video._id,
                        title: video.title,
                        thumbnail_url: video.thumbnail_url,
                        view_count: video.view_count || 0,
                        duration: video.duration || 0,
                        created_at: video.createdAt,
                        channel_name: channel.channel_name,
                        channel_avatar: channel.avatar_url,
                        is_free: video.is_free,
                        channel_user_id: channel.user?._id || channel.user || ''
                    }} 
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-8">
                <button className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold">Mới nhất</button>
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Phổ biến</button>
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Cũ nhất</button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard 
                    key={video._id} 
                    video={{
                        video_id: video._id,
                        title: video.title,
                        thumbnail_url: video.thumbnail_url,
                        view_count: video.view_count || 0,
                        duration: video.duration || 0,
                        created_at: video.createdAt,
                        channel_name: channel.channel_name,
                        channel_avatar: channel.avatar_url,
                        is_free: video.is_free,
                        channel_user_id: channel.user?._id || channel.user || ''
                    }} 
                  />
                ))}
              </div>
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 animate-in fade-in duration-500">
             <div className="bg-zinc-900 p-8 rounded-full mb-6">
                <Play size={48} className="text-zinc-700" />
             </div>
             <p className="text-lg font-bold">Chưa có video Shorts nào</p>
             <p className="text-sm">Hãy thử quay lại sau nhé!</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2">
               <h3 className="text-xl font-bold text-white mb-6">Mô tả</h3>
               <div className="text-zinc-300 text-base whitespace-pre-line leading-relaxed">
                  {channel.description || "Kênh này chưa có mô tả."}
               </div>
               
               <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Chi tiết</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                     <div>
                        <p className="text-zinc-500 text-sm mb-1">Email liên hệ</p>
                        <p className="text-white text-sm">Chưa cung cấp</p>
                     </div>
                     <div>
                        <p className="text-zinc-500 text-sm mb-1">Vị trí</p>
                        <p className="text-white text-sm">Việt Nam</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="lg:col-span-1">
                <h3 className="text-xl font-bold text-white mb-6">Thống kê</h3>
                <div className="space-y-4 pt-4 border-t border-white/10">
                   <div className="flex items-center gap-3 text-zinc-400">
                      <Users size={18} />
                      <span className="text-sm">{subCount.toLocaleString('vi-VN')} người đăng ký</span>
                   </div>
                   <div className="flex items-center gap-3 text-zinc-400">
                      <Play size={18} />
                      <span className="text-sm">{videos.reduce((acc, v) => acc + (v.view_count || 0), 0).toLocaleString('vi-VN')} lượt xem</span>
                   </div>
                   <div className="flex items-center gap-3 text-zinc-400">
                      <Info size={18} />
                      <span className="text-sm">Tham gia ngày {new Date(channel.createdAt).toLocaleDateString('vi-VN')}</span>
                   </div>
                </div>
                
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                   <Share2 size={18} />
                   <span className="font-bold">Chia sẻ kênh</span>
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Glassmorphic Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Share2 size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Chia sẻ kênh</h3>
                <p className="text-xs text-white/50">Chia sẻ kênh "{channel.channel_name}" đến mọi người.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Facebook</span>
              </a>

              <a
                href={`https://zalo.me/share?to=&utm_source=zaloshare&utm_medium=zalo&utm_campaign=share&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition font-black text-xs">
                  Zalo
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Zalo</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(channel.channel_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Twitter / X</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(channel.channel_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.24-.213-.054-.33-.373-.12l-6.87 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.536-.2 1.006.12.834.938z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Telegram</span>
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 block text-left">Hoặc sao chép liên kết:</label>
              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 pl-4">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="bg-transparent flex-1 text-xs text-white/80 outline-none select-all min-w-0"
                />
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      setToast({ message: 'Sao chép liên kết kênh thành công!', type: 'success' });
                      setIsShareModalOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/10 active:scale-95 flex-shrink-0"
                >
                  <Copy size={14} />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>

            {/* Native Share Trigger if supported */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: channel.channel_name,
                        text: `Ghé thăm kênh "${channel.channel_name}" trên MyTube`,
                        url: window.location.href
                      });
                      setIsShareModalOpen(false);
                    } catch (err) {
                      console.log('Share canceled or failed:', err);
                    }
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-2xl transition border border-white/5 hover:border-white/10 text-center"
                >
                  Chia sẻ qua ứng dụng khác...
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Glassmorphic Channel Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Báo cáo kênh vi phạm</h3>
                <p className="text-xs text-white/50">Chúng tôi sẽ xem xét báo cáo kênh này trong vòng 24 giờ.</p>
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 block text-left">Chọn lý do báo cáo:</label>
                {[
                  'Spam hoặc gây hiểu lầm',
                  'Kênh giả mạo hoặc lừa đảo',
                  'Nội dung bạo lực hoặc phản cảm',
                  'Quấy rối hoặc bắt nạt',
                  'Vi phạm bản quyền',
                  'Lý do khác'
                ].map((reason) => (
                  <label 
                    key={reason}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      reportReason === reason 
                        ? 'bg-red-500/10 border-red-500/30 text-white' 
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm font-medium">{reason}</span>
                    <input 
                      type="radio" 
                      name="reportReason" 
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {reportReason === 'Lý do khác' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-semibold text-white/60 block text-left">Mô tả lý do chi tiết:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Mô tả lý do bạn báo cáo kênh này..."
                    value={customReportReason}
                    onChange={(e) => setCustomReportReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-red-500/40 transition resize-none text-left"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {isSubmittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Micro Floating Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-sm bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 text-left">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {toast.type === 'success' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {toast.type === 'success' ? 'Thông báo' : 'Có lỗi xảy ra'}
            </p>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
