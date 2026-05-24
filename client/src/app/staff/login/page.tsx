"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Cpu, Layers, Send, Key } from 'lucide-react';

export default function StaffLoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<1 | 2>(1); // 1: Nhập SĐT, 2: Nhập OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Xử lý đếm ngược gửi lại OTP
    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [countdown]);

    // Xử lý đổi giá trị OTP trong 6 ô
    const handleOtpChange = (value: string, index: number) => {
        const cleanValue = value.replace(/\D/g, '');
        if (!cleanValue) {
            const newOtpArray = [...otpArray];
            newOtpArray[index] = '';
            setOtpArray(newOtpArray);
            setOtp(newOtpArray.join(''));
            return;
        }

        const newOtpArray = [...otpArray];
        newOtpArray[index] = cleanValue.substring(cleanValue.length - 1);
        setOtpArray(newOtpArray);
        
        const combinedOtp = newOtpArray.join('');
        setOtp(combinedOtp);

        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Xử lý sự kiện bàn phím (Backspace để quay lại ô trước)
    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otpArray[index] && index > 0) {
                const newOtpArray = [...otpArray];
                newOtpArray[index - 1] = '';
                setOtpArray(newOtpArray);
                setOtp(newOtpArray.join(''));
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtpArray = [...otpArray];
                newOtpArray[index] = '';
                setOtpArray(newOtpArray);
                setOtp(newOtpArray.join(''));
            }
        }
    };

    // Xử lý dán mã OTP từ Clipboard
    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
        const newOtpArray = [...otpArray];
        
        for (let i = 0; i < pastedData.length; i++) {
            newOtpArray[i] = pastedData[i];
        }
        
        setOtpArray(newOtpArray);
        setOtp(newOtpArray.join(''));
        
        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    // Reset OTP khi quay lại thay đổi số điện thoại
    const handleResetPhone = () => {
        setStep(1);
        setOtp('');
        setOtpArray(['', '', '', '', '', '']);
        setSuccess('');
        setError('');
    };

    // Hàm xử lý khi nhấn Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (step === 1) {
            if (!phone.trim()) {
                setError('Vui lòng nhập số điện thoại');
                return;
            }

            setLoading(true);
            setError('');
            setSuccess('');

            try {
                const res = await fetch('/api/admin/request-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone.trim() })
                });

                const data = await res.json();

                if (res.ok) {
                    setStep(2);
                    setSuccess('Mã OTP đã được gửi về máy chủ và Discord Bot thành công!');
                    setCountdown(60);
                    
                    setTimeout(() => {
                        inputRefs.current[0]?.focus();
                    }, 100);
                } else {
                    setError(data.message || 'Số điện thoại này không có quyền nhân viên');
                }
            } catch (err) {
                setError('Đã có lỗi xảy ra khi kết nối tới máy chủ');
            } finally {
                setLoading(false);
            }
        } else {
            const otpCode = otpArray.join('');
            if (otpCode.length < 6) {
                setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số');
                return;
            }

            setLoading(true);
            setError('');

            try {
                const res = await fetch('/api/admin/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: phone.trim(),
                        otp: otpCode,
                        role: 'STAFF'
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.admin.role !== 'STAFF' && data.admin.role !== 'ADMIN') {
                        setError('Tài khoản này không có quyền Nhân viên');
                        return;
                    }
                    localStorage.setItem('staff_token', JSON.stringify(data.admin));
                    router.push('/staff');
                } else {
                    setError(data.message || 'Mã OTP không chính xác hoặc đã hết hạn');
                }
            } catch (err) {
                setError('Lỗi xác thực mã OTP hệ thống');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] flex items-center justify-center p-0 relative overflow-hidden select-none font-sans">
            
            {/* Background Grid & ambient lights - Restricted to left 60% on desktop to prevent grid bleed */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-[60vw] bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/5 blur-[150px] rounded-full -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-rose-600/5 blur-[150px] rounded-full translate-y-1/2"></div>

            {/* MAIN DUAL PANEL LAYOUT */}
            <div className="w-full h-screen flex relative z-10">
                
                {/* LEFT PANEL (Tech Brand Space) */}
                <div className="hidden lg:flex flex-col justify-between w-[50vw] h-full p-20 select-none relative z-10">
                    
                    {/* Corner Brand Logo */}
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                            <Users size={20} className="text-white" />
                        </div>
                        <span className="text-white font-black text-xl tracking-wider">MyTube <span className="text-red-500 font-medium text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 ml-1">STAFF</span></span>
                    </div>

                    {/* Mid Text & Showcase Card */}
                    <div className="max-w-xl my-auto space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
                                Kiểm Duyệt MyTube <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-500">
                                    Nhanh Chóng & Bảo Mật.
                                </span>
                            </h2>
                            <p className="text-white/40 text-base leading-relaxed">
                                Cổng đăng nhập dành riêng cho Nhân viên kiểm duyệt và quản trị nội dung. Đăng nhập an toàn bằng OTP bảo vệ tài nguyên người dùng và giữ phiên live stream luôn an sau.
                            </p>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4 hover:border-white/10 transition-all duration-300">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Discord OTP</h4>
                                    <p className="text-white/30 text-xs mt-1">Mã xác thực gửi thẳng về phòng chat Discord riêng tư.</p>
                                </div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4 hover:border-white/10 transition-all duration-300">
                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                                    <Cpu size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Chặn SĐT Lạ</h4>
                                    <p className="text-white/30 text-xs mt-1">Chỉ những số điện thoại khai báo nội bộ mới được cấp OTP.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-white/20 text-xs font-bold uppercase tracking-widest flex gap-6">
                        <span>SECURITY LEVEL A</span>
                        <span>•</span>
                        <span>© 2026 MyTube Studio</span>
                    </div>
                </div>

                {/* RIGHT PANEL (w-[50vw] total, clipped at 10% top -> 0% bottom for a very subtle, elegant tilt) */}
                <div className="w-full lg:w-[50vw] xl:w-[44vw] h-full relative z-20 flex flex-col justify-center bg-[#09090b] lg:bg-transparent">
                    
                    {/* GENTLY SLANTED SOLID PANEL BACKGROUND */}
                    <div 
                        className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0b0b0e] to-[#070709] border-l border-white/5 shadow-2xl z-10"
                        style={{
                            clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)'
                        }}
                    ></div>

                    {/* SLIGHTLY SLANTED NEON GLOWING SEPARATOR LINE (x1="10%", matching polygon slant) */}
                    <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="neon-glow" x1="1" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                                </linearGradient>
                                <filter id="blur-filter" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="8" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <line 
                                x1="10%" 
                                y1="0" 
                                x2="0%" 
                                y2="100%" 
                                stroke="url(#neon-glow)" 
                                strokeWidth="2.5" 
                                filter="url(#blur-filter)"
                            />
                        </svg>
                    </div>

                    {/* FORM CONTAINER - Perfectly aligned and pushed right (lg:mr-16 xl:mr-28) to ensure zero diagonal cutting */}
                    <div className="w-full max-w-sm mx-auto lg:mr-16 xl:mr-28 p-10 lg:p-0 relative z-30 animate-in fade-in zoom-in-95 duration-500">
                        
                        {/* Header (Clean, borderless, text floating) */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-10">
                            <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-red-600/20 rotate-3 hover:rotate-0 transition-transform duration-500 lg:hidden">
                                <Users size={30} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight lg:leading-tight">
                                Nhân viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">MyTube</span>
                            </h1>
                            <p className="text-white/40 text-xs mt-2">Đăng nhập cổng kiểm duyệt nội dung bảo mật qua Discord Bot</p>
                        </div>

                        {/* ALERT BOXES */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-6 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 size={16} className="flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* SINGLE FORM WITH SĐT AND OTP BOXES PERFECTLY SIZED AND ALIGNED */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Input 1: Số điện thoại */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Số điện thoại nhân viên</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Nhập SĐT (Ví dụ: 0325...)"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-red-500/60 focus:bg-white/[0.06] transition-all text-base font-semibold"
                                        disabled={loading || step === 2}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input 2: Mã OTP (6 ô vuông nhỏ CĂN BẰNG NHAU 100% với SĐT và Nút bấm) */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Mã xác thực OTP (6 chữ số)</label>
                                    
                                    {step === 2 && (
                                        <button 
                                            type="button"
                                            onClick={handleResetPhone}
                                            className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider animate-in fade-in duration-300 cursor-pointer"
                                        >
                                            Đổi SĐT
                                        </button>
                                    )}
                                </div>

                                {/* 6 Ô VUÔNG DÙNG HỆ THỐNG GRID CHUYÊN DỤNG (ĐẢM BẢO RỘNG BẰNG 100% KHUNG FORM) */}
                                <div className="grid grid-cols-6 gap-3 w-full py-1">
                                    {otpArray.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target.value, idx)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                                            ref={(el) => {
                                                inputRefs.current[idx] = el;
                                            }}
                                            className={`w-full aspect-square text-center text-xl lg:text-2xl font-black bg-white/[0.03] border border-white/10 rounded-2xl outline-none focus:border-red-500/60 focus:bg-white/[0.06] text-white transition-all ${
                                                step === 1 
                                                    ? 'opacity-30 cursor-not-allowed select-none' 
                                                    : 'opacity-100 border-white/20'
                                            }`}
                                            disabled={loading || step === 1}
                                            required={step === 2}
                                        />
                                    ))}
                                </div>
                                <p className="text-[9px] text-white/30 italic">Mã OTP sẽ được chuyển tiếp qua Discord Bot (6 ô tự động nhảy).</p>
                            </div>

                            {/* DYNAMIC ACTION BUTTON */}
                            <div className="space-y-4">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    {loading ? (
                                        'Đang xử lý...'
                                    ) : step === 1 ? (
                                        <><Send size={14} /> Gửi Mã OTP Xác Thực <ArrowRight size={14} /></>
                                    ) : (
                                        <><CheckCircle2 size={14} /> Xác Nhận & Đăng Nhập</>
                                    )}
                                </button>

                                {step === 2 && (
                                    <div className="flex justify-center text-xs animate-in fade-in duration-300">
                                        {countdown > 0 ? (
                                            <span className="text-white/30 italic">Có thể gửi lại mã sau {countdown} giây</span>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={handleSubmit}
                                                className="text-red-500 hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <RefreshCw size={12} /> Gửi lại mã OTP
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between text-white/20 text-[9px] font-bold uppercase">
                            <span>SECURE PORTAL V1.5.0</span>
                            <span>© 2026 MyTube Studio</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
