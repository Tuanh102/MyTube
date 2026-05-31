"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Video, 
    Users, 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight,
    Bell,
    Search,
    Menu,
    LogOut,
    ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [stats, setStats] = useState({
        totalRevenue: 12500000,
        platformFee: 1250000,
        totalUsers: 1240,
        totalVideos: 856
    });

    useEffect(() => {
        const adminData = sessionStorage.getItem('admin_token');
        if (!adminData) {
            router.push('/admin/login');
        } else {
            setAdmin(JSON.parse(adminData));
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <aside className="w-20 hover:w-64 transition-all duration-300 ease-in-out border-r border-white/5 bg-[#0f0f0f] hidden lg:flex flex-col group overflow-hidden">
                <div className="p-8 flex items-center justify-center group-hover:justify-start gap-3 transition-all duration-300">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="font-black text-xl tracking-tighter opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">ADMIN PANEL</span>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest px-4 mb-4 mt-4 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden transition-all duration-300">Menu chính</div>
                    <button className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-4 py-3 bg-red-600 rounded-xl text-white font-bold transition-all">
                        <LayoutDashboard size={18} className="flex-shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">Tổng quan</span>
                    </button>
                    <button className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                        <Video size={18} className="flex-shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">Quản lý Video</span>
                    </button>
                    <button className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                        <Users size={18} className="flex-shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">Người dùng</span>
                    </button>
                    <button className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                        <DollarSign size={18} className="flex-shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">Tài chính & Lệnh rút</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-4 py-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-all"
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 w-96">
                        <Search size={18} className="text-white/20" />
                        <input type="text" placeholder="Tìm kiếm giao dịch, user..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-white/40 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-[#0a0a0a]"></span>
                        </button>
                        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white">{admin.name}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{admin.role}</p>
                            </div>
                            <img src={admin.avatar_url} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/5" alt="" />
                        </div>
                    </div>
                </header>

                {/* Dashboard Scroll Area */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black mb-2">Chào buổi sáng, {admin.name.split(' ')[0]}!</h2>
                        <p className="text-white/40">Dưới đây là tình hình hoạt động của MyTube hôm nay.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-[#111111] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <DollarSign size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={14} />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm font-medium mb-1">Tổng doanh thu</p>
                            <h3 className="text-2xl font-black">{stats.totalRevenue.toLocaleString('vi-VN')} đ</h3>
                        </div>

                        <div className="bg-[#111111] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={14} />
                                    <span>+8%</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm font-medium mb-1">Phí sàn (10%)</p>
                            <h3 className="text-2xl font-black">{stats.platformFee.toLocaleString('vi-VN')} đ</h3>
                        </div>

                        <div className="bg-[#111111] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full">
                                    <ArrowDownRight size={14} />
                                    <span>-2%</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm font-medium mb-1">Người dùng</p>
                            <h3 className="text-2xl font-black">{stats.totalUsers.toLocaleString('vi-VN')}</h3>
                        </div>

                        <div className="bg-[#111111] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Video size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={14} />
                                    <span>+24</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm font-medium mb-1">Tổng video</p>
                            <h3 className="text-2xl font-black">{stats.totalVideos.toLocaleString('vi-VN')}</h3>
                        </div>
                    </div>

                    {/* Chart Mockup Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-[32px] p-8 h-[400px] flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-bold text-lg">Biểu đồ doanh thu (30 ngày)</h4>
                                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none">
                                    <option>Tháng này</option>
                                    <option>Tháng trước</option>
                                </select>
                            </div>
                            <div className="flex-1 flex items-end gap-2 px-2">
                                {[40, 70, 45, 90, 65, 80, 50, 100, 75, 60, 85, 95].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-red-600/10 to-red-600/40 rounded-t-lg group relative" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h * 100}k
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-8">
                            <h4 className="font-bold text-lg mb-6">Hoạt động gần đây</h4>
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs">U{i}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">User {i} đã mua video</p>
                                            <p className="text-[10px] text-white/40">10 phút trước</p>
                                        </div>
                                        <div className="text-green-500 text-xs font-bold">+10k</div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">XEM TẤT CẢ</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
