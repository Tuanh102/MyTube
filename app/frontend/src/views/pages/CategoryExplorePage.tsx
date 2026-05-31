import React from 'react';
import Link from 'next/link';
import { Music, Gamepad, Clapperboard, Newspaper, Lightbulb, Home, LucideIcon } from 'lucide-react';
import VideoCard from '../components/VideoCard';

const iconMap: Record<string, LucideIcon> = {
  music: Music,
  games: Gamepad,
  movies: Clapperboard,
  news: Newspaper,
  learning: Lightbulb,
};

interface CategoryExplorePageProps {
  title: string;
  description: string;
  gradient: string;
  iconName: string;
  videos: any[];
}

export default function CategoryExplorePage({
  title,
  description,
  gradient,
  iconName,
  videos
}: CategoryExplorePageProps) {
  const Icon = iconMap[iconName] || Home;
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Premium Header Banner */}
      <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-12 border border-white/10 bg-gradient-to-br ${gradient} shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 group`}>
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-white/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/10 blur-[100px] pointer-events-none transition-all duration-750 group-hover:scale-110" />
        
        {/* Dark overlay for depth */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Ultra-Premium Glassmorphic Icon Container */}
            <div className="p-5 md:p-6 bg-white/[0.07] backdrop-blur-2xl border border-white/25 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center justify-center transform transition duration-500 hover:rotate-6 hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(255,255,255,0.05)]">
              <Icon className="text-white w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm select-none">
                {title}
              </h1>
              <p className="text-white/80 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Glass Badge with glow border */}
          <div className="px-6 py-3.5 bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/15 text-xs md:text-sm font-black text-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] whitespace-nowrap self-start md:self-auto transform hover:scale-102 hover:bg-white/[0.12] transition duration-300">
            🔥 {videos.length} video thịnh hành
          </div>
        </div>
      </div>

      {/* Video Content Section */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {videos.map((video) => (
            <VideoCard key={video.video_id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-center animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="p-6 bg-white/5 rounded-full border border-white/5">
              <Icon className="text-white/20 w-16 h-16" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Chưa có video nào</h3>
          <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-8">
            Hãy khám phá các mục khác hoặc quay lại trang chủ để thưởng thức thêm nhiều video hấp dẫn.
          </p>
          <Link 
            href="/" 
            className="flex items-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-white/90 font-black rounded-full shadow-xl transition active:scale-95 duration-200"
          >
            <Home size={18} />
            <span>Quay lại Trang chủ</span>
          </Link>
        </div>
      )}
    </div>
  );
}
