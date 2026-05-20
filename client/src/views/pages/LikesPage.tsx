"use client";

import React from 'react';
import Link from 'next/link';
import { ThumbsUp, Play, MoreVertical, Share2, Trash2, Heart } from 'lucide-react';
import { getUploadUrl } from '@/lib/utils';

interface LikesPageProps {
  videos: any[];
}

export default function LikesPage({ videos }: LikesPageProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-4 bg-red-600/20 rounded-3xl relative z-10">
                <Heart size={32} className="text-red-500" fill="currentColor" />
            </div>
            <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full"></div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Video đã thích</h1>
            <p className="text-sm text-white/40 font-medium tracking-wide uppercase">{videos.length} video trong danh sách</p>
          </div>
        </div>
        <button className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-black hover:bg-white/90 transition shadow-2xl active:scale-95 group">
          <Play size={20} fill="currentColor" className="group-hover:scale-110 transition" />
          <span>Phát tất cả</span>
        </button>
      </div>

      <div className="grid gap-3">
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div key={video.video_id} className="group flex items-center gap-4 p-3 hover:bg-white/5 rounded-3xl transition relative border border-transparent hover:border-white/5 overflow-hidden">
              <div className="text-white/20 text-base font-black w-8 text-center group-hover:hidden transition-all">
                {index + 1}
              </div>
              <div className="hidden group-hover:flex w-8 justify-center animate-in fade-in zoom-in duration-200">
                <Play size={16} className="text-red-500" fill="currentColor" />
              </div>

              <Link href={`/watch/${video.video_id}`} className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                <div className="relative w-full sm:w-56 aspect-video rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                  <img 
                    src={getUploadUrl(video.thumbnail_url)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                    alt="" 
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white">
                    {video.duration ? Math.floor(video.duration / 60) + ':' + (video.duration % 60).toString().padStart(2, '0') : '10:00'}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition duration-300">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-white/40 font-bold">
                    <span className="text-white/60 hover:text-red-500 transition cursor-pointer">{video.channel_name}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                  <p className="text-sm text-white/30 mt-3 line-clamp-2 hidden md:block leading-relaxed">
                    {video.description || 'Không có mô tả cho video này.'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 px-2">
                <button className="p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition" title="Chia sẻ">
                  <Share2 size={20} />
                </button>
                <button className="p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-red-500 transition" title="Xóa khỏi danh sách">
                  <Trash2 size={20} />
                </button>
                <button className="p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[40px] border border-white/5">
            <div className="relative mb-8">
                <ThumbsUp size={100} className="text-white/5" />
                <Heart size={40} className="text-red-500/20 absolute bottom-0 right-0 animate-bounce" fill="currentColor" />
            </div>
            <p className="text-2xl font-black text-white/40">Chưa có video nào</p>
            <p className="text-sm text-white/20 mt-2">Hãy Like những video tuyệt vời để lưu chúng ở đây.</p>
            <Link href="/" className="mt-8 px-10 py-4 bg-white text-black rounded-full font-black hover:bg-white/90 transition active:scale-95 shadow-2xl">
                Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
