"use client";

import React, { useState, useEffect } from 'react';
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
    Play
} from 'lucide-react';

export default function StaffPage() {
    const router = useRouter();
    const [staff, setStaff] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVideos: 0,
        pendingVideos: 0 
    });

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

    const handleResolveReport = async (reportId: string, action: 'DELETE_VIDEO' | 'KEEP_VIDEO') => {
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
                alert(action === 'DELETE_VIDEO' ? 'Đã xóa video vi phạm!' : 'Đã giữ lại video và đóng báo cáo!');
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
                        <span className="hidden lg:block font-medium">Báo cáo Video</span>
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
                                {reports.map((report) => (
                                    <div key={report._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-white/10 transition-all group animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-48 aspect-video bg-black rounded-xl overflow-hidden relative flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500">
                                            {report.videoThumbnail ? (
                                                <img src={report.videoThumbnail.startsWith('http') ? report.videoThumbnail : `http://127.0.0.1:5000${report.videoThumbnail}`} className="w-full h-full object-cover opacity-80" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10 bg-zinc-950">
                                                    <Flag size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                                                    {report.reason}
                                                </span>
                                                <span className="text-[10px] text-white/20 uppercase tracking-widest">{new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <h3 className="text-lg font-bold truncate mb-1 text-white">{report.videoTitle || 'Video không khả dụng'}</h3>
                                            <p className="text-xs text-white/40 mb-2">Người báo cáo: <span className="text-white/60 font-semibold">{report.reporter?.name || report.reporter?.username || 'Ẩn danh'}</span></p>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            <button 
                                                onClick={() => handleResolveReport(report._id, 'KEEP_VIDEO')}
                                                disabled={isActionLoading === report._id}
                                                className="px-5 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                <ShieldCheck size={16} /> Giữ lại video
                                            </button>
                                            <button 
                                                onClick={() => handleResolveReport(report._id, 'DELETE_VIDEO')}
                                                disabled={isActionLoading === report._id}
                                                className="px-5 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 flex items-center gap-2"
                                            >
                                                <XCircle size={16} /> Xóa video
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {reports.length === 0 && (
                                    <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                        <ShieldCheck size={48} className="text-white/5 mx-auto mb-4 animate-pulse" />
                                        <p className="text-white/20 italic">Tuyệt vời! Không có báo cáo vi phạm nào chưa xử lý.</p>
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
