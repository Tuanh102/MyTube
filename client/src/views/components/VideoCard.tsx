"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, Flag, X, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDuration, getUploadUrl } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useUI } from '@/context/UIContext';
import { submitVideoReportAction } from '@/lib/actions';


interface VideoCardProps {
  video: {
    video_id: number | string;
    title: string;
    thumbnail_url: string;
    video_url?: string;
    channel_name?: string;
    channel_avatar?: string;
    channel_id?: string | number;
    view_count: number;
    duration?: number;
    created_at?: string;
    is_free?: boolean;
    channel_user_id?: string | number;
    user_id?: string | number;
    isLive?: boolean;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: session } = useSession();
  const { setIsLoginDropdownOpen } = useUI();

  // States and refs for 3-dot dropdown and reporting video
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam hoặc gây hiểu lầm');
  const [customReportReason, setCustomReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const ensureUserLoggedIn = (actionName: string) => {
    if (!session || !session.user) {
      setIsLoginDropdownOpen(true);
      return false;
    }
    return true;
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureUserLoggedIn('Báo cáo video')) return;

    setIsSubmittingReport(true);
    const finalReason = reportReason === 'Lý do khác' && customReportReason.trim()
      ? `Lý do khác: ${customReportReason.trim()}`
      : reportReason;

    try {
      const res = await submitVideoReportAction((video.video_id).toString(), session.user.id.toString(), finalReason);
      if (res && (res.success || res._id)) {
        setToast({ message: 'Đã gửi báo cáo thành công! Chúng tôi sẽ kiểm duyệt sớm.', type: 'success' });
        setIsReportModalOpen(false);
        setCustomReportReason('');
      } else {
        setToast({ message: res?.error || 'Gửi báo cáo thất bại.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Có lỗi xảy ra khi gửi báo cáo.', type: 'error' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  useEffect(() => {
    if (isHovered) {
      // Delay video show slightly to avoid flickering on fast swipes
      timerRef.current = setTimeout(() => {
        setShowVideo(true);
      }, 500);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowVideo(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 10) {
      videoRef.current.currentTime = 0;
    }
  };

  // Đánh chặn click video trả phí hoặc live stream đối với Guest chưa đăng nhập
  const handleCardClick = (e: React.MouseEvent) => {
    if (!session?.user) {
      if (video.isLive) {
        e.preventDefault(); // Chặn chuyển hướng của Link
        const confirmLogin = window.confirm("Đây là phiên phát sóng trực tiếp (Live Stream). Bạn cần đăng nhập tài khoản để vào xem và tương tác trực tiếp. Click OK để đăng nhập ngay!");
        if (confirmLogin) {
          setIsLoginDropdownOpen(true); // Mở popover đăng nhập ở Header
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt mà lên đầu trang
        }
      } else if (video.is_free === false) {
        e.preventDefault(); // Chặn chuyển hướng của Link
        const confirmLogin = window.confirm("Đây là video trả phí cao cấp. Bạn cần đăng nhập tài khoản để tiến hành mua bản quyền và thưởng thức video này. Click OK để đăng nhập ngay!");
        if (confirmLogin) {
          setIsLoginDropdownOpen(true); // Mở popover đăng nhập ở Header
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt mà lên đầu trang
        }
      }
    }
  };

  // 1. Kiểm tra đã mua
  const purchasedVideos = (session?.user as any)?.purchased_videos || [];
  const isPurchased = purchasedVideos.some((id: any) => id.toString() === video.video_id?.toString());

  // 2. Kiểm tra chủ kênh đăng video
  const isOwner = !!session?.user?.id && (
    video.channel_user_id?.toString() === session.user.id.toString() ||
    video.user_id?.toString() === session.user.id.toString() ||
    (video as any).channel?.user?.toString() === session.user.id.toString() ||
    (video as any).channel?.user_id?.toString() === session.user.id.toString()
  );

  const hasPermission = isPurchased || isOwner;

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#121212]">
        <Link href={video.isLive ? `/live/${video.video_id}` : `/watch/${video.video_id}`} onClick={handleCardClick}>
          <img 
            src={video.isLive ? video.thumbnail_url : getUploadUrl(video.thumbnail_url)} 
            alt={video.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = video.isLive 
                ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop';
            }}
          />
          
          {showVideo && video.video_url && !video.isLive && (video.is_free !== false || hasPermission) && (
            <video
              ref={videoRef}
              src={getUploadUrl(video.video_url)}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          {video.isLive ? (
            <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-md shadow-red-600/30">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
            </span>
          ) : (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold z-10" style={{ color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
              {formatDuration(video.duration || 0)}
            </div>
          )}

          {video.is_free === false && !video.isLive && !hasPermission && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black z-10 shadow-lg flex items-center gap-1 animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              TRẢ PHÍ
            </div>
          )}
        </Link>
      </div>

      <div className="flex gap-3 relative">
        <div className="flex-shrink-0">
          {video.isLive ? (
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 border border-red-500/30">
              <img 
                src={video.channel_avatar || '/assets/img/avata.jpg'} 
                className="w-full h-full object-cover"
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                }}
              />
            </div>
          ) : (
            <Link href={`/channel/${video.channel_id || '#'}`}>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 ring-1 ring-transparent hover:ring-red-500 transition-all">
                <img 
                  src={getUploadUrl(video.channel_avatar, '/assets/img/avata.jpg')} 
                  className="w-full h-full object-cover"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                  }}
                />
              </div>
            </Link>
          )}
        </div>

        <div className="flex-1 pr-4 min-w-0">
          <Link href={video.isLive ? `/live/${video.video_id}` : `/watch/${video.video_id}`} onClick={handleCardClick}>
            <h3 className="text-sm font-semibold line-clamp-2 text-white mb-1 group-hover:text-red-500 transition-colors">
              {video.title}
            </h3>
          </Link>
          
          {video.isLive ? (
            <p className="text-xs text-white/60 truncate">
              {video.channel_name || 'Người phát sóng'}
            </p>
          ) : (
            <Link href={`/channel/${video.channel_id || '#'}`}>
              <p className="text-xs text-white/60 hover:text-white transition-colors truncate">
                {video.channel_name || 'Kênh hệ thống'}
              </p>
            </Link>
          )}
          
          <p className="text-xs text-white/60 mt-1">
            {video.isLive ? (
              <span className="flex items-center gap-1.5 text-red-500 font-bold animate-pulse text-[10px]">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {video.view_count.toLocaleString('vi-VN')} đang xem
              </span>
            ) : (
              `${video.view_count.toLocaleString('vi-VN')} lượt xem • ${video.created_at ? new Date(video.created_at).toLocaleDateString('vi-VN') : '2 ngày trước'}`
            )}
          </p>
        </div>

        {!video.isLive && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="text-white/40 hover:text-white self-start pt-1 active:scale-95 transition"
            >
              <MoreVertical size={18} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1.5 w-40 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl py-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {isOwner ? (
                  <Link
                    href={`/studio?tab=videos&search=${encodeURIComponent(video.title)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs text-red-500 hover:bg-white/5 hover:text-red-400 flex items-center gap-2 transition font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Xóa video</span>
                  </Link>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      if (ensureUserLoggedIn('Báo cáo video')) {
                        setIsReportModalOpen(true);
                      }
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-2 transition font-medium"
                  >
                    <Flag size={14} />
                    <span>Báo cáo video</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Premium Glassmorphic Report Modal */}
      {isReportModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div 
            className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsReportModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Báo cáo vi phạm</h3>
                <p className="text-xs text-white/50">Chúng tôi sẽ xem xét báo cáo này trong vòng 24 giờ.</p>
              </div>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReportSubmit(e);
              }} 
              className="space-y-4"
            >
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 block text-left">Chọn lý do báo cáo:</label>
                {[
                  'Spam hoặc gây hiểu lầm',
                  'Nội dung khiêu dâm',
                  'Nội dung bạo lực hoặc phản cảm',
                  'Quấy rối hoặc bắt nạt',
                  'Vi phạm bản quyền',
                  'Lý do khác'
                ].map((reason) => (
                  <label 
                    key={reason}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      reportReason === reason 
                        ? 'bg-red-500/10 border-red-500/30 text-white' 
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span className="text-sm font-medium">{reason}</span>
                    <input 
                      type="radio" 
                      name="reportReason" 
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => {
                        e.stopPropagation();
                        setReportReason(reason);
                      }}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {reportReason === 'Lý do khác' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200 text-left">
                  <label className="text-xs font-semibold text-white/60 block">Mô tả lý do chi tiết:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Mô tả lý do bạn báo cáo video này..."
                    value={customReportReason}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCustomReportReason(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-red-500/40 transition resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsReportModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {isSubmittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Micro Toast Alert */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-3xl bg-zinc-950/90 border border-white/10 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className={`p-2 rounded-2xl ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <AlertTriangle size={18} />
          </div>
          <span className="text-sm font-semibold text-white/90">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
