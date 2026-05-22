"use client";

import React from 'react';
import Link from 'next/link';
import { UserMinus, Check, Bell, Settings2 } from 'lucide-react';

interface Channel {
  channel_id: number;
  channel_name: string;
  avatar: string;
  sub_count?: number;
}

interface SubscriptionsPageProps {
  channels: Channel[];
}


export default function SubscriptionsPage({ channels }: SubscriptionsPageProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Tất cả kênh đã đăng ký</h2>
        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-blue-500 hover:text-blue-400 transition flex items-center gap-2">
             <Settings2 size={16} />
             Quản lý
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <div key={channel.channel_id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition group border border-transparent hover:border-white/5">
              <Link href={`/channel/${channel.channel_id}`} className="flex items-center gap-6 flex-1">
                <div className="relative">
                  <img 
                    src={channel.avatar || '/assets/img/avata.jpg'} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:border-red-500/50 transition-colors duration-500 shadow-xl" 
                    alt={channel.channel_name} 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/10">
                    <Check size={12} className="text-blue-500" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white group-hover:text-red-500 transition-colors">{channel.channel_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/40 mt-1 font-medium">
                    <span>@{channel.channel_name.toLowerCase().replace(/\s/g, '')}</span>
                    <span>•</span>
                    <span>{channel.sub_count?.toLocaleString('vi-VN')} người đăng ký</span>
                  </div>
                  <p className="text-sm text-white/30 mt-2 line-clamp-1 max-w-lg font-medium">
                    Kênh chia sẻ nội dung video chất lượng cao từ {channel.channel_name}. Đăng ký để không bỏ lỡ!
                  </p>
                </div>
              </Link>
              
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition">
                  <Bell size={20} />
                </button>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-bold text-sm transition">
                   Đã đăng ký
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-white/20">
            <UserMinus size={80} className="mb-4 opacity-10" />
            <p className="text-xl font-bold">Chưa có đăng ký nào</p>
            <p className="text-sm">Hãy tìm những kênh yêu thích để theo dõi!</p>
          </div>
        )}
      </div>
    </div>
  );
}

