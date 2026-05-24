"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Video, 
    Flag, 
    CheckCircle, 
    AlertCircle,
    Bell,
    LogOut,
    Users,
    MessageSquare,
    Search,
    Zap,
    Clock,
    Activity,
    Send,
    ChevronRight,
    ShieldCheck,
    XCircle,
    Play,
    Sun,
    Moon,
    Laptop,
    Radio,
    Power
} from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function StaffPage() {
    const router = useRouter();
    const { theme, setTheme } = useUI();
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
    const themeDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
                setIsThemeDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [staff, setStaff] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVideos: 0,
        pendingVideos: 0,
        reports: []
    });

    // States cho Live Moderation
    const [activeStreams, setActiveStreams] = useState<any[]>([]);
    const [isLiveActionLoading, setIsLiveActionLoading] = useState<string | null>(null);

    // States cho Moderation
    const [pendingVideos, setPendingVideos] = useState<any[]>([]);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    // States cho Support Tickets
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // States cho Video Reports
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const staffData = localStorage.getItem('staff_token');
        if (!staffData || staffData === "undefined") {
            router.push('/staff/login');
        } else {
            setStaff(JSON.parse(staffData));
            fetchStats();
            fetchTickets();
            fetchPendingVideos();
            fetchReports();
        }
    }, [router]);

    const fetchActiveStreams = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/live/active');
            if (res.ok) {
                const data = await res.json();
                setActiveStreams(data);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách streams cho Staff:', error);
        }
    };

    const handleForceEndStream = async (streamId: string) => {
        const confirmStop = window.confirm("Bạn có chắc chắn muốn tắt phiên phát trực tiếp vi phạm này ngay lập tức?");
        if (!confirmStop) return;

        setIsLiveActionLoading(streamId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/live/${streamId}/end`, {
                method: 'POST'
            });
            if (res.ok) {
                alert('Đã dừng phiên Live Stream vi phạm thành công!');
                fetchActiveStreams();
            } else {
                alert('Lỗi khi dừng phiên Live Stream');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi hệ thống khi dừng phiên Live Stream');
        } finally {
            setIsLiveActionLoading(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'lives') {
            fetchActiveStreams();
            const interval = setInterval(fetchActiveStreams, 3000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/admin/stats');
            const data = await res.json();
            if (res.ok) {
                setStats(prev => ({
                    ...prev,
                    totalUsers: data.totalUsers,
                    totalVideos: data.totalVideos
                }));
            }
        } catch (error) {
            console.error('Lỗi lấy thống kê staff:', error);
        }
    };

    const fetchPendingVideos = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/admin/pending-videos');
            if (res.ok) {
                const data = await res.json();
                setPendingVideos(data);
                setStats(prev => ({ ...prev, pendingVideos: data.length }));
            }
        } catch (error) {
            console.error('Lỗi lấy video chờ duyệt:', error);
        }
    };

    const handleModeration = async (videoId: string, action: 'approve' | 'reject') => {
        setIsActionLoading(videoId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/admin/${action}-video/${videoId}`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchPendingVideos();
                fetchStats();
                alert(action === 'approve' ? 'Đã phê duyệt video!' : 'Đã từ chối video!');
            }
        } catch (error) {
            alert('Lỗi khi thực hiện thao tác');
        } finally {
            setIsActionLoading(null);
        }
    };

    const fetchReports = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Lỗi lấy báo cáo video:', error);
        }
    };

    const handleResolveReport = async (reportId: string, action: 'DELETE_VIDEO' | 'KEEP_VIDEO' | 'DELETE_CHANNEL' | 'KEEP_CHANNEL') => {
        setIsActionLoading(reportId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/reports/${reportId}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                fetchReports();
                fetchStats();
                let msg = '';
                if (action === 'DELETE_VIDEO') msg = 'Đã xóa video vi phạm!';
                else if (action === 'KEEP_VIDEO') msg = 'Đã giữ lại video và đóng báo cáo!';
                else if (action === 'DELETE_CHANNEL') msg = 'Đã xóa kênh vi phạm!';
                else if (action === 'KEEP_CHANNEL') msg = 'Đã giữ lại kênh và đóng báo cáo!';
                alert(msg);
            }
        } catch (error) {
            alert('Lỗi khi thực hiện thao tác');
        } finally {
            setIsActionLoading(null);
        }
    };

    const fetchTickets = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/support/all-tickets');
            if (res.ok) setTickets(await res.json());
        } catch (error) {
            console.error('Lỗi lấy tickets:', error);
        }
    };

    const handleReplyTicket = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        setIsSubmittingReply(true);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/support/message/${selectedTicket._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: staff._id,
                    role: 'STAFF',
                    message: replyText
                })
            });
            if (res.ok) {
                setReplyText('');
                const updatedTicket = await res.json();
                setSelectedTicket(updatedTicket);
                fetchTickets();
                // alert('Đã gửi phản hồi thành công!');
            }
        } catch (error) {
            alert('Lỗi khi gửi phản hồi');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleTicketClick = async (ticket: any) => {
        setSelectedTicket(ticket);
        if (!ticket.isReadByStaff) {
            try {
                await fetch(`http://127.0.0.1:5000/api/support/mark-read/${ticket._id}`, { method: 'POST' });
                setTickets(prev => prev.map(t => t._id === ticket._id ? { ...t, isReadByStaff: true } : t));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('staff_token');
        router.push('/staff/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 11) return "Chào buổi sáng";
        if (hour >= 11 && hour < 14) return "Chào buổi trưa";
        if (hour >= 14 && hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    if (!staff) return <div className="min-h-screen bg-black"></div>;

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-red-500 selection:text-white">
            {/* Sidebar Staff */}
            <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col z-20">
                <div className="h-20 flex items-center px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center">
                            <Users size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden lg:block uppercase italic">STAFF PANEL</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block font-medium">Tổng quan</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('moderation')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'moderation' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <Video size={18} className={activeTab === 'moderation' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block font-medium">Kiểm duyệt Video</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('support')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'support' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <MessageSquare size={18} className={activeTab === 'support' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block font-medium">Hỗ trợ khách hàng</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <Flag size={18} className={activeTab === 'reports' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block font-medium">Báo cáo vi phạm</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('lives')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'lives' ? 'bg-white/[0.03] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <Radio size={18} className={activeTab === 'lives' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block font-medium">Kiểm duyệt Live Stream</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-white/20 hover:text-red-500 transition-all">
                        <LogOut size={18} />
                        <span className="hidden lg:block font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10">
                    <div className="flex items-center gap-4 bg-white/[0.02] px-4 py-2 rounded-lg border border-white/5 w-[300px]">
                        <Search size={16} className="text-white/20" />
                        <input type="text" placeholder="Tìm kiếm công việc..." className="bg-transparent border-none outline-none text-xs w-full" />
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Nút cài đặt giao diện Đa Chế Độ */}
                        <div className="relative" ref={themeDropdownRef}>
                            <button
                                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                title="Thay đổi giao diện"
                                className="p-2 hover:bg-white/10 rounded-full transition text-white cursor-pointer flex items-center justify-center border border-white/5"
                            >
                                {theme === 'light' ? (
                                    <Sun size={18} className="text-amber-500 fill-amber-500/20" />
                                ) : theme === 'dark' ? (
                                    <Moon size={18} className="text-indigo-400 fill-indigo-400/20" />
                                ) : theme === 'schedule' ? (
                                    <Clock size={18} className="text-teal-400" />
                                ) : (
                                    <Laptop size={18} className="text-zinc-300" />
                                )}
                            </button>

                            {isThemeDropdownOpen && (
                                <div className="absolute top-11 right-0 w-48 bg-[#202020] border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider select-none">
                                        Giao diện
                                    </div>
                                    <ul className="space-y-0.5 px-1.5 mt-1">
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setTheme('system');
                                                    setIsThemeDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition ${
                                                    theme === 'system' 
                                                        ? 'bg-white/10 text-white font-semibold' 
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <Laptop size={14} />
                                                <span>Hệ thống</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setTheme('light');
                                                    setIsThemeDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition ${
                                                    theme === 'light' 
                                                        ? 'bg-white/10 text-white font-semibold' 
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <Sun size={14} className="text-amber-500" />
                                                <span>Giao diện Sáng</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setTheme('dark');
                                                    setIsThemeDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition ${
                                                    theme === 'dark' 
                                                        ? 'bg-white/10 text-white font-semibold' 
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <Moon size={14} className="text-indigo-400" />
                                                <span>Giao diện Tối</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setTheme('schedule');
                                                    setIsThemeDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition ${
                                                    theme === 'schedule' 
                                                        ? 'bg-white/10 text-white font-semibold' 
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <Clock size={14} className="text-teal-400" />
                                                <span>Tự động theo giờ</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-xs font-bold">{staff.name}</p>
                            <p className="text-[10px] font-bold text-red-500 uppercase">Nhân viên kiểm duyệt</p>
                        </div>
                        <img src={staff.avatar_url} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {activeTab === 'overview' && (
                        <>
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold tracking-tight mb-1 italic uppercase">{getGreeting()}, {staff.name.split(' ')[0]}</h1>
                                <p className="text-white/30 text-sm flex items-center gap-2"><Clock size={16} /><span>Hệ thống đang hoạt động ổn định.</span></p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/5 text-green-500 rounded-lg flex items-center justify-center"><CheckCircle size={24} /></div>
                                        <div>
                                            <h3 className="text-2xl font-bold tabular-nums">{stats.totalVideos}</h3>
                                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Tổng số Video</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl hover:border-white/10 transition-all cursor-pointer" onClick={() => setActiveTab('support')}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-600/5 text-red-500 rounded-lg flex items-center justify-center"><MessageSquare size={24} /></div>
                                        <div>
                                            <h3 className="text-2xl font-bold tabular-nums">{tickets.filter(t => t.status === 'OPEN').length}</h3>
                                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Yêu cầu hỗ trợ</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl hover:border-white/10 transition-all cursor-pointer" onClick={() => setActiveTab('moderation')}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-yellow-500/5 text-yellow-500 rounded-lg flex items-center justify-center"><Zap size={24} /></div>
                                        <div>
                                            <h3 className="text-2xl font-bold tabular-nums text-yellow-500">{stats.pendingVideos}</h3>
                                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Video chờ duyệt</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'moderation' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold italic uppercase">Hàng chờ kiểm duyệt</h2>
                                <span className="bg-white/5 px-4 py-2 rounded-lg text-xs font-bold text-white/40">
                                    {pendingVideos.length} Video đang chờ
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {pendingVideos.map((video) => (
                                    <div key={video._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-8 hover:border-white/10 transition-all group">
                                        <div className="w-48 aspect-video bg-black rounded-xl overflow-hidden relative flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                                            <img src={`http://127.0.0.1:5000${video.thumbnail_url}`} className="w-full h-full object-cover opacity-80" alt="" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                    <Play size={20} fill="white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold truncate mb-2">{video.title}</h3>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <img src={video.channel?.avatar_url || '/assets/img/avata.jpg'} className="w-5 h-5 rounded-full" alt="" />
                                                    <span className="text-xs text-white/40 font-medium">{video.channel?.channel_name}</span>
                                                </div>
                                                <span className="text-[10px] text-white/20 uppercase tracking-widest">{new Date(video.createdAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <p className="text-xs text-white/30 line-clamp-2 italic">"{video.description || 'Không có mô tả'}"</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleModeration(video._id, 'reject')}
                                                disabled={isActionLoading === video._id}
                                                className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-all flex items-center gap-2"
                                            >
                                                <XCircle size={16} /> Từ chối
                                            </button>
                                            <button 
                                                onClick={() => handleModeration(video._id, 'approve')}
                                                disabled={isActionLoading === video._id}
                                                className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 flex items-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Phê duyệt
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {pendingVideos.length === 0 && (
                                    <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                        <Activity size={48} className="text-white/5 mx-auto mb-4 animate-pulse" />
                                        <p className="text-white/20 italic">Tuyệt vời! Không còn video nào đang chờ kiểm duyệt.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Danh sách Ticket */}
                            <div className="lg:col-span-1 space-y-4">
                                <h2 className="text-xl font-bold mb-6 italic uppercase">Danh sách hỗ trợ</h2>
                                <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                    {tickets.map(ticket => (
                                        <div 
                                            key={ticket._id} 
                                            onClick={() => handleTicketClick(ticket)}
                                            className={`p-5 rounded-xl border transition-all cursor-pointer relative ${selectedTicket?._id === ticket._id ? 'bg-red-600/10 border-red-600/50 shadow-lg shadow-red-600/5' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                                        >
                                            {!ticket.isReadByStaff && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${ticket.status === 'OPEN' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/40'}`}>
                                                    {ticket.status === 'OPEN' ? 'Mới' : 'Đã giải quyết'}
                                                </span>
                                                <span className="text-[10px] text-white/20 font-medium">{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <h4 className="font-bold text-sm line-clamp-1">{ticket.subject}</h4>
                                            <p className="text-[11px] text-white/40 mt-1 line-clamp-1">Từ: {ticket.userId?.name}</p>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && <p className="text-white/20 italic text-center py-10">Không tìm thấy yêu cầu nào.</p>}
                                </div>
                            </div>

                            {/* Chi tiết & Phản hồi */}
                            <div className="lg:col-span-2">
                                {selectedTicket ? (
                                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 flex flex-col h-full animate-in fade-in duration-300">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <img src={selectedTicket.userId?.avatar_url || '/assets/img/avata.jpg'} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                                                <div>
                                                    <h3 className="font-bold text-lg">{selectedTicket.userId?.name}</h3>
                                                    <p className="text-xs text-white/40">{selectedTicket.userId?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Mã Ticket</p>
                                                <p className="text-xs font-mono text-red-500">{selectedTicket._id.substring(selectedTicket._id.length - 8).toUpperCase()}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-4 custom-scrollbar">
                                            {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                                                selectedTicket.messages.map((msg: any, idx: number) => (
                                                    <div key={idx} className={`flex ${msg.senderRole === 'STAFF' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                                                            msg.senderRole === 'STAFF' 
                                                            ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-600/10' 
                                                            : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'
                                                        }`}>
                                                            <p className="text-sm leading-relaxed">{msg.message}</p>
                                                            <span className="text-[9px] opacity-30 mt-2 block text-right">
                                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-20 text-white/10 italic text-xs">
                                                    Chưa có lịch sử hội thoại cho yêu cầu này.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-white/5">
                                            <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Gửi tin nhắn phản hồi</h4>
                                            <div className="relative">
                                                <textarea 
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    placeholder="Nhập nội dung trả lời tại đây..."
                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 pr-24 text-sm text-white outline-none focus:border-red-600 transition h-32 resize-none"
                                                />
                                                <button 
                                                    onClick={handleReplyTicket}
                                                    disabled={isSubmittingReply || !replyText.trim()}
                                                    className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs"
                                                >
                                                    {isSubmittingReply ? '...' : <><Send size={16} /> Gửi tin nhắn</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl p-20 text-center bg-white/[0.01]">
                                        <MessageSquare size={48} className="text-white/5 mb-6" />
                                        <h3 className="text-white/40 font-bold">Chọn một yêu cầu để xem chi tiết</h3>
                                        <p className="text-white/10 text-xs mt-2 italic">Các yêu cầu từ người dùng MyTube sẽ xuất hiện tại đây.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold italic uppercase">Báo cáo từ người dùng</h2>
                                <span className="bg-white/5 px-4 py-2 rounded-lg text-xs font-bold text-white/40">
                                    {reports.length} Báo cáo chưa xử lý
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {reports.map((report) => {
                                    const isChannel = report.type === 'channel';
                                    return (
                                        <div key={report._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-white/10 transition-all group animate-in slide-in-from-bottom-2 duration-300">
                                            <div className={`bg-black overflow-hidden relative flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 ${isChannel ? 'w-20 h-20 rounded-full border border-white/10' : 'w-48 aspect-video rounded-xl'}`}>
                                                {isChannel ? (
                                                    <img 
                                                        src={report.channelAvatar ? (report.channelAvatar.startsWith('http') ? report.channelAvatar : `http://127.0.0.1:5000${report.channelAvatar}`) : '/assets/img/avata.jpg'} 
                                                        className="w-full h-full object-cover opacity-80" 
                                                        alt="" 
                                                    />
                                                ) : report.videoThumbnail ? (
                                                    <img 
                                                        src={report.videoThumbnail.startsWith('http') ? report.videoThumbnail : `http://127.0.0.1:5000${report.videoThumbnail}`} 
                                                        className="w-full h-full object-cover opacity-80" 
                                                        alt="" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/10 bg-zinc-950">
                                                        <Flag size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    {isChannel ? (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                                            Kênh
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                                                            Video
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                                                        {report.reason}
                                                    </span>
                                                    <span className="text-[10px] text-white/20 uppercase tracking-widest">{new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <h3 className="text-lg font-bold truncate mb-1 text-white">
                                                    {isChannel ? report.channelName : (report.videoTitle || 'Video không khả dụng')}
                                                </h3>
                                                <p className="text-xs text-white/40 mb-2">Người báo cáo: <span className="text-white/60 font-semibold">{report.reporter?.name || report.reporter?.username || 'Ẩn danh'}</span></p>
                                            </div>

                                            <div className="flex items-center gap-3 self-end md:self-center">
                                                <button 
                                                    onClick={() => handleResolveReport(report._id, isChannel ? 'KEEP_CHANNEL' : 'KEEP_VIDEO')}
                                                    disabled={isActionLoading === report._id}
                                                    className="px-5 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                                                >
                                                    <ShieldCheck size={16} /> {isChannel ? 'Giữ lại kênh' : 'Giữ lại video'}
                                                </button>
                                                <button 
                                                    onClick={() => handleResolveReport(report._id, isChannel ? 'DELETE_CHANNEL' : 'DELETE_VIDEO')}
                                                    disabled={isActionLoading === report._id}
                                                    className="px-5 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 flex items-center gap-2 cursor-pointer"
                                                >
                                                    <XCircle size={16} /> {isChannel ? 'Xóa kênh' : 'Xóa video'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {reports.length === 0 && (
                                    <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                        <ShieldCheck size={48} className="text-white/5 mx-auto mb-4 animate-pulse" />
                                        <p className="text-white/20 italic">Tuyệt vời! Không có báo cáo vi phạm nào chưa xử lý.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'lives' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold italic uppercase">Kiểm duyệt Live Stream</h2>
                                <span className="bg-white/5 px-4 py-2 rounded-lg text-xs font-bold text-white/40">
                                    {activeStreams.length} Kênh đang Live
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {activeStreams.map((stream) => (
                                    <div key={stream._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 hover:border-white/10 transition-all">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-zinc-900 flex-shrink-0">
                                                    <img src={stream.streamerAvatar || '/assets/img/avata.jpg'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        <span>{stream.title}</span>
                                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping flex-shrink-0" />
                                                    </h3>
                                                    <p className="text-xs text-white/40 mt-1">Kênh: <span className="text-white/70 font-semibold">{stream.streamerName}</span> | Người phát: <span className="text-white/70 font-semibold">{stream.streamerId}</span></p>
                                                </div>
                                            </div>

                                            {/* Action button */}
                                            <button 
                                                onClick={() => handleForceEndStream(stream._id)}
                                                disabled={isLiveActionLoading === stream._id}
                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-red-600/10 flex-shrink-0"
                                            >
                                                <Power size={14} /> Dừng phát ngay lập tức
                                            </button>
                                        </div>

                                        {/* Stream stats metrics */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                                            <div>
                                                <p className="text-white/40 uppercase font-black text-[9px] mb-1">Đang xem</p>
                                                <p className="text-sm font-bold text-white">{stream.viewerCount || 0} người xem</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 uppercase font-black text-[9px] mb-1">Thích (Like)</p>
                                                <p className="text-sm font-bold text-amber-400">{stream.likeCount || 0} lượt thích</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 uppercase font-black text-[9px] mb-1">Doanh thu Live</p>
                                                <p className="text-sm font-bold text-green-500">{(stream.earnings || 0).toLocaleString('vi-VN')} VNĐ</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 uppercase font-black text-[9px] mb-1">Ngày bắt đầu</p>
                                                <p className="text-sm font-bold text-blue-400">{new Date(stream.createdAt).toLocaleTimeString('vi-VN')} {new Date(stream.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>

                                        {/* Báo cáo vi phạm chi tiết */}
                                        {stream.reports && stream.reports.length > 0 ? (
                                            <div className="border border-red-500/20 bg-red-950/10 p-5 rounded-xl space-y-3">
                                                <p className="text-[10px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                                                    <AlertCircle size={12} /> Cảnh báo: Có {stream.reports.length} báo cáo vi phạm phòng live này
                                                </p>
                                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                    {stream.reports.map((rep: any, idx: number) => (
                                                        <div key={idx} className="p-3 bg-red-500/5 rounded-lg border border-red-500/10 text-xs text-white/80">
                                                            <div className="flex items-center justify-between mb-1 text-[10px] text-white/40">
                                                                <span>Bởi: <b>{rep.reporterName}</b> ({rep.reporterId})</span>
                                                                <span>{new Date(rep.createdAt).toLocaleTimeString('vi-VN')}</span>
                                                            </div>
                                                            <p className="text-red-300 font-bold mb-1">Lý do: {rep.reason}</p>
                                                            {rep.content && <p className="italic text-white/60">"{rep.content}"</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-green-500/60 italic flex items-center gap-1.5">
                                                <ShieldCheck size={12} /> Phòng live an toàn, chưa có báo cáo vi phạm nào.
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {activeStreams.length === 0 && (
                                    <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                        <Radio size={48} className="text-white/5 mx-auto mb-4 animate-pulse" />
                                        <p className="text-white/20 italic">Hiện không có phòng Live Stream nào đang phát sóng.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
