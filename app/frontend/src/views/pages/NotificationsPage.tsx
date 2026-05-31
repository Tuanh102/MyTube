"use client";

import React from 'react';
import Link from 'next/link';
import { markNotificationsRead, markSingleNotificationRead, deleteNotificationAction, clearAllNotificationsAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { getUploadUrl } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Bell, Heart, MessageSquare, UserPlus, PlayCircle, CheckCircle2, X, Trash2 } from 'lucide-react';

interface Notification {
  notification_id: string;
  type: string;
  actor_name: string;
  actor_avatar: string;
  video_title?: string;
  video_thumb?: string;
  message: string;
  is_read: number;
  created_at: string;
  target_id: string;
  actor_id: string;
}

interface NotificationsPageProps {
  notifications: Notification[];
  filter: string;
}

export default function NotificationsPage({ notifications: initialNotifications, filter }: NotificationsPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [localNotifications, setLocalNotifications] = React.useState(initialNotifications);
  const [justDeleted, setJustDeleted] = React.useState<string[]>([]);

  // Sync state if props change, but KEEP filtering out things we just deleted
  React.useEffect(() => {
    setLocalNotifications(initialNotifications.filter(n => !justDeleted.includes(n.notification_id)));
  }, [initialNotifications, justDeleted]);

  const handleMarkAllRead = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    setLocalNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    await markNotificationsRead(userId);
    router.refresh();
  };

  const handleClearAll = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    if (confirm('Bạn có chắc muốn xóa tất cả thông báo không?')) {
      setLocalNotifications([]);
      await clearAllNotificationsAction(userId);
      router.refresh();
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic delete: Add to justDeleted list
    setJustDeleted(prev => [...prev, id]);
    setLocalNotifications(prev => prev.filter(n => n.notification_id !== id));
    
    try {
      const res = await deleteNotificationAction(id);
      if (!res.success) {
        router.refresh();
      }
    } catch (err) {
      console.error('Lỗi khi xóa thông báo:', err);
      router.refresh();
    }
  };

  const handleNotificationClick = (e: React.MouseEvent, n: Notification) => {
    // If it's a delete button click, it should have been caught by handleDeleteNotification
    if ((e.target as HTMLElement).closest('button[title="Xóa thông báo"]')) {
      return;
    }

    e.preventDefault();
    const url = getTargetUrl(n);

    // Mark as read in background
    if (!n.is_read) {
      markSingleNotificationRead(n.notification_id).catch(console.error);
    }
    
    // Navigate immediately
    if (url !== '#') {
      router.push(url);
    }
  };

  const getTargetUrl = (n: Notification) => {
    if (n.type === 'system') {
      if (n.target_id === 'wallet') return '/studio?tab=revenue';
      if (n.target_id === 'admin_dashboard') return '/admin';
      return '#';
    }
    if (!n.target_id && n.type !== 'subscription') return '#';
    
    if (['new_video', 'like', 'comment', 'reply'].includes(n.type)) {
      return `/watch/${n.target_id}`;
    } else if (n.type === 'subscription') {
      return `/channel/${n.actor_id}`;
    }
    return '#';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500" fill="currentColor" />;
      case 'comment':
      case 'reply': return <MessageSquare size={16} className="text-blue-500" />;
      case 'subscription': return <UserPlus size={16} className="text-green-500" />;
      case 'system': return <CheckCircle2 size={16} className="text-yellow-500" />;
      default: return <PlayCircle size={16} className="text-red-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell size={24} /> Thông báo
        </h1>
        <div className="flex items-center gap-4">
          {localNotifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-sm font-bold text-red-500 hover:text-red-400 transition flex items-center gap-1"
            >
              <Trash2 size={16} /> Xóa tất cả
            </button>
          )}
          {localNotifications.some(n => n.is_read === 0) && (
            <button 
              onClick={handleMarkAllRead}
              className="text-sm font-bold text-blue-500 hover:text-blue-400 transition"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Link 
          href="/notifications?filter=all"
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${filter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          Tất cả
        </Link>
        <Link 
          href="/notifications?filter=unread"
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${filter === 'unread' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          Chưa đọc
        </Link>
      </div>

      <div className="space-y-1">
        {localNotifications.length > 0 ? (
          localNotifications.map((n) => (
            <Link 
              key={n.notification_id}

              href={getTargetUrl(n)}
              onClick={(e) => handleNotificationClick(e, n)}
              className={`flex items-center gap-4 p-4 rounded-xl transition group relative ${n.is_read ? 'hover:bg-white/5' : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'}`}
            >
              {!n.is_read && <div className="absolute left-2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />}
              
              <img 
                src={n.type === 'system' ? '/assets/img/logoMyTube.png' : getUploadUrl(n.actor_avatar, '/assets/img/avata.jpg')} 
                className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
                alt="" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = n.type === 'system' ? '/assets/img/logoMyTube.png' : '/assets/img/avata.jpg';
                }}
              />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 leading-snug">
                  {n.type === 'system' ? (
                    <span className="font-semibold text-red-400">{n.message}</span>
                  ) : (
                    <>
                      <span className="font-bold">{n.actor_name}</span>
                      {n.type === 'new_video' && <> vừa tải lên một video mới: <span className="font-bold">{n.video_title}</span></>}
                      {n.type === 'like' && <> đã thích video của bạn: <span className="font-bold">{n.video_title}</span></>}
                      {n.type === 'comment' && <> đã bình luận về video của bạn.</>}
                      {n.type === 'reply' && <> đã trả lời bình luận của bạn trong video <span className="font-bold">{n.video_title}</span></>}
                      {n.type === 'subscription' && <> đã đăng ký theo dõi kênh của bạn.</>}
                    </>
                  )}
                </p>
                <p className="text-xs text-white/40 mt-1">{new Date(n.created_at).toLocaleString('vi-VN')}</p>
              </div>

              {n.video_thumb && (
                <div className="w-16 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                  <img src={getUploadUrl(n.video_thumb)} className="w-full h-full object-cover" alt="" />
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white/5 rounded-full opacity-60">
                  {getIcon(n.type)}
                </div>
              </div>

              {/* Absolute Delete Button */}
              <button 
                onClick={(e) => handleDeleteNotification(e, n.notification_id)}
                className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-red-600 rounded-lg text-white/20 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 border border-white/5 shadow-xl"
                title="Xóa thông báo"
              >
                <X size={14} />
              </button>
            </Link>

          ))
        ) : (
          <div className="text-center py-20 text-white/20 flex flex-col items-center gap-4">
             <Bell size={48} className="opacity-20" />
             <p>Bạn không có thông báo nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
