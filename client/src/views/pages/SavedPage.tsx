"use client";

import React, { useState } from 'react';
import { Bookmark, Play, ListVideo, ChevronLeft, MoreVertical, Share2, Trash2, Lock, Globe, FolderHeart } from 'lucide-react';
import { getPlaylistVideosAction, createPlaylistAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUploadUrl } from '@/lib/utils';

interface SavedPageProps {
  playlists: any[];
}

export default function SavedPage({ playlists }: SavedPageProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const router = useRouter();

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
          className="flex items-center gap-2 text-white/40 hover:text-white transition mb-10 group font-bold bg-white/5 px-6 py-2.5 rounded-full"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
          Quay lại danh sách
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Playlist Info Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="sticky top-24 bg-gradient-to-br from-red-600/10 via-white/5 to-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FolderHeart size={120} className="text-white" />
              </div>

              <div 
                className="aspect-video rounded-3xl bg-white/5 flex items-center justify-center mb-8 overflow-hidden relative shadow-2xl hover:scale-[1.02] cursor-pointer transition-transform duration-500 group/thumb"
                onClick={() => {
                  if (playlistVideos.length > 0) {
                    router.push(`/watch/${playlistVideos[0].video_id || playlistVideos[0]._id}`);
                  }
                }}
              >
                {selectedPlaylist.cover_thumbnail ? (
                  <img 
                    src={getUploadUrl(selectedPlaylist.cover_thumbnail)} 
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <Bookmark size={80} className="text-white/10" />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover/thumb:translate-y-0 transition-transform duration-500">
                        <Play size={24} fill="currentColor" />
                    </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-3 line-clamp-2">{selectedPlaylist.playlist_name}</h1>
              <div className="flex items-center gap-3 text-sm text-white/40 mb-10 font-bold uppercase tracking-widest">
                <span>{selectedPlaylist.video_count} video</span>
                <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                    {selectedPlaylist.is_private ? <Lock size={14} /> : <Globe size={14} />}
                    {selectedPlaylist.is_private ? 'Riêng tư' : 'Công khai'}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    if (playlistVideos.length > 0) {
                      router.push(`/watch/${playlistVideos[0].video_id || playlistVideos[0]._id}`);
                    }
                  }}
                  className="flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-black hover:bg-white/90 transition shadow-xl active:scale-95"
                >
                  <Play size={20} fill="currentColor" />
                  <span>Phát tất cả</span>
                </button>
                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-full font-bold transition">
                        <Share2 size={18} /> Chia sẻ
                    </button>
                    <button className="w-14 flex items-center justify-center bg-white/5 hover:bg-red-600/20 text-white/40 hover:text-red-500 py-3.5 rounded-full transition">
                        <Trash2 size={20} />
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* Videos List */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/20 font-bold animate-pulse">Đang tải video...</p>
              </div>
            ) : playlistVideos.length > 0 ? (
              <div className="grid gap-3">
                {playlistVideos.map((video, index) => (
                  <div 
                    key={video.video_id || video._id} 
                    onClick={() => router.push(`/watch/${video.video_id || video._id}`)}
                    className="group flex items-center gap-4 p-3 hover:bg-white/5 rounded-3xl transition relative border border-transparent hover:border-white/5 cursor-pointer"
                  >
                    <div className="text-white/20 text-base font-black w-8 text-center group-hover:hidden">
                      {index + 1}
                    </div>
                    <div className="hidden group-hover:flex w-8 justify-center">
                      <Play size={16} className="text-red-500" fill="currentColor" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                      <div className="relative w-full sm:w-56 aspect-video rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                        <img 
                          src={getUploadUrl(video.thumbnail_url)} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                          alt="" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-bold">
                          <span className="text-white/60">{video.channel?.channel_name || video.channel_name}</span>
                          <span>•</span>
                          <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition px-2">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete logic here later if needed
                        }}
                        className="p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-red-500 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ListVideo size={48} className="text-white/10" />
                </div>
                <p className="text-2xl font-black text-white/40">Danh sách này trống</p>
                <p className="text-sm text-white/20 mt-2">Bắt đầu thêm video bạn yêu thích vào đây!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600/20 rounded-[28px] relative">
                <Bookmark size={32} className="text-blue-500" fill="currentColor" />
                <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full"></div>
            </div>
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Thư viện của bạn</h1>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Danh sách phát đã lưu</p>
            </div>
        </div>
        <button 
            onClick={() => setIsCreating(true)}
            className="px-8 py-3.5 bg-white text-black rounded-full font-black hover:bg-white/90 transition shadow-2xl active:scale-95"
        >
            Tạo danh sách mới
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
          <div className="relative bg-[#1f1f1f] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white mb-4">Tạo danh sách phát mới</h3>
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nhập tên danh sách..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition">Hủy</button>
              <button 
                onClick={async () => {
                  if(!newPlaylistName.trim() || isCreating) return;
                  setIsCreating(true);
                  const res = await createPlaylistAction(newPlaylistName);
                  if (res.success) {
                      window.location.reload();
                  } else {
                      setIsCreating(false);
                      alert('Có lỗi xảy ra, vui lòng thử lại!');
                  }
                }}
                disabled={isCreating}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >{isCreating ? 'Đang tạo...' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}
      
      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
          {playlists.map((playlist) => (
            <div 
              key={playlist.playlist_id} 
              className="group cursor-pointer"
              onClick={() => handleSelectPlaylist(playlist)}
            >
              {/* Folder Effect - Premium Style */}
              <div className="relative aspect-video mb-5">
                {/* Back layers for stacked effect */}
                <div className="absolute inset-x-5 -top-3 h-full bg-white/5 rounded-[24px] border border-white/5 transition duration-500 group-hover:-top-5 group-hover:scale-[0.96]" />
                <div className="absolute inset-x-2.5 -top-1.5 h-full bg-white/10 rounded-[24px] border border-white/5 transition duration-500 group-hover:-top-2.5 group-hover:scale-[0.98]" />
                
                {/* Main cover */}
                <div className="relative h-full bg-[#111] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl group-hover:shadow-blue-600/10 transition-shadow duration-500">
                  {playlist.cover_thumbnail ? (
                    <img 
                      src={getUploadUrl(playlist.cover_thumbnail)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                      <Bookmark size={48} className="text-white/5" />
                    </div>
                  )}
                  
                  {/* Playlist Overlay - Premium Blurred Look */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-500" />
                  <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center border-l border-white/10 group-hover:w-[45%] transition-all duration-500">
                    <ListVideo size={24} className="text-white mb-2" />
                    <span className="text-white font-black text-xl">{playlist.video_count}</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Video</span>
                  </div>

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <Play size={20} className="text-white ml-1" fill="currentColor" />
                      </div>
                  </div>
                </div>
              </div>

              <div className="px-1">
                  <h3 className="text-lg font-black text-white line-clamp-1 group-hover:text-blue-500 transition duration-300 mb-1">
                    {playlist.playlist_name}
                  </h3>
                  <p className="flex items-center gap-2 text-xs text-white/30 font-bold uppercase tracking-tighter">
                    {playlist.is_private ? <Lock size={12} /> : <Globe size={12} />}
                    {playlist.is_private ? 'Riêng tư' : 'Công khai'}
                  </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-48 bg-white/5 rounded-[60px] border border-dashed border-white/5">
          <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Bookmark size={48} className="text-blue-600/30" />
          </div>
          <p className="text-2xl font-black text-white/40">Thư viện trống</p>
          <p className="text-sm text-white/20 mt-2 max-w-xs text-center">Hãy bắt đầu tạo những bộ sưu tập video yêu thích của riêng bạn.</p>
          <Link href="/" className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-full font-black hover:bg-blue-700 transition active:scale-95 shadow-2xl shadow-blue-600/20">
              Khám phá video
          </Link>
        </div>
      )}
    </div>
  );
}
