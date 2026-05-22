"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Crown, Check, Loader2, Star, Shield, Zap, Sparkles, Flame, Calendar, CreditCard, Clock, Activity, ArrowLeft, Receipt, Settings } from 'lucide-react';

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
    const interval = setInterval(updateProgress, 15000);
    return () => clearInterval(interval);
  }, [purchasedAt, expiresAt]);

  return (
    <div className="w-full text-left bg-zinc-950/40 p-4 rounded-2xl border border-white/5">
      <div className="flex justify-between text-xs text-zinc-400 font-bold mb-2 uppercase tracking-wider">
        <span>Tiến trình sử dụng gói</span>
        <span className="text-amber-400 font-mono">{percent.toFixed(2)}% còn lại</span>
      </div>
      <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-amber-400/20 p-[2px]">
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
    return (
      <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-2xl text-center">
        <span className="text-amber-300 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2">
          ★ Thời hạn: Vô thời hạn (VIP Trọn Đời) ★
        </span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
        <span className="text-red-500 text-sm font-black uppercase tracking-wider">
          Gói VIP đã hết hạn
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-black/60 border border-amber-400/25 p-4 rounded-2xl text-center select-none relative overflow-hidden backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.05)]">
      <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider border-b border-amber-400/10 pb-2 mb-1">
        <span className="flex items-center gap-1.5"><Clock size={14} /> Đồng hồ đếm ngược hết hạn VIP</span>
        <span className="animate-pulse text-green-500 text-[11px] font-sans flex items-center gap-1">● Live ticking</span>
      </div>
      <div className="flex items-center justify-center gap-3 mt-1 font-mono font-black text-2xl text-white">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="bg-amber-400/20 px-3 py-1.5 rounded-lg text-amber-300 min-w-[40px] text-center border border-amber-400/10">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-zinc-500 text-[10px] font-sans font-bold uppercase mt-1">ngày</span>
          </div>
        )}
        {timeLeft.days > 0 && <span className="text-zinc-500 -mt-5">:</span>}
        <div className="flex flex-col items-center">
          <span className="bg-amber-400/20 px-3 py-1.5 rounded-lg text-amber-300 min-w-[40px] text-center border border-amber-400/10">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-zinc-500 text-[10px] font-sans font-bold uppercase mt-1">giờ</span>
        </div>
        <span className="text-zinc-500 -mt-5">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-amber-400/20 px-3 py-1.5 rounded-lg text-amber-300 min-w-[40px] text-center border border-amber-400/10">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-zinc-500 text-[10px] font-sans font-bold uppercase mt-1">phút</span>
        </div>
        <span className="text-zinc-500 -mt-5">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-amber-400/20 px-3 py-1.5 rounded-lg text-amber-300 min-w-[40px] text-center border border-amber-400/10">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-zinc-500 text-[10px] font-sans font-bold uppercase mt-1">giây</span>
        </div>
      </div>
    </div>
  );
};

