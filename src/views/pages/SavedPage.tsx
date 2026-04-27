"use client";

import React, { useState } from 'react';
import VideoCard from '@/views/components/VideoCard';
import { Bookmark, Play, ListVideo, ChevronLeft, MoreVertical, Share2, Trash2 } from 'lucide-react';
import { getPlaylistVideosAction } from '@/lib/actions';
import Link from 'next/link';

interface SavedPageProps {
  playlists: any[];
}

export default function SavedPage({ playlists }: SavedPageProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlaylist = async (playlist: any) => {
    setIsLoading(true);
    setSelectedPlaylist(playlist);
    const videos = await getPlaylistVideosAction(playlist.playlist_id);
    setPlaylistVideos(videos);
    setIsLoading(false);
  };

  if (selectedPlaylist) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <button 
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition mb-6 group font-bold"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
          Quay lại danh sách
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Playlist Info Sidebar */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="sticky top-20 bg-gradient-to-b from-blue-600/20 to-black/40 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
              <div className="aspect-video rounded-2xl bg-white/5 flex items-center justify-center mb-6 overflow-hidden relative shadow-2xl">
                {selectedPlaylist.cover_thumbnail ? (
                  <img 
                    src={selectedPlaylist.cover_thumbnail.startsWith('http') ? selectedPlaylist.cover_thumbnail : `/uploads/${selectedPlaylist.cover_thumbnail}`} 
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <Bookmark size={64} className="text-white/20" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
              </div>
              
              <h1 className="text-3xl font-black text-white mb-2">{selectedPlaylist.playlist_name}</h1>
              <div className="flex items-center gap-2 text-sm text-white/60 mb-6 font-medium">
                <span>{selectedPlaylist.video_count} video</span>
                <span>•</span>
                <span>{selectedPlaylist.is_private ? 'Riêng tư' : 'Công khai'}</span>
              </div>

              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-full font-bold hover:bg-white/90 transition shadow-lg active:scale-95">
                  <Play size={18} fill="currentColor" />
                  <span>Phát tất cả</span>
                </button>
              </div>
            </div>
          </div>

          {/* Videos List */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : playlistVideos.length > 0 ? (
              <div className="flex flex-col gap-2">
                {playlistVideos.map((video, index) => (
                  <div key={video.video_id} className="group flex items-center gap-4 p-2 hover:bg-white/5 rounded-2xl transition relative">
                    <div className="text-white/20 text-sm font-bold w-6 text-center group-hover:hidden">
                      {index + 1}
                    </div>
                    <div className="hidden group-hover:flex w-6 justify-center">
                      <Play size={14} className="text-white" fill="currentColor" />
                    </div>

                    <Link href={`/watch/${video.video_id}`} className="flex flex-col md:flex-row gap-4 flex-1 min-w-0">
                      <div className="relative w-full md:w-52 aspect-video rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                        <img 
                          src={video.thumbnail_url?.startsWith('http') ? video.thumbnail_url : (video.thumbnail_url ? `/uploads/${video.thumbnail_url}` : '/assets/img/default-thumb.jpg')} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                          alt="" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-blue-500 transition">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                          <span>{video.channel_name}</span>
                          <span>•</span>
                          <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition px-2">
                      <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-white/20">
                <ListVideo size={80} className="mb-4 opacity-10" />
                <p className="text-xl font-bold">Danh sách này trống</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-600/20 rounded-2xl">
          <Bookmark size={24} className="text-blue-500" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-black text-white">Danh sách phát đã lưu</h1>
      </div>
      
      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {playlists.map((playlist) => (
            <div 
              key={playlist.playlist_id} 
              className="group cursor-pointer"
              onClick={() => handleSelectPlaylist(playlist)}
            >
              {/* Folder Effect */}
              <div className="relative aspect-video mb-3">
                {/* Back layers */}
                <div className="absolute inset-x-4 -top-2 h-full bg-white/5 rounded-xl border border-white/5 transition group-hover:-top-3" />
                <div className="absolute inset-x-2 -top-1 h-full bg-white/10 rounded-xl border border-white/5 transition group-hover:-top-1.5" />
                
                {/* Main cover */}
                <div className="relative h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                  {playlist.cover_thumbnail ? (
                    <img 
                      src={playlist.cover_thumbnail.startsWith('http') ? playlist.cover_thumbnail : `/uploads/${playlist.cover_thumbnail}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <Bookmark size={40} className="text-white/10" />
                    </div>
                  )}
                  
                  {/* Playlist Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center border-l border-white/10">
                    <ListVideo size={20} className="text-white mb-1" />
                    <span className="text-white font-bold text-sm">{playlist.video_count}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-500 transition">
                {playlist.playlist_name}
              </h3>
              <p className="text-xs text-white/40 mt-1 font-medium">
                {playlist.is_private ? 'Danh sách riêng tư' : 'Danh sách công khai'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-white/20">
          <ListVideo size={80} className="mb-4 opacity-10" />
          <p className="text-xl font-bold">Chưa có danh sách phát nào</p>
          <p className="text-sm">Hãy tạo danh sách phát mới để lưu video!</p>
        </div>
      )}
    </div>
  );
}

