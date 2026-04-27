"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { X, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useRouter, usePathname } from 'next/navigation';
import { getUploadUrl } from '@/lib/utils';

export default function MiniPlayer() {
  const { 
    activeVideo, 
    closeMiniPlayer, 
    setMiniPlayerTime, 
    miniPlayerTime,
    isPlaying,
    setIsPlaying,
    setIsMiniPlayerActive
  } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Kiểm tra an toàn cho pathname
  const isWatchPage = pathname?.startsWith('/watch/');
  const isShortsPage = pathname?.startsWith('/shorts');

  useEffect(() => {
    return () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };
  }, []);

  useLayoutEffect(() => {
    if (!isWatchPage && !isShortsPage && activeVideo && videoRef.current) {
        // Đồng bộ thời gian NGAY LẬP TỨC
        videoRef.current.currentTime = miniPlayerTime;
        
        // Cố gắng phát lại nếu đang ở trạng thái Playing
        if (isPlaying) {
            videoRef.current.play().catch(() => {
                console.log("Auto-play blocked by browser");
            });
        }
    }
  }, [isWatchPage, isShortsPage, activeVideo?.video_id, isPlaying]);


  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleDrag = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;

      // Kích thước trình phát và lề mặc định
      const playerWidth = 340;
      const playerHeight = 340 * (9/16);
      const margin = 24;

      // Tính toán giới hạn (giới hạn dựa trên transform: translate từ vị trí bottom-right)
      const maxX = margin; // Không cho quá lề phải
      const minX = -(window.innerWidth - playerWidth - margin); // Không cho quá lề trái
      
      const maxY = margin; // Không cho quá lề dưới
      const minY = -(window.innerHeight - playerHeight - margin); // Không cho quá lề trên

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Tính toán vị trí để "hít" vào góc gần nhất
    const playerWidth = 340;
    const playerHeight = 340 * (9/16);
    const margin = 24;

    const minX = -(window.innerWidth - playerWidth - margin * 2);
    const minY = -(window.innerHeight - playerHeight - margin * 2);

    // Quyết định hít vào bên trái hay bên phải
    const snapX = position.x < minX / 2 ? minX : 0;
    // Quyết định hít vào bên trên hay bên dưới
    const snapY = position.y < minY / 2 ? minY : 0;

    setPosition({ x: snapX, y: snapY });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, position]); // Cần theo dõi position để snap chuẩn

  const handleMaximize = () => {
    router.push(`/watch/${activeVideo?.video_id}`);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
        if (isPlaying) videoRef.current.pause();
        else videoRef.current.play();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  // QUAN TRỌNG: Lệnh return null phải nằm DƯỚI tất cả các Hook (useEffect, useState...)
  if (!activeVideo || isWatchPage || isShortsPage) return null;

  return (
    <div 
      className={`fixed z-[9999] shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black group select-none hover:shadow-red-500/20 ${!isDragging ? 'transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)' : ''}`}
      style={{ 
        bottom: '24px', 
        right: '24px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '340px',
        aspectRatio: '16/9',
        touchAction: 'none'
      }}
    >
      <div 
        className="absolute inset-0 z-10 cursor-move" 
        onMouseDown={handleDragStart}
      ></div>

      <video
        ref={videoRef}
        src={getUploadUrl(activeVideo.video_url)}
        className="w-full h-full object-cover"
        loop={false}
        playsInline
        onTimeUpdate={() => {
            if (videoRef.current) setMiniPlayerTime(videoRef.current.currentTime);
        }}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3 z-20 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
            <button 
                onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }} 
                className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
            >
                <X size={16} />
            </button>
            <div className="flex gap-2">
                <button 
                    onClick={toggleMute}
                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition"
                >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleMaximize(); }} 
                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition"
                >
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>

        <div className="flex justify-center pointer-events-auto">
            <button 
                onClick={togglePlay}
                className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition backdrop-blur-md scale-90 group-hover:scale-100"
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
        </div>

        <div className="pointer-events-none flex justify-between items-end">
            <p className="text-white text-[11px] font-medium truncate drop-shadow-lg bg-black/40 px-2 py-0.5 rounded-full max-w-[80%]">
                {activeVideo.title}
            </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-30">
          <div 
            className="h-full bg-red-600 transition-all duration-300"
            style={{ 
                width: videoRef.current ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` : '0%' 
            }}
          ></div>
      </div>
    </div>
  );
}
