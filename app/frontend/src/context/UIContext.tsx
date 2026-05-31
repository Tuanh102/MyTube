"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'system' | 'light' | 'dark' | 'schedule';

interface UIContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  // Login Dropdown State
  isLoginDropdownOpen: boolean;
  setIsLoginDropdownOpen: (open: boolean) => void;
  // Mini Player State
  activeVideo: any | null;
  isMiniPlayerActive: boolean;
  miniPlayerTime: number;
  isPlaying: boolean;
  setActiveVideo: (video: any) => void;
  setIsMiniPlayerActive: (active: boolean) => void;
  setMiniPlayerTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  closeMiniPlayer: () => void;
  // Theme State
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Global Pre-roll Ad State
  isAdActive: boolean;
  setIsAdActive: (active: boolean) => void;
  adCountdownGlobal: number;
  setAdCountdownGlobal: (seconds: number) => void;
  adTotalCountdownGlobal: number;
  setAdTotalCountdownGlobal: (seconds: number) => void;
  isAdPausedGlobal: boolean;
  setIsAdPausedGlobal: (paused: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState(false);
  const [miniPlayerTime, setMiniPlayerTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false); // State login toàn cục
  
  // Global Pre-roll Ad States
  const [isAdActive, setIsAdActive] = useState(false);
  const [adCountdownGlobal, setAdCountdownGlobal] = useState(5);
  const [adTotalCountdownGlobal, setAdTotalCountdownGlobal] = useState(30);
  const [isAdPausedGlobal, setIsAdPausedGlobal] = useState(false);

  // Global ticking for pre-roll ad
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAdActive && !isAdPausedGlobal) {
      interval = setInterval(() => {
        setAdCountdownGlobal(prev => (prev > 0 ? prev - 1 : 0));
        setAdTotalCountdownGlobal(prev => {
          if (prev <= 1) {
            setIsAdActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAdActive, isAdPausedGlobal]);

  const pathname = usePathname();

  // Xác định kho lưu trữ theme dựa vào đường dẫn hiện tại
  const getThemeKey = (path: string | null) => {
    if (!path) return 'mytube-theme';
    if (path.startsWith('/admin')) return 'mytube-admin-theme';
    if (path.startsWith('/staff')) return 'mytube-staff-theme';
    return 'mytube-theme';
  };

  const themeKey = getThemeKey(pathname);

  // Khởi tạo theme
  const [theme, setThemeState] = useState<Theme>('system');

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  const closeMiniPlayer = () => {
    setIsMiniPlayerActive(false);
    setActiveVideo(null);
    setMiniPlayerTime(0);
    setIsPlaying(false);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(themeKey, newTheme);
    }
  };

  // Khôi phục & đồng bộ theme khi key thay đổi theo đường dẫn
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(themeKey) as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      } else {
        setThemeState('system');
      }
    }
  }, [themeKey]);

  // Áp dụng lớp theme tương ứng vào thẻ HTML
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    const applyTheme = () => {
      let activeTheme: 'light' | 'dark' = 'dark';
      
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = systemDark ? 'dark' : 'light';
      } else if (theme === 'schedule') {
        const hour = new Date().getHours();
        activeTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
      } else {
        activeTheme = theme as 'light' | 'dark';
      }
      
      if (activeTheme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    };

    applyTheme();

    let intervalId: any;
    if (theme === 'schedule') {
      intervalId = setInterval(() => {
        applyTheme();
      }, 60000);
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [theme]);

  return (
    <UIContext.Provider value={{ 
      isSidebarOpen, toggleSidebar, closeSidebar, openSidebar,
      isLoginDropdownOpen, setIsLoginDropdownOpen,
      activeVideo, isMiniPlayerActive, miniPlayerTime, isPlaying,
      setActiveVideo, setIsMiniPlayerActive, setMiniPlayerTime, setIsPlaying, closeMiniPlayer,
      theme, setTheme,
      isAdActive, setIsAdActive,
      adCountdownGlobal, setAdCountdownGlobal,
      adTotalCountdownGlobal, setAdTotalCountdownGlobal,
      isAdPausedGlobal, setIsAdPausedGlobal
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
