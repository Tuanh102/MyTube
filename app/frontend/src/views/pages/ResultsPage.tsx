"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatDuration, getUploadUrl } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

interface ResultsPageProps {
  videos: any[];
  query: string;
  suggestedVideos?: any[];
}

export default function ResultsPage({ videos, query, suggestedVideos = [] }: ResultsPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-[1000px] mx-auto py-6 px-4">
      <h2 className="text-white text-lg font-medium mb-6">
        Kết quả tìm kiếm cho: <span className="font-bold text-red-500">"{query}"</span>
      </h2>

      <div className="flex flex-col gap-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoResultCard key={video.video_id} video={video} />
          ))
        ) : (
          <div className="text-white/40 text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-8 animate-in fade-in duration-500">
            <p className="text-xl font-bold mb-2 text-white">Không tìm thấy kết quả nào</p>
            <p className="text-sm">Rất tiếc, không tìm thấy video phù hợp với từ khóa của bạn. Hãy thử tìm kiếm bằng từ khóa khác!</p>
          </div>
        )}
      </div>

      {videos.length === 0 && suggestedVideos.length > 0 && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#FF0000] rounded-full"></span>
            Gợi ý các video phổ biến nhất dành cho bạn
          </h3>
          <div className="flex flex-col gap-4">
            {suggestedVideos.map((video) => (
              <VideoResultCard key={video.video_id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoResultCard({ video }: { video: any }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className="group relative flex flex-col sm:flex-row gap-4 p-3 rounded-2xl transition-all duration-500 hover:bg-white/5 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer video-result-card"
    >
      {/* Thumbnail */}
      <Link href={`/watch/${video.video_id}`} className="relative w-full sm:w-[360px] aspect-video rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={getUploadUrl(video.thumbnail_url, '/assets/img/default-thumb.jpg')} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt={video.title}
        />
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold z-10" style={{ color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          {formatDuration(video.duration || 0)}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-2 py-1">
        <Link href={`/watch/${video.video_id}`}>
          <h3 className="text-white text-lg font-bold line-clamp-2 group-hover:text-red-500 transition-colors duration-300">
            {video.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
          <span>•</span>
          <span>{new Date(video.uploaded_at).toLocaleDateString('vi-VN')}</span>
        </div>

        <div className="flex items-center gap-2 my-2">
          <div className="relative">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5">
              <img 
                src={getUploadUrl(video.channel_avatar, '/assets/img/avata.jpg')} 
                className="w-full h-full object-cover" 
                alt={video.channel_name} 
              />
            </div>
            {video.channel_is_verified && (
              <div 
                className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-[#0f0f0f] flex items-center justify-center shadow-lg"
                title="Kênh đã xác minh"
              >
                <span className="w-0.5 h-0.5 bg-white rounded-full"></span>
              </div>
            )}
          </div>
          <span className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <span>{video.channel_name}</span>
            {video.channel_is_verified && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-black text-white" title="Kênh đã xác minh">✓</span>
            )}
          </span>
        </div>

        <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
          {video.description || 'Không có mô tả cho video này.'}
        </p>
      </div>

      <style jsx>{`
        .video-result-card {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .video-result-card.reveal {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
