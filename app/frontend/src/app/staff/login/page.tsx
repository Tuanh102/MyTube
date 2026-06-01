"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Key } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function StaffLoginPage() {
    const router = useRouter();
    const { theme } = useUI();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim() || !password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/admin/staff-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.admin.role !== 'STAFF') {
                    setError('Tài khoản này không có quyền Nhân viên');
                    return;
                }
                setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
                sessionStorage.setItem('staff_token', JSON.stringify(data.admin));
                setTimeout(() => {
                    router.push('/staff');
                }, 1000);
            } else {
                setError(data.error || 'Email hoặc mật khẩu không chính xác');
            }
        } catch (err) {
            setError('Lỗi kết nối tới hệ thống đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030303] flex items-center justify-center p-0 relative overflow-hidden select-none font-sans transition-colors duration-300">
            
            {/* Background Grid & ambient lights */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-[60vw] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>
            
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/5 blur-[150px] rounded-full -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-rose-600/5 blur-[150px] rounded-full translate-y-1/2"></div>

            {/* MAIN DUAL PANEL LAYOUT */}
            <div className="w-full h-screen flex relative z-10">
                
                {/* LEFT PANEL (Tech Brand Space) */}
                <div className="hidden lg:flex flex-col justify-between w-[50vw] h-full p-20 select-none relative z-10">
                    
                    {/* Corner Brand Logo */}
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-2 group">
                            <img 
                                src="/assets/img/logoMyTube.png" 
                                alt="MyTube Logo" 
                                className="h-8 w-auto object-contain transition-transform"
                            />
                            <span className="text-zinc-950 dark:text-white font-black text-2xl tracking-tighter">
                                My<span className="text-red-600">Tube</span>
                                <span className="text-red-500 font-bold text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 ml-2 relative top-[-3px]">STAFF</span>
                            </span>
                        </div>
                    </div>

                    {/* Mid Text & Showcase Card */}
                    <div className="max-w-xl my-auto space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                                Kiểm Duyệt MyTube <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
                                    Nhanh Chóng & Bảo Mật.
                                </span>
                            </h2>
                            <p className="text-zinc-500 dark:text-white/40 text-base leading-relaxed font-medium">
                                Cổng đăng nhập dành riêng cho Nhân viên kiểm duyệt và quản trị nội dung. Đăng nhập an toàn bằng tài khoản ID và mật khẩu do Quản trị viên (Admin) cấp phát nội bộ.
                            </p>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/80 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm dark:shadow-none transition-all duration-300">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 dark:text-red-400">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="text-zinc-900 dark:text-white font-bold text-sm">Email ID</h4>
                                    <p className="text-zinc-500 dark:text-white/30 text-xs mt-1 leading-relaxed">Mã danh tính nhân viên duy nhất hoạt động trên toàn hệ thống.</p>
                                </div>
                            </div>
                            <div className="bg-white/80 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm dark:shadow-none transition-all duration-300">
                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 dark:text-rose-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-zinc-900 dark:text-white font-bold text-sm">Mật khẩu Lớp cứng</h4>
                                    <p className="text-zinc-500 dark:text-white/30 text-xs mt-1 leading-relaxed">Mật khẩu được lưu trữ mã hóa để bảo vệ phiên live stream luôn sạch.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-zinc-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest flex gap-6">
                        <span>SECURITY LEVEL A</span>
                        <span>•</span>
                        <span>© 2026 MyTube Studio</span>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-full lg:w-[50vw] xl:w-[44vw] h-full relative z-20 flex flex-col justify-center bg-white dark:bg-[#09090b] lg:bg-transparent transition-colors duration-300">
                    
                    {/* SLANTED SOLID PANEL BACKGROUND */}
                    <div 
                        className="hidden lg:block absolute inset-0 bg-gradient-to-b from-white via-slate-50/80 to-white dark:from-[#09090b] dark:via-[#0b0b0e] dark:to-[#070709] border-l border-zinc-200 dark:border-white/5 shadow-2xl z-10 transition-colors duration-300"
                        style={{
                            clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)'
                        }}
                    ></div>

                    {/* SLANTED NEON GLOWING SEPARATOR LINE */}
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

                    {/* FORM CONTAINER */}
                    <div className="w-full max-w-sm mx-auto lg:mr-16 xl:mr-28 p-10 lg:p-0 relative z-30 animate-in fade-in zoom-in-95 duration-500">
                        
                        {/* Header */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-10">
                            <div className="mb-5 lg:hidden">
                                <img 
                                    src="/assets/img/logoMyTube.png" 
                                    alt="MyTube Logo" 
                                    className="h-12 w-auto object-contain"
                                />
                            </div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight lg:leading-tight">
                                Nhân viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">MyTube</span>
                            </h1>
                            <p className="text-zinc-500 dark:text-white/40 text-xs mt-2 font-medium">Đăng nhập cổng kiểm duyệt nội dung bằng email & mật khẩu cấp nội bộ</p>
                        </div>

                        {/* ALERT BOXES */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 p-4 rounded-2xl mb-6 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 font-semibold">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-emerald-550 dark:text-emerald-400 p-4 rounded-2xl mb-6 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 font-semibold">
                                <CheckCircle2 size={16} className="flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* LOGIN FORM */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Input 1: Email (ID) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest block">Email Nhân Viên (ID)</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/25" size={18} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nhập email đăng nhập"
                                        className="w-full bg-slate-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-zinc-950 dark:text-white outline-none focus:border-red-500/60 dark:focus:border-red-500/60 focus:bg-white dark:focus:bg-white/[0.06] transition-all text-sm font-semibold shadow-sm dark:shadow-none font-mono"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input 2: Mật khẩu */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest block">Mật khẩu bảo mật</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/25" size={18} />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu của bạn"
                                        className="w-full bg-slate-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-zinc-950 dark:text-white outline-none focus:border-red-500/60 dark:focus:border-red-500/60 focus:bg-white dark:focus:bg-white/[0.06] transition-all text-sm font-semibold shadow-sm dark:shadow-none"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* ACTION BUTTON */}
                            <div className="space-y-4">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    {loading ? 'Đang xác thực...' : <><CheckCircle2 size={14} /> Xác Nhận & Đăng Nhập <ArrowRight size={14} /></>}
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between text-zinc-400 dark:text-white/20 text-[9px] font-bold uppercase">
                            <span>SECURE PORTAL V1.5.0</span>
                            <span>© 2026 MyTube Studio</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
