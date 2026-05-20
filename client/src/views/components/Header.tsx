import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, User, LogOut, Key, UserCircle, Plus, Crown, CreditCard, Clapperboard, Star, Ticket, Sparkles, Calendar } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import CreateChannelModal from './modals/CreateChannelModal';
import UploadVideoModal from './modals/UploadVideoModal';
import { upgradePremiumAction } from '@/lib/actions';

const PremiumProgressBar = ({ purchasedAt, expiresAt }: { purchasedAt: any; expiresAt: any }) => {
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    if (!expiresAt) return;
    const start = purchasedAt ? new Date(purchasedAt).getTime() : Date.now() - 3 * 24 * 60 * 60 * 1000;
    const end = new Date(expiresAt).getTime();

    const updateProgress = () => {
      const now = Date.now();
      const total = end - start;
      const elapsed = now - start;

      if (total <= 0) {
        setPercent(0);
        return;
      }

      const calculated = 100 - (elapsed / total) * 100;
      setPercent(Math.max(0, Math.min(100, calculated)));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 15000); // update progress bar every 15s
    return () => clearInterval(interval);
  }, [purchasedAt, expiresAt]);

  return (
    <div className="w-full mt-2 text-left">
      <div className="flex justify-between text-[8px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">
        <span>Tiến trình gói</span>
        <span className="text-amber-400 font-mono">{percent.toFixed(2)}% còn lại</span>
      </div>
      <div className="w-full bg-zinc-950/80 h-1.5 rounded-full overflow-hidden border border-amber-400/20 p-[1px]">
        <div 
          className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 animate-pulse"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const PremiumCountdown = ({ expiresAt }: { expiresAt: string | Date | undefined }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const targetDate = new Date(expiresAt);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) {
    return <span className="text-amber-300 text-[10px] font-bold">Thời hạn: Vô thời hạn (VIP Trọn Đời)</span>;
  }

  if (!timeLeft) {
    return <span className="text-red-500 text-[10px] font-bold">Gói VIP đã hết hạn</span>;
  }

  return (
    <div className="flex flex-col gap-1 mt-2 bg-black/40 border border-amber-400/20 p-2 rounded-lg text-left select-none relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between text-[9px] text-amber-300 font-bold uppercase tracking-wider">
        <span>Đếm ngược hết hạn VIP</span>
        <span className="animate-pulse text-green-500 text-[10px]">● Đang chạy</span>
      </div>
      <div className="flex items-center gap-1 mt-1 font-mono font-bold text-xs text-white">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-amber-400/20 px-1 py-0.5 rounded text-amber-300 min-w-[20px] text-center">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-zinc-500 text-[9px] font-sans">ngày</span>
          </>
        )}
        <span className="bg-amber-400/20 px-1 py-0.5 rounded text-amber-300 min-w-[20px] text-center">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-zinc-500 text-[9px]">:</span>
        <span className="bg-amber-400/20 px-1 py-0.5 rounded text-amber-300 min-w-[20px] text-center">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-zinc-500 text-[9px]">:</span>
        <span className="bg-amber-400/20 px-1 py-0.5 rounded text-amber-300 min-w-[20px] text-center">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

const FlatCrown = ({ size = 24, className = "" }: { size?: number; className?: string }) => {
  return (
    <svg 
      viewBox="0 0 24 14" 
      width={size} 
      height={size * 0.58} 
      className={`text-amber-300 fill-amber-400 stroke-zinc-950 stroke-[1.2] ${className}`}
    >
      <path 
        d="M2 12 C 4 13, 20 13, 22 12 L 20.5 6.5 L 16.5 9 L 12 3 L 7.5 9 L 3.5 6.5 Z" 
        strokeLinejoin="round" 
        strokeLinecap="round" 
      />
      <circle cx="3.5" cy="6.5" r="0.8" className="fill-amber-100 text-amber-100" />
      <circle cx="7.5" cy="9" r="0.8" className="fill-amber-100 text-amber-100" />
      <circle cx="12" cy="3" r="1.2" className="fill-amber-100 text-amber-100" />
      <circle cx="16.5" cy="9" r="0.8" className="fill-amber-100 text-amber-100" />
      <circle cx="20.5" cy="6.5" r="0.8" className="fill-amber-100 text-amber-100" />
      <line x1="5" y1="11" x2="19" y2="11" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" strokeDasharray="1.2,1.2" />
    </svg>
  );
};

