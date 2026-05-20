"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Video, 
    Users, 
    DollarSign, 
    Bell,
    Search,
    LogOut,
    ShieldCheck,
    ArrowUpRight,
    Activity,
    Plus,
    CreditCard
} from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        platformFee: 0,
        totalUsers: 0,
        totalVideos: 0,
        adminBalance: 0
    });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const adminData = localStorage.getItem('admin_token');
        if (!adminData || adminData === "undefined") {
            localStorage.removeItem('admin_token');
            router.push('/admin/login');
            return;
        }

        try {
            setAdmin(JSON.parse(adminData));
            fetchStats();
            fetchTransactions();
        } catch (e) {
            localStorage.removeItem('admin_token');
            router.push('/admin/login');
        }
    }, [router]);

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/admin/transactions');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setTransactions(data);
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error(err);
            setTransactions([]);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error('Lỗi lấy thống kê:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 11) return "Chào buổi sáng";
        if (hour >= 11 && hour < 14) return "Chào buổi trưa";
        if (hour >= 14 && hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    if (!admin) return <div className="min-h-screen bg-black"></div>;

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-red-500 selection:text-white">
            {/* Sidebar Admin */}
            <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col z-20 transition-all duration-500">
                <div className="h-20 flex items-center px-8">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center transition-transform group-hover:rotate-12">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden lg:block uppercase italic">ADMIN PANEL</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block">Tổng quan</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('videos')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'videos' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <Video size={18} className={activeTab === 'videos' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block">Quản lý Video</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('finance')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'finance' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <CreditCard size={18} className={activeTab === 'finance' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block">Tài chính</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-white/20 hover:text-red-500 transition-all"
                    >
                        <LogOut size={18} />
                        <span className="hidden lg:block font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10">
                    <div className="flex items-center gap-4 text-white/40 hover:text-white/60 transition-colors cursor-pointer group">
                        <Search size={18} />
                        <span className="text-sm font-medium hidden md:block">Tìm kiếm mọi thứ...</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Hệ thống trực tuyến</span>
                        </div>
                        <button className="p-2 text-white/40 hover:text-white transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-1 h-1 bg-red-600 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                            <div className="text-right">
                                <p className="text-xs font-bold">{admin.name}</p>
                                <p className="text-[10px] font-bold text-red-500 uppercase">Quản trị viên</p>
                            </div>
                            <img src={admin.avatar_url} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-1 italic uppercase">
                                {getGreeting()}, {admin.name.split(' ')[0]}
                            </h2>
                            <p className="text-white/30 text-sm">Trạng thái nền tảng: <span className="text-red-500 font-bold">Hoạt động tốt</span></p>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all">
                            <Plus size={16} />
                            <span>Hành động nhanh</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Tổng doanh thu</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h3>
                                <div className="text-red-500 flex items-center gap-1 text-[10px] font-bold">
                                    <ArrowUpRight size={14} />
                                    <span>12%</span>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Phí sàn (10%)</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{stats.platformFee.toLocaleString('vi-VN')}đ</h3>
                                <div className="text-white/20 text-[10px] font-bold">TỈ LỆ 10%</div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Số dư hệ thống (Admin)</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-red-500">{(stats.adminBalance || 0).toLocaleString('vi-VN')}đ</h3>
                                <div className="text-white/20 text-[10px] font-bold">VÍ ADMIN</div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Người dùng mới</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{stats.totalUsers.toLocaleString('vi-VN')}</h3>
                                <div className="w-10 h-10 bg-red-600/5 rounded-lg flex items-center justify-center">
                                    <Users size={16} className="text-red-500" />
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Tài sản Video</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{stats.totalVideos.toLocaleString('vi-VN')}</h3>
                                <div className="text-white/20 text-[10px] font-bold">ĐANG BẬT</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {activeTab === 'overview' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-8 h-[400px] flex flex-col relative">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-3">
                                        <Activity size={18} className="text-red-600" />
                                        <h4 className="font-bold text-sm uppercase tracking-wider">Luồng doanh thu</h4>
                                    </div>
                                    <div className="flex bg-white/5 p-1 rounded-lg">
                                        <button className="px-3 py-1 text-[10px] font-bold bg-white/10 rounded-md">30 ngày</button>
                                        <button className="px-3 py-1 text-[10px] font-bold text-white/30 hover:text-white transition-colors">90 ngày</button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex items-end gap-1.5 px-2">
                                    {[30, 45, 40, 65, 80, 50, 75, 90, 85, 70, 95, 100, 85, 70, 60, 50, 40, 65, 80, 50, 75, 90, 85].map((h, i) => (
                                        <div key={i} className="flex-1 bg-red-600/[0.05] hover:bg-red-600 transition-all duration-300 rounded-t-sm relative group/bar" style={{ height: `${h}%` }}>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 flex flex-col">
                                <h4 className="font-bold text-sm uppercase tracking-wider mb-8">Giao dịch mới nhất</h4>
                                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {Array.isArray(transactions) && transactions.slice(0, 6).map((order: any) => (
                                        <div key={order._id} className="flex items-center gap-4 group cursor-pointer border-b border-white/[0.02] pb-4">
                                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex-1 text-xs">
                                                <p className="font-bold text-white/60 group-hover:text-white transition-colors">{order.userId?.name || 'Ẩn danh'}</p>
                                                <p className="text-[10px] text-white/20 mt-0.5">{order.amount.toLocaleString('vi-VN')}đ • {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div className="text-green-500 font-mono text-[10px]">+{order.amount * 0.1}đ</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'finance' ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                             <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                            <th className="px-8 py-5">Mã đơn hàng</th>
                                            <th className="px-8 py-5">Người mua</th>
                                            <th className="px-8 py-5">Video</th>
                                            <th className="px-8 py-5 text-right">Tổng tiền</th>
                                            <th className="px-8 py-5 text-right text-red-500">Phí sàn (10%)</th>
                                            <th className="px-8 py-5 text-right">Ngày giao dịch</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {Array.isArray(transactions) && transactions.map((order: any) => (
                                            <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                                                <td className="px-8 py-5 font-mono text-xs text-white/40">#{order.orderCode}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <img src={order.userId?.avatar || '/assets/img/avata.jpg'} className="w-6 h-6 rounded-full border border-white/10" alt="" />
                                                        <span className="text-sm font-bold">{order.userId?.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm text-white/60 line-clamp-1 max-w-[200px]">{order.videoId?.title || 'Video deleted'}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-bold text-sm">{order.amount.toLocaleString('vi-VN')}đ</td>
                                                <td className="px-8 py-5 text-right font-bold text-sm text-red-500">{(order.amount * 0.1).toLocaleString('vi-VN')}đ</td>
                                                <td className="px-8 py-5 text-right text-xs text-white/20">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20 text-white/20 italic">
                             Chức năng đang được cập nhật...
                        </div>
                    )}
                    </div>
                </div>
            </main>
        </div>
    );
}
