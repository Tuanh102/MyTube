"use client";

import React, { useState } from 'react';
import { Search, Play, Users, Info, ChevronRight, Share2, MoreHorizontal } from 'lucide-react';
import VideoCard from '@/views/components/VideoCard';
import { getUploadUrl } from '@/lib/utils';
import Link from 'next/link';
import { toggleFollow } from '@/lib/actions'; // Nhập action toggleFollow
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
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2">
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-4 md:px-0 sticky top-0 bg-black/80 backdrop-blur-md z-10 mb-8">
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />
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
                
                <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2">
                   <Share2 size={18} />
                   <span className="font-bold">Chia sẻ kênh</span>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
