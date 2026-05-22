"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'system' | 'light' | 'dark';

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
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState(false);
  const [miniPlayerTime, setMiniPlayerTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false); // State login toàn cục
  
  // Khởi tạo theme
  const [theme, setThemeState] = useState<Theme>('dark');

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
      localStorage.setItem('mytube-theme', newTheme);
    }
  };

  // Khôi phục theme đã lưu ở Client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mytube-theme') as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  // Áp dụng lớp theme tương ứng vào thẻ HTML
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    const applyTheme = () => {
      let activeTheme: 'light' | 'dark' = 'dark';
      
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = systemDark ? 'dark' : 'light';
      } else {
        activeTheme = theme;
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

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <UIContext.Provider value={{ 
      isSidebarOpen, toggleSidebar, closeSidebar, openSidebar,
      isLoginDropdownOpen, setIsLoginDropdownOpen,
      activeVideo, isMiniPlayerActive, miniPlayerTime, isPlaying,
      setActiveVideo, setIsMiniPlayerActive, setMiniPlayerTime, setIsPlaying, closeMiniPlayer,
      theme, setTheme
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
