"use client";

import React, { useState, useEffect } from 'react';
import { getUploadUrl } from '@/lib/utils';

interface AdItem {
  slotId: string;
  title: string;
  description: string;
  mediaUrl: string;
  linkUrl: string;
  badgeText: string;
  isActive: boolean;
  isMuted: boolean;
}

export default function HomeBanner() {
  const [mainBanners, setMainBanners] = useState<AdItem[]>([]);
  const [subBanners, setSubBanners] = useState<AdItem[]>([]);
  const [globalAdEnabled, setGlobalAdEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(-1);

  const trackAdEvent = async (slotId: string, type: 'view' | 'click') => {
    try {
      await fetch(`/api/ads/${slotId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.error(`Error tracking ${type} for ad ${slotId}:`, err);
    }
  };

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch('/api/ads?mode=public');
        if (res.ok) {
          const data = await res.json();
          const fetchedAds: AdItem[] = data.ads || [];
          
          const activeMains = fetchedAds.filter(ad => ad.slotId.startsWith('homepage_main') && ad.isActive);
          const activeSubs = fetchedAds.filter(ad => ad.slotId.startsWith('homepage_sub') && ad.isActive);
          
          // Shuffling active ads to rotate dynamically
          const shuffle = (array: AdItem[]) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          };
          
          setMainBanners(shuffle(activeMains));
          setSubBanners(shuffle(activeSubs));
          setGlobalAdEnabled(data.globalAdEnabled !== false);
        }
      } catch (err) {
        console.error("Failed to fetch ads for HomeBanner:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  const subAd1 = subBanners[0];
  const subAd2 = subBanners[1];

  const showMain = globalAdEnabled && mainBanners.length > 0;
  const showSub1 = globalAdEnabled && !!subAd1;
  const showSub2 = globalAdEnabled && !!subAd2;
  const showSub = showSub1 || showSub2;

  // Track view when main banner index changes
  useEffect(() => {
    if (showMain && mainBanners[currentIndex]) {
      trackAdEvent(mainBanners[currentIndex].slotId, 'view');
    }
  }, [currentIndex, mainBanners, showMain]);

  // Track views for sub banners on load
  useEffect(() => {
    if (globalAdEnabled) {
      if (subAd1) trackAdEvent(subAd1.slotId, 'view');
      if (subAd2) trackAdEvent(subAd2.slotId, 'view');
    }
  }, [subBanners, globalAdEnabled]);

  // Carousel timer
  useEffect(() => {
    if (!showMain || mainBanners.length <= 1) return;
    
    const timer = setInterval(() => {
      setLastIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, showMain, mainBanners.length]);

  useEffect(() => {
    if (lastIndex !== -1) {
      const timer = setTimeout(() => {
        setLastIndex(-1);
      }, 1000); // Transition duration match
      return () => clearTimeout(timer);
    }
  }, [lastIndex]);

  // Helper function to check if a URL is a video file
  const isVideoFile = (url?: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].split('#')[0];
    return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);
  };

  // If loading, show placeholder/skeleton (using premium layout aesthetics)
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full mb-6 md:h-[260px] lg:h-[300px] animate-pulse">
        <div className="md:col-span-8 h-[180px] md:h-full rounded-2xl bg-zinc-800/50" />
        <div className="md:col-span-4 flex flex-col gap-3 h-full">
          <div className="flex-1 rounded-2xl bg-zinc-800/30" />
          <div className="flex-1 rounded-2xl bg-zinc-800/30" />
        </div>
      </div>
    );
  }

  // If ads are disabled globally or no ads are active, hide the entire banner
  if (!globalAdEnabled || (!showMain && !showSub)) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent<HTMLAnchorElement>, ad: AdItem) => {
    trackAdEvent(ad.slotId, 'click');
    if (!ad.linkUrl || ad.linkUrl.trim() === "" || ad.linkUrl === "#" || ad.linkUrl === "/") {
      e.preventDefault();
    }
  };

  // Common card contents rendering to reduce duplication and keep it dry
  const renderAdCardContents = (ad: AdItem, extraClasses = "") => {
    const isVideo = isVideoFile(ad.mediaUrl);
    const hasLink = ad.linkUrl && ad.linkUrl.trim() !== "" && ad.linkUrl !== "#" && ad.linkUrl !== "/";
    return (
      <div className={`relative w-full h-full flex flex-col justify-end p-5 ${extraClasses}`}>
        {isVideo ? (
          <video 
            src={getUploadUrl(ad.mediaUrl)} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            autoPlay
            loop
            muted={ad.isMuted !== false}
            playsInline
          />
        ) : (
          <img 
            src={getUploadUrl(ad.mediaUrl)} 
            alt={ad.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/10 group-hover:via-zinc-950/60 transition-all duration-300" />
        
        <div className="relative z-10 flex flex-col text-left pr-16">
          <span className="bg-[#00f5d4] text-zinc-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider self-start mb-1.5 shadow-sm shadow-[#00f5d4]/20 animate-pulse">
            {ad.badgeText || 'Tài trợ'}
          </span>
          <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wider group-hover:text-[#00e5ff] transition-colors leading-tight">
            {ad.title}
          </h3>
          <p className="text-[10px] md:text-xs text-zinc-300 font-semibold line-clamp-2 mt-1">
            {ad.description}
          </p>
        </div>

        {/* Interactive CTA Pill (Only if there is a link) */}
        {hasLink && (
          <div className="absolute bottom-4 right-4 bg-white/10 group-hover:bg-white backdrop-blur-md text-white group-hover:text-zinc-950 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/15 group-hover:border-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1 shadow-md">
            Khám phá 
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full mb-6 md:h-[260px] lg:h-[300px] dark-keep">
      {/* 1. Main Banner Carousel */}
      {showMain && (
        <div className={`relative h-[180px] md:h-full rounded-2xl overflow-hidden group shadow-lg border border-white/5 ${
          showSub ? 'md:col-span-8' : 'md:col-span-12'
        }`}>
          {mainBanners.map((banner, index) => {
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

            const isVideo = isVideoFile(banner.mediaUrl);

            return (
              <a
                href={banner.linkUrl || "#"}
                onClick={(e) => handleAdClick(e, banner)}
                target={banner.linkUrl && banner.linkUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                key={banner.slotId}
                className={`absolute inset-0 ease-in-out block ${positionClass} ${transitionClass}`}
              >
                {isVideo ? (
                  <video 
                    src={getUploadUrl(banner.mediaUrl)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4000ms]"
                    autoPlay
                    loop
                    muted={banner.isMuted !== false}
                    playsInline
                  />
                ) : (
                  <img 
                    src={getUploadUrl(banner.mediaUrl)} 
                    alt={banner.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4000ms]"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 md:p-8">
                  <div className={`max-w-md transition-all duration-700 delay-300 ${
                    index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <span className="bg-amber-400 text-zinc-950 text-[9px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block tracking-widest animate-pulse">
                      {banner.badgeText || 'Nổi bật'}
                    </span>
                    <h2 className="text-xl md:text-3xl font-black text-white mb-1.5 italic drop-shadow-md leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-white/80 text-xs md:text-sm line-clamp-2 drop-shadow-sm font-medium">
                      {banner.description}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
          
          {/* Indicators */}
          {mainBanners.length > 1 && (
            <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
              {mainBanners.map((_, index) => (
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
          )}
        </div>
      )}

      {/* 2. Sub Banners Grid Section */}
      {showSub && (
        <div className={`flex gap-3 h-full ${
          showMain 
            ? 'md:col-span-4 flex-col sm:flex-row md:flex-col' 
            : 'md:col-span-12 grid grid-cols-1 md:grid-cols-2 w-full'
        }`}>
          {/* Sub Banner 1 */}
          {showSub1 && subAd1 && (
            <a 
              href={subAd1.linkUrl || "#"}
              onClick={(e) => handleAdClick(e, subAd1)}
              target={subAd1.linkUrl?.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`rounded-2xl overflow-hidden relative group border border-white/10 hover:border-[#00e5ff]/50 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] flex flex-col justify-end ${
                showMain 
                  ? 'flex-1 min-h-[110px] md:min-h-0' 
                  : 'h-[180px] md:h-full col-span-1'
              }`}
            >
              {renderAdCardContents(subAd1)}
            </a>
          )}

          {/* Sub Banner 2 */}
          {showSub2 && subAd2 && (
            <a 
              href={subAd2.linkUrl || "#"}
              onClick={(e) => handleAdClick(e, subAd2)}
              target={subAd2.linkUrl?.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`rounded-2xl overflow-hidden relative group border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-end ${
                showMain 
                  ? 'flex-1 min-h-[110px] md:min-h-0' 
                  : 'h-[180px] md:h-full col-span-1'
              }`}
            >
              {renderAdCardContents(subAd2)}
            </a>
          )}

          {/* If main banner is disabled and only ONE sub banner is active, let it stretch to full width */}
          {!showMain && ((showSub1 && !showSub2) || (!showSub1 && showSub2)) && (
            <a 
              href={(showSub1 ? subAd1?.linkUrl : subAd2?.linkUrl) || "#"}
              onClick={(e) => handleAdClick(e, showSub1 && subAd1 ? subAd1 : subAd2)}
              target={(showSub1 ? subAd1?.linkUrl : subAd2?.linkUrl)?.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="rounded-2xl overflow-hidden relative group border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-end h-[180px] md:h-full col-span-2"
            >
              {showSub1 && subAd1 ? renderAdCardContents(subAd1) : subAd2 && renderAdCardContents(subAd2)}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
