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
    <div className="relative w-full aspect-[21/9] md:aspect-[25/7] rounded-2xl overflow-hidden mb-2 group">
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
          // Slide đang đợi ở bên phải, không dùng transition khi reset vị trí
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
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 md:p-10">
            <div className={`max-w-xl transition-all duration-700 delay-300 ${
              index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 italic drop-shadow-lg">
                {banner.title}
              </h2>
              <p className="text-white/90 text-sm md:text-base line-clamp-2 drop-shadow-md">
                {banner.description}
              </p>
            </div>
          </div>
          </div>
        );
      })}
      
      {/* Indicators */}
      <div className="absolute bottom-4 right-6 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentIndex) {
                setLastIndex(currentIndex);
                setCurrentIndex(index);
              }
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
