"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, X, CheckSquare, Square, History, Play, Search } from 'lucide-react';
import { getUploadUrl } from '@/lib/utils';

interface HistoryVideo {
  video_id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  view_count: number;
  watched_at: string;
  description: string;
}

interface HistoryPageProps {
  videos: HistoryVideo[];
}

export default function HistoryPage({ videos: initialVideos }: HistoryPageProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    if (confirm('Xóa các mục đã chọn khỏi lịch sử?')) {
      setVideos(prev => prev.filter(v => !selectedIds.includes(v.video_id)));
      setSelectedIds([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600/20 rounded-2xl">
                <History size={28} className="text-red-500" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white">Lịch sử xem</h1>
                <p className="text-sm text-white/40">{videos.length} video đã xem</p>
            </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={deleteSelected}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-lg shadow-red-600/20 active:scale-95"
            >
              <Trash2 size={16} /> Xóa đã chọn ({selectedIds.length})
            </button>
          )}
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-500 transition" />
            <input 
                type="text" 
                placeholder="Tìm trong lịch sử..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-red-500/50 transition w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video.video_id} className="group flex items-center gap-4 p-3 hover:bg-white/5 rounded-3xl transition relative border border-transparent hover:border-white/5">
              <button 
                onClick={() => toggleSelect(video.video_id)}
                className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${selectedIds.includes(video.video_id) ? 'bg-red-600 border-red-600' : 'border-white/10 group-hover:border-white/30'}`}
              >
                {selectedIds.includes(video.video_id) && <CheckSquare size={14} className="text-white" />}
              </button>

              <Link href={`/watch/${video.video_id}`} className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                <div className="relative w-full sm:w-64 aspect-video rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
                  <img 
                    src={getUploadUrl(video.thumbnail_url)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Play size={20} className="text-white ml-1" fill="currentColor" />
                     </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-red-500 transition duration-300">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/40 mb-3 font-medium">
                    <span className="text-white/60 font-bold hover:text-white transition cursor-pointer">{video.channel_name}</span>
                    <span>•</span>
                    <span>{video.view_count.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                  <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                    {video.description || 'Không có mô tả cho video này.'}
                  </p>
                </div>
              </Link>

              <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition absolute top-4 right-4">
                <X size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <History size={40} className="text-white/20" />
            </div>
            <p className="text-xl font-bold text-white/40">Lịch sử trống</p>
            <p className="text-sm text-white/20 mt-1">Video bạn xem sẽ xuất hiện ở đây.</p>
            <Link href="/" className="inline-block mt-6 px-8 py-3 bg-red-600 text-white rounded-full font-black hover:bg-red-700 transition active:scale-95 shadow-xl shadow-red-600/20">
                Khám phá ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