export default function PremiumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = session?.user as any;

  // State hữu ích cho phần Customizer tương tác ở cột phải
  const [showVipGlow, setShowVipGlow] = useState(true);
  const [enableCrownRing, setEnableCrownRing] = useState(true);
  const [cinemaMode, setCinemaMode] = useState(false);

  if (user?.is_premium) {
    const purchasedAt = user.premium_purchased_at || new Date("2026-05-15T00:00:00.000Z").toISOString();
    
    // Calculate expiresAt dynamically based on premium_type package type if user.premium_expires_at is null/undefined
    const getDynamicExpiresAt = () => {
      if (user.premium_expires_at) return user.premium_expires_at;
      
      const purchaseDate = new Date(purchasedAt);
      const daysToAdd = 
        user.premium_type === 'PREMIUM_YEAR' ? 365 :
        user.premium_type === 'PREMIUM_6MONTHS' ? 180 : 30; // Default to 30 days for PREMIUM_MONTH or PREMIUM_COINS or empty
      
      purchaseDate.setDate(purchaseDate.getDate() + daysToAdd);
      return purchaseDate.toISOString();
    };

    const expiresAt = getDynamicExpiresAt();
    
    const getPackageName = (type: string | undefined) => {
      switch (type) {
        case 'PREMIUM_MONTH': return 'Gói VIP 1 Tháng';
        case 'PREMIUM_6MONTHS': return 'Gói VIP 6 Tháng';
        case 'PREMIUM_YEAR': return 'Gói VIP 1 Năm';
        case 'PREMIUM_COINS': return 'Gói VIP 1 Tháng (Coins)';
        default: return 'Premium VIP';
      }
    };

    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white pt-24 pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
        {/* Background Neon Glows */}
        <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-amber-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-yellow-500/5 rounded-full blur-3xl -z-10" />

        {/* Header Section */}
        <div className="max-w-6xl w-full text-center lg:text-left mb-10 flex flex-col lg:flex-row items-center justify-between gap-6 mt-6 border-b border-white/5 pb-8">
          <div className="flex flex-col lg:flex-row items-center gap-4 text-center lg:text-left">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)] flex-shrink-0 animate-pulse">
              <Crown size={32} className="text-zinc-950 fill-zinc-950" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Không Gian Hội Viên VIP
              </h1>
              <p className="text-zinc-400 text-xs md:text-sm font-medium mt-1">
                Xin chào, <span className="text-amber-400 font-extrabold">{user.username || user.name}</span>. Quản lý trạng thái và tùy chỉnh đặc quyền của bạn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <Star size={12} className="fill-amber-400 animate-spin-slow" /> Hào quang Premium
            </div>
          </div>
        </div>

        {/* Layout Split: 2 Columns */}
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (7/12): THÔNG TIN membership & LỊCH SỬ GIAO DỊCH */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            {/* Main Membership Panel */}
            <div className="w-full bg-[#181818]/60 border border-amber-400/30 backdrop-blur-xl p-6 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.05)] flex flex-col gap-6 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse">
                    <Crown size={24} className="text-zinc-950 fill-zinc-950" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                      Hội viên hoàng gia <Star size={8} className="fill-amber-400 text-amber-400" />
                    </span>
                    <h2 className="text-xl font-black text-white uppercase tracking-wide mt-0.5">MyTube Premium VIP</h2>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto shadow-sm">
                  <Check size={12} strokeWidth={3} /> Đang hoạt động
                </div>
              </div>

              {/* Grid thông tin chính */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Gói đăng ký</span>
                    <span className="font-extrabold text-amber-300">{getPackageName(user.premium_type)}</span>
                  </div>
                </div>

                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Thanh toán</span>
                    <span className="font-bold text-white">
                      {user.premium_type === 'PREMIUM_COINS' ? 'MyTube Coins' : 'PayOS / VNĐ'}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Ngày kích hoạt</span>
                    <span className="font-semibold text-white">{new Date(purchasedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Ngày hết hạn</span>
                    <span className="font-semibold text-white">
                      {new Date(expiresAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tiến trình sử dụng */}
              <PremiumProgressBar purchasedAt={purchasedAt} expiresAt={expiresAt} />

              {/* Đếm ngược hết hạn */}
              <PremiumCountdown expiresAt={expiresAt} />
            </div>

            {/* Lịch sử giao dịch */}
            <div className="w-full bg-[#181818]/60 border border-white/10 backdrop-blur-xl p-6 rounded-3xl text-left flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Receipt size={16} className="text-amber-400" /> Lịch sử đăng ký dịch vụ
              </h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-zinc-300">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 font-bold">
                      <th className="py-2.5 text-left font-bold">Mã Hóa Đơn</th>
                      <th className="py-2.5 text-left font-bold">Gói dịch vụ</th>
                      <th className="py-2.5 text-left font-bold">Ngày đăng ký</th>
                      <th className="py-2.5 text-left font-bold">Số tiền</th>
                      <th className="py-2.5 text-right font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-zinc-400">#MTP-992178</td>
                      <td className="py-3 font-semibold text-white">{getPackageName(user.premium_type)}</td>
                      <td className="py-3 text-zinc-400">{new Date(purchasedAt).toLocaleDateString('vi-VN')}</td>
                      <td className="py-3 font-bold text-amber-300">
                        {user.premium_type === 'PREMIUM_COINS' ? '30 Coins' : (
                          user.premium_type === 'PREMIUM_YEAR' ? '250.000đ' : 
                          user.premium_type === 'PREMIUM_6MONTHS' ? '135.000đ' : '25.000đ'
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <span className="bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/20 text-[9px] uppercase tracking-wider">Thành công</span>
                      </td>
                    </tr>
                    {user.premium_type !== 'PREMIUM_YEAR' && (
                      <tr className="text-zinc-500">
                        <td className="py-3 font-mono text-[10px]">#MTP-129302</td>
                        <td className="py-3">MyTube Thử nghiệm</td>
                        <td className="py-3">15/03/2026</td>
                        <td className="py-3">0đ</td>
                        <td className="py-3 text-right">
                          <span className="bg-zinc-800 text-zinc-500 font-medium px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Hết hạn</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5/12): VIP PROFILE, INTERACTIVE SETTINGS & DETAILED PERKS */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full text-left">
            {/* VIP Profile Card */}
            <div className="w-full bg-[#181818]/60 border border-white/10 backdrop-blur-xl p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden">
              {/* Halos & gold glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/5 to-transparent rounded-full blur-xl pointer-events-none" />
              
              {/* Royal Gold Ring around avatar */}
              <div className="relative flex-shrink-0 group">
                <div className="absolute -inset-[3px] bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 rounded-full blur-[4px] animate-pulse" />
                <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-600 rounded-full animate-spin-slow" />
                <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-zinc-950 overflow-hidden relative z-10 flex items-center justify-center shadow-inner">
                  <img 
                    src={user.avatar || user.image || '/assets/img/avata.jpg'} 
                    alt="VIP Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-orange-500 w-5 h-5 rounded-full z-20 flex items-center justify-center shadow-md">
                  <Crown size={10} className="text-zinc-950 fill-zinc-950" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white">{user.username || user.name}</span>
                  <Crown size={12} className="text-amber-400 fill-amber-400 animate-pulse flex-shrink-0" />
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold block">{user.email || 'Hội viên Danh Dự'}</span>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-amber-400/10 text-amber-300 text-[8px] font-black px-2 py-0.5 rounded border border-amber-400/20 uppercase tracking-wide">Royal VIP Lvl 1</span>
                  <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Đang online
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive VIP Customizer Settings Panel */}
            <div className="w-full bg-[#181818]/60 border border-white/10 backdrop-blur-xl p-6 rounded-3xl flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Settings size={16} className="text-amber-400" /> Trung tâm điều chỉnh VIP
              </h3>
              
              <div className="space-y-4 text-xs">
                {/* Switch 1: VIP Comment Glow */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/20 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      Hào quang bình luận VIP 
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
                    </span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Lấp lánh viền vàng tên của bạn ở bình luận.</span>
                  </div>
                  <button 
                    onClick={() => setShowVipGlow(!showVipGlow)}
                    className={`w-10 h-5 rounded-full p-[2px] transition-all duration-300 cursor-pointer ${showVipGlow ? 'bg-amber-400' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-300 ${showVipGlow ? 'transform translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Switch 2: Crown Halo */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/20 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-1.5">Vòng xoay hào quang Avatar</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Vòng hào quang vàng xoay quanh ảnh đại diện.</span>
                  </div>
                  <button 
                    onClick={() => setEnableCrownRing(!enableCrownRing)}
                    className={`w-10 h-5 rounded-full p-[2px] transition-all duration-300 cursor-pointer ${enableCrownRing ? 'bg-amber-400' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-300 ${enableCrownRing ? 'transform translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Switch 3: Cinema Entrance sound */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/20 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      Chế độ rạp chiếu phim (Cinema)
                    </span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Tự động kích hoạt màn chiếu rộng khi xem video.</span>
                  </div>
                  <button 
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className={`w-10 h-5 rounded-full p-[2px] transition-all duration-300 cursor-pointer ${cinemaMode ? 'bg-amber-400' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-300 ${cinemaMode ? 'transform translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Perks Showroom (Visual Cards) */}
            <div className="w-full flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Showroom đặc quyền VIP</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-tr from-amber-500/10 to-transparent bg-zinc-900/40 p-4 rounded-2xl border border-amber-400/20 hover:border-amber-400/40 transition-all">
                  <Shield size={18} className="text-amber-400 mb-2" />
                  <h4 className="text-xs font-black text-white">Chặn 100% QC</h4>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Loại bỏ hoàn toàn các loại quảng cáo làm phiền.</p>
                </div>

                <div className="bg-gradient-to-tr from-yellow-500/10 to-transparent bg-zinc-900/40 p-4 rounded-2xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all">
                  <Zap size={18} className="text-yellow-400 mb-2" />
                  <h4 className="text-xs font-black text-white">Luồng 4K HDR</h4>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Đường truyền VIP tốc độ cao nhất, sắc nét nhất.</p>
                </div>

                <div className="bg-gradient-to-tr from-orange-500/10 to-transparent bg-zinc-900/40 p-4 rounded-2xl border border-orange-400/20 hover:border-orange-400/40 transition-all">
                  <Sparkles size={18} className="text-orange-400 mb-2" />
                  <h4 className="text-xs font-black text-white">Crown Hào Quang</h4>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Nhãn vương miện lấp lánh khẳng định đẳng cấp hoàng gia.</p>
                </div>

                <div className="bg-gradient-to-tr from-blue-500/10 to-transparent bg-zinc-900/40 p-4 rounded-2xl border border-blue-400/20 hover:border-blue-400/40 transition-all">
                  <Activity size={18} className="text-blue-400 mb-2" />
                  <h4 className="text-xs font-black text-white">Tải lên Ưu Tiên</h4>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Được ưu tiên băng thông khi xử lý tải video mới lên.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="text-zinc-500 text-[10px] max-w-lg text-center mt-12">
          🔒 Giao dịch của bạn được bảo mật tuyệt đối. Cảm ơn bạn đã lựa chọn sử dụng dịch vụ MyTube Premium. Nếu cần trợ giúp hoặc yêu cầu tính năng đặc biệt, xin vui lòng gửi ý kiến qua hòm thư hỗ trợ VIP.
        </p>
      </div>
    );
  }

  const handleSelectPackage = async (packageType: 'month' | '6months' | 'year') => {
    const user = session?.user as any;
    if (!user?.id) {
      const confirmLogin = window.confirm("Bạn cần đăng nhập để đăng ký gói MyTube Premium. Đi đến trang đăng nhập ngay?");
      if (confirmLogin) {
        router.push('/login?callbackUrl=/premium');
      }
      return;
    }

    let amount = 25000;
    let videoId = 'PREMIUM_MONTH';
    let description = 'MyTube Premium 1T';

    if (packageType === '6months') {
      amount = 135000;
      videoId = 'PREMIUM_6MONTHS';
      description = 'MyTube Premium 6T';
    } else if (packageType === 'year') {
      amount = 250000;
      videoId = 'PREMIUM_YEAR';
      description = 'MyTube Premium 1N';
    }

    setLoadingPackage(packageType);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          videoId,
          userId: user.id,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể khởi tạo thanh toán PayOS');
      }

      if (data.checkoutUrl) {
        // Chuyển hướng sang trang thanh toán QR của PayOS!
        router.push(data.checkoutUrl);
      } else {
        throw new Error('Không nhận được liên kết thanh toán từ PayOS');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình kết nối cổng thanh toán.');
    } finally {
      setLoadingPackage(null);
    }
  };

  const premiumFeatures = [
    {
      icon: <Shield size={18} className="text-[#00b082]" />,
      title: "Chặn 100% quảng cáo",
      desc: "Thưởng thức các video yêu thích mà không bị ngắt quãng bởi bất kỳ quảng cáo nào."
    },
    {
      icon: <Zap size={18} className="text-amber-400" />,
      title: "Băng thông truyền tải VIP",
      desc: "Ưu tiên nạp và tải video với tốc độ tối đa, chất lượng sắc nét nhất."
    },
    {
      icon: <Sparkles size={18} className="text-yellow-400" />,
      title: "Hào quang Premium hoàng gia",
      desc: "Biểu tượng vương miện lấp lánh cạnh tên tài khoản, khẳng định đẳng cấp VIP."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pt-24 pb-16 px-4 relative overflow-hidden flex flex-col items-center">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-amber-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-yellow-500/5 rounded-full blur-3xl -z-10" />

      {/* Header Section */}
      <div className="max-w-4xl w-full text-center mb-16 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)] mb-6 animate-bounce">
          <Crown size={40} className="text-zinc-950 fill-zinc-950" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
          MyTube Premium
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Đăng ký gói đặc quyền để loại bỏ quảng cáo hoàn toàn, tăng tốc trải nghiệm và mở khóa những tính năng cao cấp nhất.
        </p>
      </div>

      {/* Main Container: Features and Package Selection */}
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-10 items-start mb-12">
        {/* Left column: Features list */}
        <div className="w-full lg:w-[35%] space-y-6 lg:pr-4 flex-shrink-0">
          <h2 className="text-2xl font-black tracking-wide border-b border-white/10 pb-4 flex items-center gap-2">
            ĐẶC QUYỀN THÀNH VIÊN <Star size={20} className="text-amber-400 fill-amber-400" />
          </h2>
          <div className="space-y-6 pt-2">
            {premiumFeatures.map((feat, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{feat.title}</h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Package choosing cards - Auto grids 3 columns on medium+ screen */}
        <div className="w-full lg:w-[65%] grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 1 Month */}
          <div className="bg-[#181818]/90 border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/20 group hover:scale-[1.01] min-h-[380px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Gói 1 Tháng</h3>
                  <p className="text-zinc-400 text-[10px] mt-1">Trải nghiệm ngắn hạn</p>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[8px] font-black uppercase">
                  Thử nghiệm
                </div>
              </div>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">25.000đ</span>
                <span className="text-zinc-500 text-[10px] font-semibold">/ tháng</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-[#00b082]" />
                  <span>Chặn QC trong 30 ngày</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-[#00b082]" />
                  <span>Băng thông VIP cực nhanh</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-[#00b082]" />
                  <span>Nhãn vương miện VIP</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPackage('month')}
              disabled={loadingPackage !== null}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loadingPackage === 'month' ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <span>Đăng ký 1 Tháng</span>
              )}
            </button>
          </div>

          {/* Card 2: 6 Months (NEW - GÓI Ở GIỮA CÂN ĐỐI) */}
          <div className="bg-gradient-to-b from-blue-500/10 to-transparent bg-[#181818]/90 border border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 group hover:scale-[1.01] min-h-[380px]">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black py-1 px-3 rounded-bl-xl uppercase tracking-wider shadow-md">
              Tiết kiệm 15k VNĐ!
            </div>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    Gói 6 Tháng <Flame size={14} className="fill-blue-400 text-blue-400" />
                  </h3>
                  <p className="text-zinc-400 text-[10px] mt-1">Phổ biến hàng đầu</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">135.000đ</span>
                  <span className="text-zinc-500 text-[10px] font-semibold">/ 6 tháng</span>
                </div>
                <p className="text-[9px] text-blue-400 font-semibold mt-1">Chỉ khoảng 22.500đ / tháng</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-blue-400" />
                  <span className="font-semibold text-white">Chặn QC trong 180 ngày</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-blue-400" />
                  <span>Băng thông VIP cực nhanh</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-blue-400" />
                  <span>Nhãn vương miện VIP</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPackage('6months')}
              disabled={loadingPackage !== null}
              className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold py-3 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loadingPackage === '6months' ? (
                <Loader2 size={14} className="animate-spin text-blue-400" />
              ) : (
                <span>Đăng ký 6 Tháng</span>
              )}
            </button>
          </div>

          {/* Card 3: 1 Year */}
          <div className="bg-gradient-to-b from-amber-500/15 to-orange-500/5 bg-[#181818]/90 border-2 border-amber-400/40 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden transition-all duration-300 hover:border-amber-400/70 group hover:scale-[1.02] min-h-[380px]">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 text-[8px] font-black py-1 px-3 rounded-bl-xl uppercase tracking-wider shadow-md animate-pulse">
              Tiết kiệm 50k VNĐ!
            </div>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    Gói 1 Năm <Star size={12} className="fill-amber-400" />
                  </h3>
                  <p className="text-zinc-400 text-[10px] mt-1">Lựa chọn tối ưu nhất</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">250.000đ</span>
                  <span className="text-zinc-500 text-[10px] font-semibold">/ năm</span>
                </div>
                <p className="text-[9px] text-[#00b082] font-semibold mt-1">Chỉ khoảng 20.800đ / tháng</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-amber-400" />
                  <span className="font-semibold text-white">Chặn QC trong 365 ngày</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-amber-400" />
                  <span>Băng thông VIP cực nhanh</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check size={12} className="text-amber-400" />
                  <span>Nhãn vương miện VIP</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPackage('year')}
              disabled={loadingPackage !== null}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-zinc-950 font-black py-3 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loadingPackage === 'year' ? (
                <Loader2 size={14} className="animate-spin text-zinc-950" />
              ) : (
                <span>Đăng ký 1 Năm 🚀</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Feedback */}
      {errorMessage && (
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-5 rounded-2xl font-bold text-center animate-shake mb-6">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Secure Transaction Notice */}
      <div className="max-w-2xl text-center">
        <p className="text-zinc-500 text-[10px] leading-relaxed">
          🔒 Thanh toán được xử lý an toàn qua cổng **PayOS**. Chúng tôi cam kết bảo mật tuyệt đối thông tin thẻ ngân hàng và các giao dịch của bạn. Bằng việc nâng cấp, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của MyTube Premium.
        </p>
      </div>
    </div>
  );
}
