"use client";

import React, { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    image: '/assets/img/banner1.jpg',
    title: 'Khám phá không gian video mới',
    description: 'Chào mừng bạn quay lại với MyTube. Trải nghiệm tốc độ và sự mượt mà hoàn toàn mới với Next.js.'
  },
  {
    id: 2,
    image: '/assets/img/banner2.png',
    title: 'Nâng tầm trải nghiệm người dùng',
    description: 'Khám phá hàng ngàn video chất lượng cao với giao diện hiện đại, tinh tế và tối ưu cho mọi thiết bị.'
  }
];

export default function HomeBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (lastIndex !== -1) {
      const timer = setTimeout(() => {
        setLastIndex(-1);
      }, 1000); // Khớp với duration của transition
      return () => clearTimeout(timer);
    }
  }, [lastIndex]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full mb-6 md:h-[260px] lg:h-[300px]">
      {/* Shortened Banner Carousel (2/3 Width on Desktop) */}
      <div className="relative md:col-span-8 h-[180px] md:h-full rounded-2xl overflow-hidden group shadow-lg border border-white/5">
        {banners.map((banner, index) => {
          const isCurrent = index === currentIndex;
          const isLast = index === lastIndex;
          
          let positionClass = "translate-x-full opacity-0";
          let transitionClass = "transition-all duration-1000";

          if (isCurrent) {
            positionClass = "translate-x-0 opacity-100 z-10";
          } else if (isLast) {
            positionClass = "-translate-x-full opacity-0 z-0";
          } else {
            transitionClass = "transition-none";
          }

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 ease-in-out ${positionClass} ${transitionClass}`}
            >
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 md:p-8">
                <div className={`max-w-md transition-all duration-700 delay-300 ${
                  index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <span className="bg-amber-400 text-zinc-950 text-[9px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block tracking-widest animate-pulse">
                    Nổi bật
                  </span>
                  <h2 className="text-xl md:text-3xl font-black text-white mb-1.5 italic drop-shadow-md leading-tight">
                    {banner.title}
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm line-clamp-2 drop-shadow-sm font-medium">
                    {banner.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Indicators */}
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentIndex) {
                  setLastIndex(currentIndex);
                  setCurrentIndex(index);
                }
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'w-5 bg-amber-400' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stacked Ads Section (1/3 Width on Desktop) */}
      <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 h-full">
        {/* Xanh SM Ad */}
        <a 
          href="https://www.xanhsm.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 min-h-[110px] md:min-h-0 rounded-2xl overflow-hidden relative group border border-white/10 hover:border-[#00e5ff]/50 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] flex flex-col justify-end p-4"
        >
          {/* Background image */}
          <img 
            src="/assets/img/bannerXanhSM.png" 
            alt="Xanh SM" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          {/* Cyan/Green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/20 group-hover:via-zinc-950/50 transition-all duration-300" />
          
          <div className="relative z-10 flex flex-col text-left pr-16">
            <span className="bg-[#00f5d4] text-zinc-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider self-start mb-1.5 shadow-sm shadow-[#00f5d4]/20 animate-pulse">
              Tài trợ
            </span>
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00e5ff] transition-colors leading-tight">
              XANH SM
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-semibold line-clamp-1 mt-0.5">
              Taxi Điện & Xe Máy Điện Tiên Phong - Đặt xe dễ dàng
            </p>
          </div>

          {/* Interactive Slide-in CTA Pill */}
          <div className="absolute bottom-4 right-4 bg-white/10 group-hover:bg-white backdrop-blur-md text-white group-hover:text-zinc-950 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/15 group-hover:border-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1 shadow-md">
            Khám phá 
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Lifebuoy Soap Ad */}
        <a 
          href="https://www.lifebuoy.vn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 min-h-[110px] md:min-h-0 rounded-2xl overflow-hidden relative group border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-end p-4"
        >
          {/* Background image */}
          <img 
            src="/assets/img/lifebuoy_ad.png" 
            alt="Xà bông Lifebuoy" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          {/* Red gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/20 group-hover:via-zinc-950/50 transition-all duration-300" />
          
          <div className="relative z-10 flex flex-col text-left pr-16">
            <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider self-start mb-1.5 shadow-sm shadow-red-500/20">
              Tài trợ
            </span>
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider group-hover:text-red-400 transition-colors leading-tight">
              LIFEBUOY VIỆT NAM
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-semibold line-clamp-1 mt-0.5">
              Sạch khuẩn 99.9% - Bảo vệ đề kháng da tự nhiên
            </p>
          </div>

          {/* Interactive Slide-in CTA Pill */}
          <div className="absolute bottom-4 right-4 bg-white/10 group-hover:bg-white backdrop-blur-md text-white group-hover:text-zinc-950 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/15 group-hover:border-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1 shadow-md">
            Chi tiết 
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
}
