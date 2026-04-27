"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, X, CheckSquare, Square } from 'lucide-react';

interface HistoryVideo {
  video_id: number;
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    if (confirm('Xóa các mục đã chọn khỏi lịch sử?')) {
      setVideos(prev => prev.filter(v => !selectedIds.includes(v.video_id)));
      setSelectedIds([]);
      // API call would go here
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Lịch sử đã xem</h2>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <button 
              onClick={deleteSelected}
              className="flex items-center gap-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 px-4 py-2 rounded-full text-sm font-bold transition"
            >
              <Trash2 size={16} /> Xóa mục đã chọn ({selectedIds.length})
            </button>
          )}
          <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full text-sm font-bold transition">
            Xóa 1 tháng gần nhất
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-red-500 px-4 py-2 rounded-full text-sm font-bold transition">
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video.video_id} className="group flex items-start gap-4 p-2 hover:bg-white/5 rounded-2xl transition relative">
              <button 
                onClick={() => toggleSelect(video.video_id)}
                className="mt-12 text-white/20 hover:text-white transition flex-shrink-0"
              >
                {selectedIds.includes(video.video_id) ? <CheckSquare size={20} className="text-blue-500" /> : <Square size={20} />}
              </button>

              <Link href={`/watch/${video.video_id}`} className="flex flex-col md:flex-row gap-4 flex-1 min-w-0">
                <div className="relative w-full md:w-60 aspect-video rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={`/uploads/${video.thumbnail_url}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-red-500 transition">
                    {video.title}
                  </h3>
                  <p className="text-xs text-white/50 mb-2">
                    {video.channel_name} • {video.view_count.toLocaleString('vi-VN')} lượt xem
                  </p>
                  <p className="text-xs text-white/40 mb-3 italic">
                    Đã xem vào: {new Date(video.watched_at).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-white/60 line-clamp-2 md:line-clamp-3">
                    {video.description}
                  </p>
                </div>
              </Link>

              <button className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-black/60 hover:bg-black rounded-full text-white transition">
                <X size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-white/30">
            Bạn chưa xem video nào.
          </div>
        )}
      </div>
    </div>
  );
}
