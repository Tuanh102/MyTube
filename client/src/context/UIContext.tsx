"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState(false);
  const [miniPlayerTime, setMiniPlayerTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false); // State login toàn cục

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  const closeMiniPlayer = () => {
    setIsMiniPlayerActive(false);
    setActiveVideo(null);
    setMiniPlayerTime(0);
    setIsPlaying(false);
  };

  return (
    <UIContext.Provider value={{ 
      isSidebarOpen, toggleSidebar, closeSidebar, openSidebar,
      isLoginDropdownOpen, setIsLoginDropdownOpen,
      activeVideo, isMiniPlayerActive, miniPlayerTime, isPlaying,
      setActiveVideo, setIsMiniPlayerActive, setMiniPlayerTime, setIsPlaying, closeMiniPlayer
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
