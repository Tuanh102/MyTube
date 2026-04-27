"use client";

import React from 'react';
import VideoCard from '@/views/components/VideoCard';
import Link from 'next/link';

interface LikesPageProps {
  videos: any[];
}

import { ThumbsUp, Play, MoreVertical, Share2, Trash2 } from 'lucide-react';

export default function LikesPage({ videos }: LikesPageProps) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-2xl">
            <ThumbsUp size={24} className="text-red-500" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Video đã thích</h1>
            <p className="text-sm text-white/40">{videos.length} video</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-white/90 transition shadow-lg active:scale-95">
          <Play size={18} fill="currentColor" />
          <span>Phát tất cả</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div key={video.video_id} className="group flex items-center gap-4 p-2 hover:bg-white/5 rounded-2xl transition relative">
              <div className="text-white/20 text-sm font-bold w-6 text-center group-hover:hidden">
                {index + 1}
              </div>
              <div className="hidden group-hover:flex w-6 justify-center">
                <Play size={14} className="text-white" fill="currentColor" />
              </div>

              <Link href={`/watch/${video.video_id}`} className="flex flex-col md:flex-row gap-4 flex-1 min-w-0">
                <div className="relative w-full md:w-52 aspect-video rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                  <img 
                    src={video.thumbnail_url?.startsWith('http') ? video.thumbnail_url : (video.thumbnail_url ? `/uploads/${video.thumbnail_url}` : '/assets/img/default-thumb.jpg')} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    alt="" 
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                    {video.duration ? Math.floor(video.duration / 60) + ':' + (video.duration % 60).toString().padStart(2, '0') : '10:00'}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-red-500 transition">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                    <span>{video.channel_name}</span>
                    <span>•</span>
                    <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                  <p className="text-xs text-white/30 mt-2 line-clamp-2 hidden md:block">
                    {video.description || 'Không có mô tả cho video này.'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition px-2">
                <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition" title="Chia sẻ">
                  <Share2 size={18} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-red-500 transition" title="Xóa khỏi danh sách đã thích">
                  <Trash2 size={18} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-white/20">
            <ThumbsUp size={80} className="mb-4 opacity-10" />
            <p className="text-xl font-bold">Chưa có video nào</p>
            <p className="text-sm">Những video bạn thích sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}


