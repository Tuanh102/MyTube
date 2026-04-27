"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageSquare, Share2, Music2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getUploadUrl } from '@/lib/utils';

interface ShortVideo {
  video_id: number;
  title: string;
  video_url: string;
  channel_name: string;
  channel_avatar: string;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
}

interface ShortsPageProps {
  shorts: ShortVideo[];
}

export default function ShortsPage({ shorts }: ShortsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoId = parseInt(entry.target.getAttribute('data-id') || '0');
        const video = videoRefs.current.get(videoId);
        if (video) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    }, observerOptions);

    const items = document.querySelectorAll('.short-item');
    items.forEach(item => observer.observe(item));

    return () => {
      observer.disconnect();
      videoRefs.current.forEach(video => {
        if (video) video.pause();
      });
    };
  }, [shorts]);

  if (shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-white/50">
        <p className="text-xl mb-4">Chưa có video ngắn nào.</p>
        <Link href="/" className="text-red-500 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] -m-4 overflow-hidden">
      <Link href="/" className="absolute top-4 left-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition">
        <ArrowLeft size={24} />
      </Link>

      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {shorts.map((short) => (
          <div 
            key={short.video_id}
            data-id={short.video_id}
            className="short-item h-full w-full snap-start relative flex items-center justify-center bg-black"
          >
            <div className="relative h-full aspect-[9/16] bg-zinc-900 shadow-2xl">
              <video 
                ref={el => { if (el) videoRefs.current.set(short.video_id, el); }}
                src={getUploadUrl(short.video_url)}
                loop
                playsInline
                className="h-full w-full object-cover"
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 pointer-events-none">
                <div className="pointer-events-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={getUploadUrl(short.channel_avatar, '/assets/img/avata.jpg')} 
                      className="w-10 h-10 rounded-full border border-white/20 object-cover"
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                      }}
                    />
                    <span className="text-white font-bold text-sm">@{short.channel_name}</span>
                    <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold hover:bg-white/90">
                      Đăng ký
                    </button>
                  </div>
                  <p className="text-white text-sm mb-3 line-clamp-2">{short.title}</p>
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Music2 size={14} />
                    <span className="truncate">Âm thanh gốc - {short.channel_name}</span>
                  </div>
                </div>
              </div>

              {/* Interaction Sidebar */}
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6 z-10">
                <button className="flex flex-col items-center gap-1 group">
                  <div className={`p-3 rounded-full transition ${short.isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                    <Heart size={24} fill={short.isLiked ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-white text-xs font-bold">{short.likes_count}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-white/10 rounded-full text-white group-hover:bg-white/20 transition">
                    <MessageSquare size={24} />
                  </div>
                  <span className="text-white text-xs font-bold">{short.comments_count}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-white/10 rounded-full text-white group-hover:bg-white/20 transition">
                    <Share2 size={24} />
                  </div>
                  <span className="text-white text-xs font-bold text-center">Chia sẻ</span>
                </button>

                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden animate-spin-slow">
                  <img 
                    src={getUploadUrl(short.channel_avatar, '/assets/img/avata.jpg')} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
