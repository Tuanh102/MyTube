"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, Play, Share2, Ticket, Sparkles, ExternalLink, Search } from 'lucide-react';
import { getUploadUrl } from '@/lib/utils';

interface PurchasedPageProps {
  videos: any[];
}

export default function PurchasedPage({ videos }: PurchasedPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc video theo thanh tìm kiếm
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* HEADER HOÀNG GIA - GOLDEN PREMIUM STYLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-6">
        <div className="flex items-center gap-5 relative">
          {/* Hào quang vàng kim hoàng gia phát sáng đằng sau icon */}
          <div className="relative flex-shrink-0">
            <div className="p-3.5 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 rounded-2xl relative z-10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Crown size={28} className="text-amber-400 fill-amber-400 animate-[pulse_2s_infinite]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 blur-2xl rounded-full opacity-40 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Nội dung đã mua
              </span>
              <Sparkles size={16} className="text-amber-400 fill-amber-400 animate-bounce" />
            </h1>
            <p className="text-xs text-amber-400/70 font-black tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
              <span>Premium VIP</span>
              <span className="w-1 h-1 bg-amber-400/40 rounded-full"></span>
              <span>{filteredVideos.length} / {videos.length} nội dung</span>
            </p>
          </div>
        </div>

        {/* Thanh tìm kiếm nhanh & Phát tất cả */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {videos.length > 0 && (
            <div className="relative w-full sm:w-60">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Tìm nội dung đã mua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/40 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          )}

          {filteredVideos.length > 0 && (
            <Link 
              href={`/watch/${filteredVideos[0].video_id}`}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-black hover:from-amber-400 hover:to-orange-400 transition shadow-[0_4px_20px_rgba(245,158,11,0.25)] active:scale-95 group w-full sm:w-auto flex-shrink-0"
            >
              <Play size={16} fill="currentColor" className="group-hover:scale-110 transition" />
              <span>Phát tất cả</span>
            </Link>
          )}
        </div>
      </div>

      {/* DANH SÁCH VIDEO ĐÃ MUA DẠNG LƯỚI COMPACT GRID */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredVideos.map((video) => (
            <div 
              key={video.video_id} 
              className="group flex flex-col bg-white/5 hover:bg-gradient-to-b hover:from-white/10 hover:to-amber-500/5 rounded-2xl border border-white/5 hover:border-amber-400/20 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
            >
              {/* Thumbnail Area */}
              <Link href={`/watch/${video.video_id}`} className="relative w-full aspect-video overflow-hidden bg-black/40">
                <img 
                  src={getUploadUrl(video.thumbnail_url)} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                  alt={video.title} 
                />
                
                {/* Lớp phủ hover xuất hiện nút Play nhanh */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-10 h-10 bg-amber-400 text-black rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition duration-300">
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>

                {/* Badge "ĐÃ MUA" hoàng gia lộng lẫy */}
                <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                  <Ticket size={8} fill="currentColor" />
                  <span>Đã sở hữu</span>
                </div>

                {/* Thời lượng */}
                <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-black text-white border border-white/5">
                  {video.duration ? Math.floor(video.duration / 60) + ':' + (video.duration % 60).toString().padStart(2, '0') : '10:00'}
                </div>
              </Link>
              
              {/* Text Info Area */}
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <Link href={`/watch/${video.video_id}`}>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition duration-300 h-10">
                      {video.title}
                    </h3>
                  </Link>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-amber-400/80 font-bold hover:text-amber-400 transition cursor-pointer truncate">
                      {video.channel_name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-bold">
                      <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action of Card */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                  <span className="text-[9px] font-extrabold text-amber-400/70 uppercase bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                    Premium Content
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-white/5 rounded-md text-white/40 hover:text-white transition-colors" title="Chia sẻ">
                      <Share2 size={12} />
                    </button>
                    <Link href={`/watch/${video.video_id}`} className="p-1.5 hover:bg-amber-400/10 rounded-md text-white/40 hover:text-amber-400 transition-colors" title="Xem ngay">
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TRẠNG THÁI TRỐNG HOÀNG GIA - GOLDEN EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-28 bg-white/5 rounded-[40px] border border-white/5 relative overflow-hidden">
          {/* Background glowing aura */}
          <div className="absolute w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[80px]" />
          
          <div className="relative mb-6">
            <Crown size={80} className="text-white/5 fill-transparent" />
            <Ticket size={30} className="text-amber-500/20 absolute bottom-0 right-0 animate-bounce" fill="currentColor" />
          </div>
          <p className="text-xl font-black text-white/40">
            {searchQuery ? "Không tìm thấy nội dung phù hợp" : "Chưa có video sở hữu"}
          </p>
          <p className="text-xs text-white/20 mt-1.5 max-w-sm text-center leading-relaxed font-medium">
            {searchQuery 
              ? "Hãy thử tìm kiếm với các từ khoá khác hoặc kiểm tra lại tên kênh."
              : "Bạn chưa mua video trả phí nào. Các nội dung độc quyền sau khi mua sẽ được lưu giữ vĩnh viễn và hiển thị gọn gàng ở đây."
            }
          </p>
          <Link 
            href="/" 
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black rounded-full text-xs font-black hover:from-amber-400 hover:to-orange-400 transition active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
          >
            {searchQuery ? "Xoá bộ lọc" : "Khám phá ngay"}
          </Link>
        </div>
      )}
    </div>
  );
}
