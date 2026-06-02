"use client";
export const dynamic = 'force-dynamic';

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
    Power,
    Sparkles,
    Loader2,
    X,
    BadgeCheck,
    Building2,
    Eye,
    FileText
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import ClockWidget from '@/components/ClockWidget';


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
    const [stats, setStats] = useState<any>({
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

    // Smart search states
    const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
    const [smartSearchQuery, setSmartSearchQuery] = useState('');
    const [smartSearchResults, setSmartSearchResults] = useState<any>({
        tickets: [],
        videos: [],
        comments: []
    });
    const [isSmartSearching, setIsSmartSearching] = useState(false);

    useEffect(() => {
        if (!smartSearchQuery.trim()) {
            setSmartSearchResults({ tickets: [], videos: [], comments: [] });
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setIsSmartSearching(true);
            try {
                const res = await fetch(`/api/admin/smart-search?q=${encodeURIComponent(smartSearchQuery)}&role=STAFF`);
                const data = await res.json();
                if (res.ok) {
                    setSmartSearchResults(data);
                }
            } catch (err) {
                console.error("Smart search error:", err);
            } finally {
                setIsSmartSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [smartSearchQuery]);

    // States cho Video Reports
    const [reports, setReports] = useState<any[]>([]);

    // States cho Channel Verification
    const [allChannels, setAllChannels] = useState<any[]>([]);
    const [isVerifyLoading, setIsVerifyLoading] = useState<string | null>(null);

    useEffect(() => {
        const staffData = sessionStorage.getItem('staff_token');
        if (!staffData || staffData === "undefined") {
            sessionStorage.removeItem('staff_token');
            router.push('/staff/login');
        } else {
            try {
                setStaff(JSON.parse(staffData));
                fetchStats();
                fetchTickets();
                fetchPendingVideos();
                fetchReports();
            } catch (e) {
                sessionStorage.removeItem('staff_token');
                router.push('/staff/login');
            }
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
        } else if (activeTab === 'verification') {
            fetchChannels();
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
                    totalVideos: data.totalVideos,
                    staffStats: data.staffStats,
                    avgModerationTime: data.avgModerationTime,
                    ticketResolutionRate: data.ticketResolutionRate,
                    fingerprintCount: data.fingerprintCount
                }));
            }
        } catch (error) {
            console.error('Lỗi lấy thống kê staff:', error);
        }
    };

    const getPast7Days = () => {
        const dates = [];
        const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
            const dayName = i === 0 ? 'Hôm nay' : daysOfWeek[d.getDay()];
            dates.push({ label: `${dayName} (${dateStr})`, shortLabel: i === 0 ? 'Hôm nay' : dayName });
        }
        return dates;
    };

    const getStaffChartData = () => {
        const days = getPast7Days();
        const approved = stats.staffStats?.approved || [0, 0, 0, 0, 0, 0, 0];
        const rejected = stats.staffStats?.rejected || [0, 0, 0, 0, 0, 0, 0];
        
        return days.map((day, idx) => ({
            day: day.shortLabel,
            fullLabel: day.label,
            approved: approved[idx] || 0,
            rejected: rejected[idx] || 0
        }));
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

    const fetchChannels = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/channels');
            if (res.ok) {
                const data = await res.json();
                setAllChannels(data);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách kênh:', error);
        }
    };

    const handleVerifyChannel = async (channelId: string, action: 'verify' | 'unverify') => {
        setIsVerifyLoading(channelId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/channels/${channelId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_verified: action === 'verify' })
            });
            if (res.ok) {
                fetchChannels();
                alert(action === 'verify' ? 'Đã cấp tích xanh thành công!' : 'Đã thu hồi tích xanh!');
            } else {
                alert('Lỗi khi thực hiện thao tác xác minh kênh');
            }
        } catch (error) {
            alert('Lỗi kết nối máy chủ');
        } finally {
            setIsVerifyLoading(null);
        }
    };

    const handlePenalizeChannel = async (channelId: string, action: 'STRIKE' | 'BAN_7DAYS' | 'BAN_30DAYS' | 'BAN_FOREVER') => {
        const confirmMsg = {
            STRIKE: 'Xác nhận đánh 1 gậy cảnh cáo vào kênh này? (3 gậy = Khóa vĩnh viễn)',
            BAN_7DAYS: 'Xác nhận khóa kênh 7 ngày?',
            BAN_30DAYS: 'Xác nhận khóa kênh 30 ngày?',
            BAN_FOREVER: 'Xác nhận KHÓA VĨNH VIỄN kênh này? Hành động này không thể hoàn tác!'
        }[action];
        if (!window.confirm(confirmMsg)) return;

        setIsVerifyLoading(channelId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/channels/${channelId}/penalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                fetchChannels();
                alert('Đã thực hiện xử phạt thành công! Kênh và Creator đã được thông báo.');
            } else {
                alert('Lỗi khi xử phạt kênh');
            }
        } catch (error) {
            alert('Lỗi kết nối máy chủ');
        } finally {
            setIsVerifyLoading(null);
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
        sessionStorage.removeItem('staff_token');
        router.push('/staff/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 11) return "Chào buổi sáng";
        if (hour >= 11 && hour < 14) return "Chào buổi trưa";
        if (hour >= 14 && hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    if (!staff) return <div className="min-h-screen bg-rose-50/20 dark:bg-[#020202] transition-colors duration-300"></div>;

    return (
        <div className="min-h-screen bg-rose-50/20 dark:bg-[#020202] text-zinc-800 dark:text-zinc-100 flex font-sans selection:bg-red-650 selection:text-white transition-colors duration-300 relative overflow-hidden">
            {/* Crimson-onyx radial glow for Staff panel */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.04),rgba(0,0,0,0)_75%)] pointer-events-none z-0 block dark:hidden"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.12),rgba(0,0,0,0)_75%)] pointer-events-none z-0 hidden dark:block"></div>

            {/* Sidebar Staff - animated like admin */}
            <aside className="w-20 hover:w-64 transition-all duration-300 ease-in-out border-r border-rose-100 dark:border-red-950/20 flex flex-col z-20 bg-white dark:bg-[#090909]/80 backdrop-blur-md shadow-sm dark:shadow-none overflow-hidden group">
                <div className="h-20 flex items-center justify-center group-hover:justify-start px-3.5 group-hover:px-6 border-b border-rose-100 dark:border-red-950/10 transition-all duration-300">
                    <div className="flex items-center group/logo cursor-pointer" onClick={() => setActiveTab('overview')}>
                        <img 
                            src="/assets/img/logoMyTube.png" 
                            alt="MyTube Logo" 
                            className="h-7 w-auto object-contain transition-transform group-hover/logo:scale-105 flex-shrink-0"
                        />
                        <span className="font-black text-lg tracking-tighter text-zinc-950 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-3 transition-all duration-300 overflow-hidden">
                            My<span className="text-red-500">Tube</span>
                            <span className="text-[10px] text-red-500 font-bold ml-1.5 uppercase bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 relative top-[-1px]">STAFF</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-3.5 space-y-4 mt-6 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                    {/* Group 1: Tổng quan */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Tổng quan
                        </div>
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'overview' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <LayoutDashboard size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Tổng quan</span>
                        </button>
                    </div>

                    {/* Group 2: Kiểm duyệt nội dung */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Kiểm duyệt nội dung
                        </div>
                        <button 
                            onClick={() => setActiveTab('moderation')}
                            className={`w-full flex items-center justify-center group-hover:justify-between px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm relative ${
                                activeTab === 'moderation' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <div className="flex items-center justify-center group-hover:justify-start">
                                <Video size={18} className="flex-shrink-0" />
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Kiểm duyệt Video</span>
                            </div>
                            {pendingVideos.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 group-hover:static bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce transition-all duration-300">
                                    {pendingVideos.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('reports')}
                            className={`w-full flex items-center justify-center group-hover:justify-between px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm relative ${
                                activeTab === 'reports' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <div className="flex items-center justify-center group-hover:justify-start">
                                <Flag size={18} className="flex-shrink-0" />
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Báo cáo vi phạm</span>
                            </div>
                            {reports.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 group-hover:static bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce transition-all duration-300">
                                    {reports.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => { setActiveTab('lives'); fetchActiveStreams(); }}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'lives' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Radio size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Kiểm duyệt Live</span>
                        </button>
                    </div>

                    {/* Group 3: Hỗ trợ & Xác minh */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Hỗ trợ & Xác minh
                        </div>
                        <button 
                            onClick={() => setActiveTab('support')}
                            className={`w-full flex items-center justify-center group-hover:justify-between px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm relative ${
                                activeTab === 'support' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <div className="flex items-center justify-center group-hover:justify-start">
                                <MessageSquare size={18} className="flex-shrink-0" />
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Hỗ trợ khách hàng</span>
                            </div>
                            {tickets.filter(t => !t.isReadByStaff && t.status === 'OPEN').length > 0 && (
                                <span className="absolute top-1.5 right-1.5 group-hover:static bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce transition-all duration-300">
                                    {tickets.filter(t => !t.isReadByStaff && t.status === 'OPEN').length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('verification')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'verification' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <BadgeCheck size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Xác minh kênh</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-red-950/10 overflow-hidden relative z-10">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 text-zinc-400 hover:text-red-500 transition-all font-bold text-sm">
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">
                <header className="relative z-50 h-20 border-b border-rose-100 dark:border-white/5 flex items-center justify-between px-10 bg-white/40 dark:bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-3.5 bg-rose-50/50 dark:bg-white/[0.02] border border-rose-150 dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span className="text-xs font-bold text-zinc-850 dark:text-white uppercase tracking-wider">Bảng điều khiển Staff • Ổn định</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {/* Theme dropdown */}
                        <div className="relative" ref={themeDropdownRef}>
                            <button
                                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                title="Thay đổi giao diện"
                                className="p-2 hover:bg-rose-50 dark:hover:bg-white/10 rounded-full transition text-zinc-600 dark:text-white cursor-pointer flex items-center justify-center border border-rose-100 dark:border-white/5 bg-white dark:bg-transparent"
                            >
                                {theme === 'light' ? (
                                    <Sun size={18} className="text-amber-500 fill-amber-500/20" />
                                ) : theme === 'dark' ? (
                                    <Moon size={18} className="text-indigo-400 fill-indigo-400/20" />
                                ) : theme === 'schedule' ? (
                                    <Clock size={18} className="text-teal-400" />
                                ) : (
                                    <Laptop size={18} className="text-zinc-400 dark:text-zinc-300" />
                                )}
                            </button>

                            {isThemeDropdownOpen && (
                                <div className="absolute top-11 right-0 w-48 bg-white dark:bg-[#121212] border border-rose-100 dark:border-white/10 rounded-2xl shadow-xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { mode: 'system', label: 'Hệ thống', icon: Laptop },
                                        { mode: 'light', label: 'Sáng', icon: Sun, color: 'text-amber-500' },
                                        { mode: 'dark', label: 'Tối', icon: Moon, color: 'text-indigo-400' },
                                        { mode: 'schedule', label: 'Tự động (Giờ)', icon: Clock, color: 'text-teal-400' }
                                    ].map(({ mode, label, icon: Icon, color }) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setTheme(mode as any);
                                                setIsThemeDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors ${
                                                theme === mode 
                                                    ? 'bg-rose-50 dark:bg-white/10 text-zinc-950 dark:text-white font-semibold' 
                                                    : 'text-zinc-650 dark:text-white/70 hover:bg-rose-50/50 dark:hover:bg-white/5 hover:text-zinc-955 dark:hover:text-white'
                                            }`}
                                        >
                                            <Icon size={14} className={color || 'text-zinc-400'} />
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Real-time clock */}
                        <ClockWidget />

                        <div className="flex items-center gap-3 bg-white/60 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 px-4 py-2 rounded-xl">
                            <div className="text-right">
                                <p className="text-xs font-bold text-zinc-800 dark:text-white">{staff.name}</p>
                                <p className="text-[10px] font-bold text-red-500 uppercase">Nhân viên kiểm duyệt</p>
                            </div>
                            <img src={staff.avatar_url || '/assets/img/avata.jpg'} className="w-8 h-8 rounded-full border border-rose-100 dark:border-white/10 object-cover" alt="" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                    {/* Tab 1: Overview */}
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold tracking-tight mb-1 italic uppercase text-zinc-800 dark:text-white">{getGreeting()}, {staff.name.split(' ')[0]}</h1>
                                <p className="text-zinc-500 dark:text-white/30 text-sm flex items-center gap-2"><Clock size={16} className="text-red-500" /><span>Hệ thống đang hoạt động ổn định.</span></p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 p-8 rounded-xl hover:border-red-500/20 hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center"><CheckCircle size={24} /></div>
                                        <div>
                                            <h3 className="text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{stats.totalVideos}</h3>
                                            <p className="text-zinc-400 dark:text-white/20 text-[10px] font-black uppercase tracking-widest">Tổng số Video</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 p-8 rounded-xl hover:border-red-500/20 hover:shadow-sm transition-all cursor-pointer" onClick={() => setActiveTab('support')}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center"><MessageSquare size={24} /></div>
                                        <div>
                                            <h3 className="text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{tickets.filter(t => t.status === 'OPEN').length}</h3>
                                            <p className="text-zinc-400 dark:text-white/20 text-[10px] font-black uppercase tracking-widest">Yêu cầu hỗ trợ</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 p-8 rounded-xl hover:border-red-500/20 hover:shadow-sm transition-all cursor-pointer" onClick={() => setActiveTab('moderation')}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center"><Zap size={24} /></div>
                                        <div>
                                            <h3 className="text-2xl font-bold tabular-nums text-amber-500">{stats.pendingVideos}</h3>
                                            <p className="text-zinc-400 dark:text-white/20 text-[10px] font-black uppercase tracking-widest">Video chờ duyệt</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
{/* Grid of Chart & Performance metrics for Staff Dashboard */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-100">
                                {/* Moderation Activity Chart */}
                                <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-8 flex flex-col min-h-[360px] shadow-sm backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-white">Hiệu suất kiểm duyệt hệ thống</h4>
                                            <p className="text-[11px] text-zinc-400 dark:text-white/20 mt-1">Khối lượng nội dung được điều hành xử lý trong 7 ngày qua.</p>
                                        </div>
                                        <div className="flex gap-2 bg-rose-50/50 dark:bg-white/[0.02] p-1 rounded-xl border border-rose-100 dark:border-white/5">
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">Phê duyệt</span>
                                            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">Từ chối</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex items-end gap-4 px-2 min-h-[180px]">
                                        {getStaffChartData().map((item, i) => {








                                            const chartItems = getStaffChartData();
                                            const maxVal = Math.max(...chartItems.map(item => Math.max(item.approved, item.rejected, 1)), 5);
                                            const approvedHeight = (item.approved / maxVal) * 100;
                                            const rejectedHeight = (item.rejected / maxVal) * 100;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                                                    <div className="w-full flex gap-1.5 h-[160px] items-end justify-center">
                                                        {/* Approved Bar */}
                                                        <div 
                                                            className="w-1/2 bg-emerald-500/20 hover:bg-gradient-to-t hover:from-emerald-600 hover:to-teal-400 transition-all duration-300 rounded-t-md relative flex justify-center group/bar"
                                                            style={{ height: `${approvedHeight}%` }}
                                                        >
                                                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-zinc-900/90 text-white text-[9px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity font-mono z-30 shadow-xl pointer-events-none whitespace-nowrap">
                                                                {item.approved} duyệt
                                                            </div>
                                                        </div>
                                                        {/* Rejected Bar */}
                                                        <div 
                                                            className="w-1/2 bg-red-500/20 hover:bg-gradient-to-t hover:from-red-600 hover:to-orange-500 transition-all duration-300 rounded-t-md relative flex justify-center group/bar2"
                                                            style={{ height: `${rejectedHeight}%` }}
                                                        >
                                                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-zinc-900/90 text-white text-[9px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover/bar2:opacity-100 transition-opacity font-mono z-30 shadow-xl pointer-events-none whitespace-nowrap">
                                                                {item.rejected} từ chối
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400 dark:text-white/20 font-mono whitespace-nowrap">{item.day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* System health and Operating Metrics */}
                                <div className="lg:col-span-1 bg-white dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-8 flex flex-col min-h-[360px] shadow-sm backdrop-blur-md">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-white mb-6">Chỉ số vận hành</h4>
                                    
                                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                                        <div className="flex items-center justify-between border-b border-rose-50 dark:border-white/[0.02] pb-4">
                                            <div>
                                                <p className="text-xs font-bold text-zinc-800 dark:text-white">Thời gian phản hồi</p>
                                                <p className="text-[10px] text-zinc-450 dark:text-white/20 mt-0.5">Thời gian duyệt video trung bình</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-red-500 font-mono">{stats.avgModerationTime ? (stats.avgModerationTime < 60000 ? `${Math.round(stats.avgModerationTime / 1000)} giây` : `~${Math.round(stats.avgModerationTime / 60000)} phút`) : 'N/A'}</span>
                                                <span className="block text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-1 uppercase relative right-0 max-w-max ml-auto">Tối ưu</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-rose-50 dark:border-white/[0.02] pb-4">
                                            <div>
                                                <p className="text-xs font-bold text-zinc-800 dark:text-white">Tỷ lệ đóng ticket</p>
                                                <p className="text-[10px] text-zinc-450 dark:text-white/20 mt-0.5">Yêu cầu hỗ trợ đã giải quyết</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-amber-500 font-mono">{stats.ticketResolutionRate !== undefined ? `${stats.ticketResolutionRate}%` : '100%'}</span>
                                                <span className="block text-[8px] font-black text-zinc-400 bg-zinc-500/10 px-1.5 py-0.5 rounded border border-zinc-500/20 mt-1 uppercase relative right-0 max-w-max ml-auto">Tuần này</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-rose-50 dark:border-white/[0.02] pb-4">
                                            <div>
                                                <p className="text-xs font-bold text-zinc-800 dark:text-white">AI kiểm duyệt trước</p>
                                                <p className="text-[10px] text-zinc-450 dark:text-white/20 mt-0.5">Tự động đối chiếu mã băm video</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-emerald-500 font-mono">Đang bảo vệ (${stats.fingerprintCount || 0} video)</span>
                                                <span className="block text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-1 uppercase relative right-0 max-w-max ml-auto">Bảo vệ 24/7</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Moderation */}
                    {activeTab === 'moderation' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold italic uppercase text-zinc-800 dark:text-white">Hàng chờ kiểm duyệt</h2>
                                <span className="bg-rose-100/50 dark:bg-white/5 border border-rose-200 dark:border-transparent px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 dark:text-white/40">
                                    {pendingVideos.length} Video đang chờ
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {pendingVideos.map((video) => (
                                    <div key={video._id} className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-8 hover:border-red-500/20 hover:shadow-sm transition-all group">
                                        <div className="w-48 aspect-video bg-zinc-950 rounded-xl overflow-hidden relative flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                                            <img src={`http://127.0.0.1:5000${video.thumbnail_url}`} className="w-full h-full object-cover opacity-80" alt="" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                    <Play size={20} fill="white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold truncate mb-2 text-zinc-800 dark:text-white">{video.title}</h3>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <img src={video.channel?.avatar_url || '/assets/img/avata.jpg'} className="w-5 h-5 rounded-full object-cover border border-rose-100 dark:border-white/10" alt="" />
                                                    <span className="text-xs text-zinc-500 dark:text-white/40 font-medium">{video.channel?.channel_name}</span>
                                                </div>
                                                <span className="text-[10px] text-zinc-400 dark:text-white/20 uppercase tracking-widest">{new Date(video.createdAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <p className="text-xs text-zinc-650 dark:text-white/30 line-clamp-2 italic">"{video.description || 'Không có mô tả'}"</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleModeration(video._id, 'reject')}
                                                disabled={isActionLoading === video._id}
                                                className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
                                            >
                                                <XCircle size={16} /> Từ chối
                                            </button>
                                            <button 
                                                onClick={() => handleModeration(video._id, 'approve')}
                                                disabled={isActionLoading === video._id}
                                                className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 flex items-center gap-2 cursor-pointer"
                                            >
                                                <CheckCircle size={16} /> Phê duyệt
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {pendingVideos.length === 0 && (
                                    <div className="py-24 text-center bg-white/50 dark:bg-white/[0.01] border border-dashed border-rose-200 dark:border-white/5 rounded-3xl text-zinc-400 dark:text-white/20">
                                        <Activity size={48} className="text-rose-200 dark:text-white/5 mx-auto mb-4 animate-pulse" />
                                        <p className="italic font-bold">Tuyệt vời! Không còn video nào đang chờ kiểm duyệt.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Support */}
                    {activeTab === 'support' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
                            {/* Danh sách Ticket */}
                            <div className="lg:col-span-1 space-y-4">
                                <h2 className="text-xl font-bold mb-6 italic uppercase text-zinc-800 dark:text-white">Danh sách hỗ trợ</h2>
                                <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                    {tickets.map(ticket => (
                                        <div 
                                            key={ticket._id} 
                                            onClick={() => handleTicketClick(ticket)}
                                            className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
                                                selectedTicket?._id === ticket._id 
                                                    ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/5 text-zinc-800 dark:text-white' 
                                                    : 'bg-white dark:bg-white/[0.02] border-rose-100 dark:border-white/5 hover:border-red-500/20 text-zinc-650 dark:text-zinc-300'
                                            }`}
                                        >
                                            {!ticket.isReadByStaff && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${ticket.status === 'OPEN' ? 'bg-red-600 text-white' : 'bg-rose-100 dark:bg-white/10 text-zinc-500 dark:text-white/40'}`}>
                                                    {ticket.status === 'OPEN' ? 'Mới' : 'Đã giải quyết'}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 dark:text-white/20 font-medium">{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <h4 className="font-bold text-sm line-clamp-1 text-zinc-800 dark:text-white">{ticket.subject}</h4>
                                            <p className="text-[11px] text-zinc-500 dark:text-white/40 mt-1 line-clamp-1">Từ: {ticket.userId?.username || 'Creator Ẩn Danh'}</p>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && <p className="text-zinc-400 dark:text-white/20 italic text-center py-10">Không tìm thấy yêu cầu nào.</p>}
                                </div>
                            </div>

                            {/* Chi tiết & Phản hồi */}
                            <div className="lg:col-span-2">
                                {selectedTicket ? (
                                    <div className="bg-white dark:bg-white/[0.01] border border-rose-100 dark:border-white/5 rounded-2xl p-8 flex flex-col h-full animate-in fade-in duration-300 text-zinc-800 dark:text-white">
                                        <div className="flex items-start justify-between mb-8 border-b border-rose-100 dark:border-white/5 pb-6">
                                            <div className="flex items-center gap-4">
                                                <img src={selectedTicket.userId?.avatar || selectedTicket.userId?.avatar_url || '/assets/img/avata.jpg'} className="w-12 h-12 rounded-full border border-rose-100 dark:border-white/10 object-cover" alt="" />
                                                <div>
                                                    <h3 className="font-bold text-lg text-zinc-800 dark:text-white">{selectedTicket.userId?.username || 'Creator Ẩn Danh'}</h3>
                                                    <p className="text-xs text-zinc-500 dark:text-white/40">{selectedTicket.userId?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-widest">Mã Ticket</p>
                                                <p className="text-xs font-mono text-red-500 font-bold">{selectedTicket._id.substring(selectedTicket._id.length - 8).toUpperCase()}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-4 custom-scrollbar min-h-[250px]">
                                            {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                                                selectedTicket.messages.map((msg: any, idx: number) => (
                                                    <div key={idx} className={`flex ${msg.senderRole === 'STAFF' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                                                            msg.senderRole === 'STAFF' 
                                                            ? 'bg-red-650 text-white rounded-tr-none shadow-lg shadow-red-600/10' 
                                                            : 'bg-rose-50/50 dark:bg-white/5 text-zinc-800 dark:text-white/80 rounded-tl-none border border-rose-100 dark:border-white/5'
                                                        }`}>
                                                            <p className="text-sm leading-relaxed">{msg.message}</p>
                                                            <span className="text-[9px] opacity-40 mt-2 block text-right">
                                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-20 text-zinc-400 dark:text-white/10 italic text-xs">
                                                    Chưa có lịch sử hội thoại cho yêu cầu này.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-rose-100 dark:border-white/5">
                                            <h4 className="text-zinc-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Gửi tin nhắn phản hồi</h4>
                                            <div className="relative">
                                                <textarea 
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    placeholder="Nhập nội dung trả lời tại đây..."
                                                    className="w-full bg-rose-50/20 dark:bg-white/[0.03] border border-rose-200 dark:border-white/5 rounded-2xl p-6 pr-24 text-sm text-zinc-800 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/25 transition h-32 resize-none placeholder:text-zinc-450 dark:placeholder:text-white/20"
                                                />
                                                <button 
                                                    onClick={handleReplyTicket}
                                                    disabled={isSubmittingReply || !replyText.trim()}
                                                    className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 disabled:bg-red-905 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs cursor-pointer shadow-md"
                                                >
                                                    {isSubmittingReply ? '...' : <><Send size={16} /> Gửi tin nhắn</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-rose-200 dark:border-white/5 rounded-2xl p-20 text-center bg-white/50 dark:bg-white/[0.01] text-zinc-400 dark:text-white/20">
                                        <MessageSquare size={48} className="text-rose-200 dark:text-white/5 mb-6" />
                                        <h3 className="font-bold">Chọn một yêu cầu để xem chi tiết</h3>
                                        <p className="text-xs mt-2 italic">Các yêu cầu từ người dùng MyTube sẽ xuất hiện tại đây.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Reports */}
                    {activeTab === 'reports' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold italic uppercase text-zinc-800 dark:text-white">Báo cáo từ người dùng</h2>
                                <span className="bg-rose-100/50 dark:bg-white/5 border border-rose-200 dark:border-transparent px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 dark:text-white/40">
                                    {reports.length} Báo cáo chưa xử lý
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {reports.map((report) => {
                                    const isChannel = report.type === 'channel';
                                    return (
                                        <div key={report._id} className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-red-500/20 hover:shadow-sm transition-all group animate-in slide-in-from-bottom-2 duration-300 text-zinc-800 dark:text-white">
                                            <div className={`bg-zinc-950 overflow-hidden relative flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 ${isChannel ? 'w-20 h-20 rounded-full border border-rose-100 dark:border-white/10' : 'w-48 aspect-video rounded-xl'}`}>
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
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-white/10 bg-zinc-950">
                                                        <Flag size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    {isChannel ? (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                                                            Kênh
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                                                            Video
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                                                        {report.reason}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 dark:text-white/20 uppercase tracking-widest">{new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <h3 className="text-lg font-bold truncate mb-1 text-zinc-800 dark:text-white">
                                                    {isChannel ? report.channelName : (report.videoTitle || 'Video không khả dụng')}
                                                </h3>
                                                <p className="text-xs text-zinc-500 dark:text-white/40 mb-2">Người báo cáo: <span className="text-zinc-700 dark:text-white/60 font-semibold">{report.reporter?.username || 'Ẩn danh'}</span></p>
                                            </div>

                                            <div className="flex items-center gap-3 self-end md:self-center">
                                                <button 
                                                    onClick={() => handleResolveReport(report._id, isChannel ? 'KEEP_CHANNEL' : 'KEEP_VIDEO')}
                                                    disabled={isActionLoading === report._id}
                                                    className="px-5 py-3 rounded-xl border border-rose-200 dark:border-white/10 text-zinc-750 dark:text-white hover:bg-rose-50/50 dark:hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-white dark:bg-transparent"
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
                                    <div className="py-24 text-center bg-white/50 dark:bg-white/[0.01] border border-dashed border-rose-200 dark:border-white/5 rounded-3xl text-zinc-400 dark:text-white/20">
                                        <Flag size={48} className="text-rose-200 dark:text-white/5 mx-auto mb-4" />
                                        <p className="italic font-bold">Chưa có báo cáo vi phạm nào từ người dùng.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Lives */}
                    {activeTab === 'lives' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold italic uppercase text-zinc-800 dark:text-white">Kiểm duyệt Live Stream</h2>
                                <span className="bg-rose-100/50 dark:bg-white/5 border border-rose-200 dark:border-transparent px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 dark:text-white/40">
                                    {activeStreams.length} Kênh đang Live
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {activeStreams.map((stream) => (
                                    <div key={stream._id} className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-6 hover:border-red-500/20 hover:shadow-sm transition-all text-zinc-800 dark:text-white">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-rose-100 dark:border-white/10 bg-zinc-950 flex-shrink-0">
                                                    <img src={stream.streamerAvatar || '/assets/img/avata.jpg'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                                                        <span>{stream.title}</span>
                                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping flex-shrink-0" />
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Kênh: <span className="text-zinc-850 dark:text-white/70 font-semibold">{stream.streamerName}</span> | Người phát: <span className="text-zinc-850 dark:text-white/70 font-semibold">{stream.streamerId}</span></p>
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
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-white/[0.01] border border-rose-100 dark:border-white/5 text-xs text-zinc-800 dark:text-zinc-350">
                                            <div>
                                                <p className="text-zinc-500 dark:text-white/40 uppercase font-black text-[9px] mb-1">Đang xem</p>
                                                <p className="text-sm font-bold text-zinc-800 dark:text-white">{stream.viewerCount || 0} người xem</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 dark:text-white/40 uppercase font-black text-[9px] mb-1">Thích (Like)</p>
                                                <p className="text-sm font-bold text-amber-500">{stream.likeCount || 0} lượt thích</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 dark:text-white/40 uppercase font-black text-[9px] mb-1">Doanh thu Live</p>
                                                <p className="text-sm font-bold text-green-500">{(stream.earnings || 0).toLocaleString('vi-VN')} VNĐ</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 dark:text-white/40 uppercase font-black text-[9px] mb-1">Ngày bắt đầu</p>
                                                <p className="text-sm font-bold text-blue-500">{new Date(stream.createdAt).toLocaleTimeString('vi-VN')} {new Date(stream.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>

                                        {/* Báo cáo vi phạm chi tiết */}
                                        {stream.reports && stream.reports.length > 0 ? (
                                            <div className="border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-950/10 p-5 rounded-xl space-y-3">
                                                <p className="text-[10px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                                                    <AlertCircle size={12} /> Cảnh báo: Có {stream.reports.length} báo cáo vi phạm phòng live này
                                                </p>
                                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                    {stream.reports.map((rep: any, idx: number) => (
                                                        <div key={idx} className="p-3 bg-red-500/5 dark:bg-red-500/5 rounded-lg border border-red-200/50 dark:border-red-500/10 text-xs text-zinc-800 dark:text-white/80">
                                                            <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-400 dark:text-white/40">
                                                                <span>Bởi: <b>{rep.reporterName}</b> ({rep.reporterId})</span>
                                                                <span>{new Date(rep.createdAt).toLocaleTimeString('vi-VN')}</span>
                                                            </div>
                                                            <p className="text-red-650 dark:text-red-300 font-bold mb-1">Lý do: {rep.reason}</p>
                                                            {rep.content && <p className="italic text-zinc-600 dark:text-white/60">"{rep.content}"</p>}
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
                                    <div className="py-24 text-center bg-white/50 dark:bg-white/[0.01] border border-dashed border-rose-200 dark:border-white/5 rounded-3xl text-zinc-400 dark:text-white/20">
                                        <Radio size={48} className="text-rose-200 dark:text-white/5 mx-auto mb-4 animate-pulse" />
                                        <p className="italic font-bold">Hiện không có phòng Live Stream nào đang phát sóng.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 6: Channel Management — Verification & Penalties */}
                    {activeTab === 'verification' && (
                        <div className="animate-in fade-in duration-500 space-y-6">
                            {/* Stats row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 p-5 rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/20 mb-2">Tổng kênh</p>
                                    <p className="text-2xl font-bold text-zinc-800 dark:text-white tabular-nums">{allChannels.length}</p>
                                </div>
                                <div className="bg-white dark:bg-white/[0.02] border border-blue-200 dark:border-blue-500/20 p-5 rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Đã xác minh ✓</p>
                                    <p className="text-2xl font-bold text-blue-500 tabular-nums">{allChannels.filter(c => c.is_verified).length}</p>
                                </div>
                                <div className="bg-white dark:bg-white/[0.02] border border-amber-200 dark:border-amber-500/20 p-5 rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Đang bị cảnh cáo</p>
                                    <p className="text-2xl font-bold text-amber-500 tabular-nums">{allChannels.filter(c => (c.strikes || 0) > 0 && c.status !== 'BANNED').length}</p>
                                </div>
                                <div className="bg-white dark:bg-white/[0.02] border border-red-200 dark:border-red-500/20 p-5 rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Đã bị khóa</p>
                                    <p className="text-2xl font-bold text-red-500 tabular-nums">{allChannels.filter(c => c.status === 'BANNED').length}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold italic uppercase text-zinc-800 dark:text-white">Xác minh & Xử phạt kênh</h2>
                                    <p className="text-xs text-zinc-500 dark:text-white/30 mt-1">Cấp tích xanh, đánh gậy cảnh cáo (3 gậy = khóa vĩnh viễn) và kiểm soát vi phạm.</p>
                                </div>
                                <button onClick={fetchChannels} className="px-4 py-2 text-xs font-bold border border-rose-200 dark:border-white/10 text-zinc-600 dark:text-white/50 rounded-lg hover:bg-rose-50 dark:hover:bg-white/5 transition-all flex items-center gap-2">
                                    <Activity size={14} /> Làm mới
                                </button>
                            </div>

                            <div className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl overflow-x-auto">
                                <table className="w-full text-left text-xs min-w-[900px]">
                                    <thead>
                                        <tr className="bg-rose-50/50 dark:bg-white/[0.01] border-b border-rose-100 dark:border-white/5 text-zinc-500 dark:text-white/30 font-black uppercase tracking-wider text-[10px]">
                                            <th className="p-4">Kênh</th>
                                            <th className="p-4">Subs</th>
                                            <th className="p-4">Gậy cảnh cáo</th>
                                            <th className="p-4">Trạng thái</th>
                                            <th className="p-4">Tích xanh</th>
                                            <th className="p-4 text-right">Xử phạt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-50 dark:divide-white/[0.03]">
                                        {allChannels.map((channel) => {
                                            const strikes = channel.strikes || 0;
                                            const isBanned = channel.status === 'BANNED';
                                            const isTempBanned = channel.banExpiresAt && new Date(channel.banExpiresAt) > new Date();
                                            return (
                                                <tr key={channel._id} className={`hover:bg-rose-50/30 dark:hover:bg-white/[0.01] transition-colors ${isBanned ? 'opacity-60' : ''}`}>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={channel.avatar_url ? (channel.avatar_url.startsWith('http') ? channel.avatar_url : `http://127.0.0.1:5000${channel.avatar_url}`) : '/assets/img/avata.jpg'}
                                                                    className="w-9 h-9 rounded-full object-cover border border-rose-100 dark:border-white/10"
                                                                    alt=""
                                                                />
                                                                {isBanned && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white dark:border-zinc-900" />}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="font-bold text-zinc-900 dark:text-white">{channel.channel_name}</p>
                                                                    {channel.is_verified && <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />}
                                                                </div>
                                                                <p className="text-[10px] text-zinc-400 dark:text-white/25 font-mono">{channel.user?.username || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-bold text-zinc-800 dark:text-white tabular-nums">
                                                        {(channel.subscribers?.length || 0).toLocaleString('vi-VN')}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            {[0, 1, 2].map(i => (
                                                                <div key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black border transition-all ${
                                                                    i < strikes
                                                                        ? 'bg-amber-500 border-amber-600 text-white shadow-sm shadow-amber-500/30'
                                                                        : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-300 dark:text-white/20'
                                                                }`}>
                                                                    {i < strikes ? '⚡' : '·'}
                                                                </div>
                                                            ))}
                                                            <span className={`ml-1.5 text-[10px] font-black ${strikes >= 3 ? 'text-red-500' : strikes > 0 ? 'text-amber-500' : 'text-zinc-400 dark:text-white/20'}`}>
                                                                {strikes}/3
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {isBanned ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                                                                <XCircle size={10} /> Bị khóa
                                                            </span>
                                                        ) : isTempBanned ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                                                                <Clock size={10} /> Tạm khóa
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                                                                <CheckCircle size={10} /> Hoạt động
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {channel.is_verified ? (
                                                            <button
                                                                onClick={() => handleVerifyChannel(channel._id, 'unverify')}
                                                                disabled={isVerifyLoading === channel._id}
                                                                className="px-3 py-1.5 rounded-lg border border-blue-400/30 text-blue-500 text-[10px] font-black hover:bg-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                                                            >
                                                                {isVerifyLoading === channel._id ? <Loader2 size={10} className="animate-spin" /> : <BadgeCheck size={10} />}
                                                                Thu hồi ✓
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleVerifyChannel(channel._id, 'verify')}
                                                                disabled={isVerifyLoading === channel._id || isBanned}
                                                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                                                            >
                                                                {isVerifyLoading === channel._id ? <Loader2 size={10} className="animate-spin" /> : <BadgeCheck size={10} />}
                                                                Cấp tích ✓
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {!isBanned ? (
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <button
                                                                    onClick={() => handlePenalizeChannel(channel._id, 'STRIKE')}
                                                                    disabled={isVerifyLoading === channel._id}
                                                                    title="Đánh 1 gậy cảnh cáo (3 gậy = khóa vĩnh viễn)"
                                                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
                                                                >
                                                                    🪄 +Gậy
                                                                </button>
                                                                <button
                                                                    onClick={() => handlePenalizeChannel(channel._id, 'BAN_7DAYS')}
                                                                    disabled={isVerifyLoading === channel._id}
                                                                    title="Khóa tạm 7 ngày"
                                                                    className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-black hover:bg-orange-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                                >
                                                                    7N
                                                                </button>
                                                                <button
                                                                    onClick={() => handlePenalizeChannel(channel._id, 'BAN_30DAYS')}
                                                                    disabled={isVerifyLoading === channel._id}
                                                                    title="Khóa tạm 30 ngày"
                                                                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                                >
                                                                    30N
                                                                </button>
                                                                <button
                                                                    onClick={() => handlePenalizeChannel(channel._id, 'BAN_FOREVER')}
                                                                    disabled={isVerifyLoading === channel._id}
                                                                    title="Khóa vĩnh viễn kênh này"
                                                                    className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-black hover:bg-red-700 transition-all cursor-pointer disabled:opacity-40 shadow-sm shadow-red-600/20 whitespace-nowrap"
                                                                >
                                                                    ⛔ Vĩnh viễn
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-red-400/50 italic font-bold text-right block">Đã khóa</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {allChannels.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center text-zinc-400 dark:text-white/20 italic">
                                                    <Building2 size={40} className="mx-auto mb-4 opacity-20" />
                                                    <p className="font-bold">Không tìm thấy kênh nào.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* SMART SEARCH MODAL */}
            {isSmartSearchOpen && (
                <div className="fixed inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0c0c0c] border border-rose-100 dark:border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] transition-all duration-300">
                        {/* Search header */}
                        <div className="p-6 border-b border-rose-100 dark:border-white/5 flex items-center gap-4 bg-rose-50/20 dark:bg-white/[0.01]">
                            <Search className="text-red-500" size={24} />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm thông minh AI (Yêu cầu hỗ trợ, Video, Bình luận)..."
                                value={smartSearchQuery}
                                onChange={(e) => setSmartSearchQuery(e.target.value)}
                                autoFocus
                                className="bg-transparent border-none outline-none text-lg w-full text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20"
                            />
                            {isSmartSearching && (
                                <Loader2 className="animate-spin text-red-500" size={20} />
                            )}
                            <button 
                                onClick={() => setIsSmartSearchOpen(false)}
                                className="p-2 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search results body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-zinc-800 dark:text-white">
                            {!smartSearchQuery.trim() ? (
                                <div className="text-center py-20 text-zinc-400 dark:text-white/30">
                                    <Sparkles className="mx-auto mb-4 text-red-500/50" size={40} />
                                    <p className="font-bold text-sm">Gõ từ khóa để tìm kiếm thông minh AI</p>
                                    <p className="text-xs mt-1">Tìm kiếm các Yêu cầu hỗ trợ, Video và Bình luận trên hệ thống</p>
                                </div>
                            ) : (
                                <>
                                    {/* No results checking */}
                                    {(!smartSearchResults.tickets || smartSearchResults.tickets.length === 0) && 
                                     (!smartSearchResults.videos || smartSearchResults.videos.length === 0) && 
                                     (!smartSearchResults.comments || smartSearchResults.comments.length === 0) && (
                                        <div className="text-center py-20 text-zinc-400 dark:text-white/30">
                                            <AlertCircle className="mx-auto mb-4 text-zinc-500" size={40} />
                                            <p className="font-bold text-sm">Không tìm thấy kết quả phù hợp</p>
                                            <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                                        </div>
                                    )}

                                    {/* Tickets section */}
                                    {smartSearchResults.tickets?.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                                                <MessageSquare size={12} />
                                                Yêu cầu hỗ trợ ({smartSearchResults.tickets.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {smartSearchResults.tickets.map((ticket: any) => (
                                                    <div 
                                                        key={ticket._id} 
                                                        onClick={() => {
                                                            setActiveTab('support');
                                                            handleTicketClick(ticket);
                                                            setIsSmartSearchOpen(false);
                                                        }}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-red-500/30 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img src={ticket.userId?.avatar || '/assets/img/avata.jpg'} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt="" />
                                                            <div>
                                                                <p className="font-bold text-zinc-800 dark:text-white group-hover:text-red-500 transition-colors">{ticket.subject}</p>
                                                                <p className="text-[10px] text-zinc-500 mt-0.5">Người gửi: {ticket.userId?.username || 'Creator Ẩn Danh'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${ticket.status === 'OPEN' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-400'}`}>
                                                                {ticket.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Videos section */}
                                    {smartSearchResults.videos?.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                                                <Video size={12} />
                                                Video ({smartSearchResults.videos.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {smartSearchResults.videos.map((v: any) => (
                                                    <div 
                                                        key={v._id} 
                                                        onClick={() => {
                                                            setActiveTab('moderation');
                                                            setIsSmartSearchOpen(false);
                                                        }}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-start gap-4 cursor-pointer hover:border-amber-500/30 transition-all"
                                                    >
                                                        <img src={`http://127.0.0.1:5000${v.thumbnail_url}`} className="w-24 aspect-video rounded-lg object-cover border border-slate-200 dark:border-white/10" alt="" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-xs text-zinc-800 dark:text-white line-clamp-1">{v.title}</p>
                                                            <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">{v.description}</p>
                                                            <p className="text-[9px] text-zinc-400 dark:text-white/30 mt-2">Kênh: {v.channel?.channel_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500`}>
                                                                {v.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments section */}
                                    {smartSearchResults.comments?.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3 flex items-center gap-2">
                                                <MessageSquare size={12} />
                                                Bình luận ({smartSearchResults.comments.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {smartSearchResults.comments.map((comment: any) => (
                                                    <div 
                                                        key={comment._id}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-start gap-3 text-xs"
                                                    >
                                                        <img src={comment.userId?.avatar || '/assets/img/avata.jpg'} className="w-8 h-8 rounded-full border border-white/10 object-cover mt-0.5" alt="" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-zinc-800 dark:text-white">{comment.userId?.username || 'Ẩn Danh'}</span>
                                                                <span className="text-[9px] text-zinc-400 dark:text-white/30">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                                                            </div>
                                                            <p className="text-zinc-650 dark:text-white/80 mt-1">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
