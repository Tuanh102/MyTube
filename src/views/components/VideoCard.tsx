"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { formatDuration, getUploadUrl } from '@/lib/utils';


interface VideoCardProps {
  video: {
    video_id: number | string;
    title: string;
    thumbnail_url: string;
    video_url?: string;
    channel_name?: string;
    channel_avatar?: string;
    view_count: number;
    duration?: number;
    created_at?: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      // Delay video show slightly to avoid flickering on fast swipes
      timerRef.current = setTimeout(() => {
        setShowVideo(true);
      }, 500);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowVideo(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 10) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${video.video_id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#121212]">
          <img 
            src={getUploadUrl(video.thumbnail_url)} 
            alt={video.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop';
            }}
          />
          
          {showVideo && video.video_url && (
            <video
              ref={videoRef}
              src={getUploadUrl(video.video_url)}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold z-10">
            {formatDuration(video.duration || 0)}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/5">
            <img 
              src={getUploadUrl(video.channel_avatar, '/assets/img/avata.jpg')} 
              className="w-full h-full object-cover"
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
              }}
            />
          </div>
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold line-clamp-2 text-white mb-1 group-hover:text-red-500 transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-white/60 hover:text-white transition-colors">
              {video.channel_name || 'Kênh hệ thống'}
            </p>
            <p className="text-xs text-white/60">
              {video.view_count} lượt xem • 2 ngày trước
            </p>
          </div>
          <button className="text-white/40 hover:text-white self-start pt-1">
            <MoreVertical size={18} />
          </button>
        </div>
      </Link>
    </div>
  );
}