export default function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toggleSidebar, isLoginDropdownOpen, setIsLoginDropdownOpen } = useUI(); // Nhận biến từ UIContext
  const user = session?.user;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  
  // Khởi tạo Ref để kiểm soát click outside
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện click outside toàn trang
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
        setIsAuthOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setChannels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      const confirmLogin = window.confirm("Bạn cần đăng nhập để truy cập Studio / Tạo video của riêng mình. Click OK để đăng nhập ngay!");
      if (confirmLogin) {
        setIsLoginDropdownOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      router.push('/studio');
    }
  };

  const handleNotificationsClick = () => {
    if (!user) {
      const confirmLogin = window.confirm("Bạn cần đăng nhập để xem các thông báo của hệ thống. Click OK để đăng nhập ngay!");
      if (confirmLogin) {
        setIsLoginDropdownOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      router.push('/notifications');
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/support/unread-count?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Lỗi lấy thông báo:', err);
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    // Refresh mỗi 30 giây để cập nhật thông báo mới
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/results?search_query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10 z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-full transition text-white"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/assets/img/logoMyTube.png" 
            alt="MyTube Logo" 
            className="h-6 w-auto object-contain group-hover:scale-110 transition-transform"
          />
          <h1 className="text-white text-2xl font-bold tracking-tighter hidden sm:block select-none">
            My<span className="text-[#FF0000]">Tube</span>
            <sup className="text-[10px] text-zinc-400 ml-0.5 font-normal relative -top-2.5">VN</sup>
          </h1>
        </Link>
      </div>

      <div className="flex-1 max-w-[600px] mx-4 hidden md:block">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Tìm kiếm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-l-full py-2 px-5 text-white focus:outline-none focus:border-red-500 transition"
          />
          <button type="submit" className="bg-white/5 border border-l-0 border-white/10 px-6 py-2 rounded-r-full hover:bg-white/10 transition text-white">
            <Search size={20} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition text-white text-sm font-bold"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Tạo</span>
          </button>
        </div>

        <button 
          onClick={handleNotificationsClick}
          title="Thông báo"
          className="relative p-2 hover:bg-white/10 rounded-full transition text-white cursor-pointer"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          {user ? (
            <div className="relative flex items-center justify-center">
              {user.is_premium ? (
                // CONTAINER KHUNG HOÀNG GIA PREMIUM VIP 3D (ĐÃ TĂNG SIZE)
                <button 
                  onClick={() => setIsAuthOpen(!isAuthOpen)}
                  className="w-[62px] h-[62px] relative flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {/* Hiệu ứng Hào quang Vàng kim mờ ảo phát sáng nhịp thở */}
                  <div className="absolute w-[36px] h-[36px] rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-300/40 to-orange-500/30 blur-[5px] animate-pulse z-0 left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  {/* Ảnh Avatar nằm gọn gàng 100% trong khoảng trống của khung */}
                  <img 
                    src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                    alt="Avatar" 
                    className="w-[22px] h-[22px] rounded-full object-cover absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 z-10" 
                  />
                  {/* Ảnh Khung Hoàng Gia đè lên trên */}
                  <img 
                    src="/assets/img/crown.png" 
                    alt="Royal Frame" 
                    className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none drop-shadow-[0_2px_8px_rgba(245,158,11,0.55)]" 
                  />
                </button>
              ) : (
                // AVATAR THƯỜNG CHO USER THƯỜNG
                <button 
                  onClick={() => setIsAuthOpen(!isAuthOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden transition-all active:scale-95 flex items-center justify-center ring-2 ring-white/10 hover:ring-white/30 hover:shadow-lg"
                >
                  <img 
                    src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              title="Đăng nhập"
            >
              <User size={20} />
            </button>
          )}

          {/* DROPDOWN LOGIN CHO USER CHƯA ĐĂNG NHẬP */}
          {isLoginDropdownOpen && !user && (
            <div className="absolute top-13 right-0 w-80 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 animate-in fade-in slide-in-from-top-3 duration-300 z-[60] flex flex-col items-center overflow-hidden">
              {/* Dải sáng Neon Gradient đỉnh cao ở đầu card */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600" />
              
              <div className="flex items-center gap-2 mb-1.5 mt-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Đăng nhập</h3>
              </div>
              <p className="text-[10px] text-zinc-400 text-center mb-6 max-w-[200px] leading-relaxed">
                Đăng nhập tức thì thông qua mạng xã hội để trải nghiệm MyTube trọn vẹn
              </p>
              
              <div className="w-full space-y-3.5">
                {/* Google Button */}
                <button 
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    signIn('google');
                  }}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer text-xs shadow-md border border-white/20"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Tiếp tục với Google</span>
                </button>

                {/* Facebook Button */}
                <button 
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    signIn('facebook');
                  }}
                  className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer text-xs shadow-lg shadow-[#1877F2]/10"
                >
                  <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Tiếp tục với Facebook</span>
                </button>

                {/* GitHub Button */}
                <button 
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    signIn('github');
                  }}
                  className="w-full bg-[#24292f] hover:bg-[#2f363d] text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer text-xs border border-white/10 shadow-lg"
                >
                  <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>Tiếp tục với GitHub</span>
                </button>

                {/* Discord Button */}
                <button 
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    signIn('discord');
                  }}
                  className="w-full bg-[#5865F2] hover:bg-[#4e5dff] text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer text-xs shadow-lg shadow-[#5865F2]/10"
                >
                  <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,72.9,0c.82.71,1.68,1.4,2.58,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.31,123.65,27.55,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                  </svg>
                  <span>Tiếp tục với Discord</span>
                </button>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-white/5 flex items-center justify-center">
                <p className="text-[9px] text-zinc-500 text-center leading-relaxed max-w-[220px]">
                  Bằng việc tiếp tục, bạn đồng ý với <a href="/terms" className="text-zinc-400 hover:text-white underline transition">Điều khoản dịch vụ</a> và <a href="/privacy" className="text-zinc-400 hover:text-white underline transition">Chính sách bảo mật</a> của MyTube.
                </p>
              </div>
            </div>
          )}

          {isAuthOpen && user && (
            <div className="absolute top-12 right-0 w-72 bg-[#202020] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-350 z-[60]">
              <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col gap-3.5">
                <div className="flex items-center gap-4 pt-3">
                  {user.is_premium ? (
                    // CONTAINER KHUNG HOÀNG GIA PREMIUM VIP 3D CỠ LỚN (ĐÃ TĂNG SIZE)
                    <div className="w-24 h-24 relative flex items-center justify-center -ml-3">
                      {/* Hiệu ứng Hào quang Vàng kim cỡ lớn mờ ảo nhịp thở */}
                      <div className="absolute w-[56px] h-[56px] rounded-full bg-gradient-to-r from-amber-400/25 via-yellow-300/35 to-orange-500/25 blur-[8px] animate-pulse z-0 left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                      
                      {/* Ảnh Avatar nằm gọn gàng 100% trong khoảng trống của khung */}
                      <img 
                        src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                        alt="Avatar" 
                        className="w-[32px] h-[32px] rounded-full object-cover absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 z-10" 
                      />
                      {/* Ảnh Khung Hoàng Gia đè lên trên */}
                      <img 
                        src="/assets/img/crown.png" 
                        alt="Royal Frame" 
                        className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none drop-shadow-[0_4px_12px_rgba(245,158,11,0.65)] animate-pulse" 
                      />
                    </div>
                  ) : (
                    // AVATAR THƯỜNG TRONG DROPDOWN
                    <div className="relative">
                      <img 
                        src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                        className="w-11 h-11 rounded-full object-cover border border-white/10 shadow-md" 
                        alt="User" 
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate text-base flex items-center gap-1.5">
                      <span>{user.username || user.name}</span>
                      {user.is_premium && <Crown size={14} className="text-amber-400 fill-amber-400 animate-pulse flex-shrink-0" />}
                    </p>
                    <p className="text-white/40 text-xs truncate font-medium">{user.email || 'No email'}</p>
                  </div>
                </div>

                {/* THẺ HỘI VIÊN PREMIUM VIP HOÀNG GIA - GLASSMORPHISM GOLDEN */}
                {user.is_premium ? (
                  <Link 
                    href="/premium"
                    onClick={() => {
                      setIsAuthOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-orange-500/10 border border-amber-400/30 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group cursor-pointer hover:border-amber-400/50 hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        Hội viên VIP <Star size={8} className="fill-amber-400 text-amber-400" />
                      </span>
                      <span className="text-white font-black text-xs uppercase tracking-wider mt-0.5">MyTube Premium</span>
                      <span className="text-zinc-400 text-[9px] font-medium mt-1">Đã kích hoạt chặn 100% QC</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                      <Crown size={16} className="text-zinc-950 fill-zinc-950" />
                    </div>
                  </Link>
                ) : (
                  <Link 
                    href="/premium"
                    onClick={() => {
                      setIsAuthOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-zinc-950 font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] text-[11px] flex items-center justify-center gap-1.5 uppercase tracking-wider border border-yellow-400/20"
                  >
                    <Crown size={14} className="fill-zinc-950 animate-bounce" />
                    <span>Nâng cấp Premium</span>
                  </Link>
                )}
              </div>
              
              <div className="py-2">
                <ul className="space-y-0.5 px-2">
                  <li>
                    <Link 
                      href="/studio" 
                      onClick={() => setIsAuthOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white transition text-sm font-medium"
                    >
                      <Clapperboard size={18} className="text-white/60" /> 
                      <span>MyTube Studio</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/purchased" 
                      onClick={() => setIsAuthOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white transition text-sm font-medium"
                    >
                      <Ticket size={18} className="text-white/60" /> 
                      <span>Video đã mua</span>
                    </Link>
                  </li>
                </ul>

                <div className="h-px bg-white/10 my-2 mx-2" />

                <ul className="space-y-0.5 px-2 pb-2">
                  <li>
                    <button 
                      onClick={() => {
                        setIsAuthOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-lg text-red-500 transition text-sm font-semibold group"
                    >
                      <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" /> 
                      <span>Đăng xuất</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
