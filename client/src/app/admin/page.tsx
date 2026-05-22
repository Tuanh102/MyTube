"use client";

import React, { useState, useEffect, useRef } from 'react';
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
    CreditCard,
    CheckCircle2,
    X,
    AlertTriangle,
    Loader2,
    Check,
    AlertCircle,
    ArrowRight,
    Info,
    Calendar,
    ChevronRight,
    Smartphone,
    TrendingUp,
    Copy
} from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Core statistics state
    const [stats, setStats] = useState({
        totalRevenue: 0,
        platformFee: 0,
        totalUsers: 0,
        totalVideos: 0,
        adminBalance: 0
    });
    
    // Transactions / Payments history
    const [transactions, setTransactions] = useState<any[]>([]);

    // Withdrawals States
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [withdrawalFilters, setWithdrawalFilters] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'REJECTED'>('ALL');
    const [withdrawalSearch, setWithdrawalSearch] = useState('');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    
    // Payment interactive states
    const [paymentStep, setPaymentStep] = useState<'details' | 'qr_pay'>('details');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => {
            setCopiedField(null);
        }, 2000);
    };
    
    // Notifications and Action States
    const [showNotifications, setShowNotifications] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    
    // Payout simulator states
    const [isProcessingAuto, setIsProcessingAuto] = useState(false);
    const [autoTerminalLogs, setAutoTerminalLogs] = useState<string[]>([]);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    
    // Notification dropdown ref to click outside close
    const notificationRef = useRef<HTMLDivElement>(null);

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
            fetchWithdrawals();
        } catch (e) {
            localStorage.removeItem('admin_token');
            router.push('/admin/login');
        }
    }, [router]);

    // Handle clicking outside of notification dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto scroll to bottom in simulation terminal
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [autoTerminalLogs]);

    // Realtime status polling for selected withdrawal in QR payment modal
    useEffect(() => {
        if (!showWithdrawalModal || !selectedWithdrawal || paymentStep !== 'qr_pay' || selectedWithdrawal.status === 'SUCCESS') {
            return;
        }

        let intervalId = setInterval(async () => {
            try {
                const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal._id}`);
                if (!res.ok) return;
                
                const data = await res.json();
                if (data && data.status === 'SUCCESS') {
                    // Play a premium success sound using simple browser synthesizer (Web Audio API)
                    try {
                        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const oscillator = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 880; // A5 pitch
                        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);
                        
                        oscillator.start(audioCtx.currentTime);
                        oscillator.stop(audioCtx.currentTime + 0.35);
                    } catch (soundErr) {
                        console.log('Audio Context beep ignored', soundErr);
                    }

                    // Update local state for modal
                    setSelectedWithdrawal((prev: any) => ({ ...prev, status: 'SUCCESS' }));

                    // Refresh list & stats in the background
                    fetchWithdrawals();
                    fetchStats();
                    fetchTransactions();
                }
            } catch (err) {
                console.error('[POLLING WITHDRAWAL STATUS ERROR]:', err);
            }
        }, 1500);

        return () => clearInterval(intervalId);
    }, [showWithdrawalModal, selectedWithdrawal, paymentStep]);

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

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setWithdrawals(data);
            } else {
                setWithdrawals([]);
            }
        } catch (err) {
            console.error('[FETCH WITHDRAWALS ERROR]:', err);
            setWithdrawals([]);
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

    // Mapping bank codes to VietQR dynamic codes
    const getVietQrBankCode = (bankName: string) => {
        const mapping: Record<string, string> = {
            'MB': 'MB',
            'VCB': 'VCB',
            'TCB': 'TCB',
            'ACB': 'ACB',
            'BIDV': 'BIDV',
            'CTG': 'ICB',      // VietinBank
            'VBA': 'VBA',      // Agribank
            'TPB': 'TPB',
            'VPB': 'VPB',      // VPBank
            'STB': 'STB'       // Sacombank
        };
        return mapping[bankName] || bankName;
    };

    // Format money (VNĐ)
    const formatVND = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    // Calculate pending count
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');
    const pendingCount = pendingWithdrawals.length;

    // Handle Manual approval
    const [isCheckingManual, setIsCheckingManual] = useState(false);
    const handleApproveManual = async (withdrawalId: string) => {
        setIsSubmittingAction(true);
        try {
            // Check status on the server first to ensure they didn't skip simulator
            const checkRes = await fetch(`/api/admin/withdrawals/${withdrawalId}`);
            if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.status !== 'SUCCESS') {
                    alert('⚠️ HỆ THỐNG CHƯA NHẬN ĐƯỢC TÍN HIỆU THANH TOÁN THỰC TẾ!\n\nVui lòng quét mã QR Giả lập (Cách 2) hoặc bấm nút "Mở Trình Giả Lập trên PC" và ấn "Xác nhận chuyển tiền" trên giao diện ngân hàng trước.');
                    setIsSubmittingAction(false);
                    return;
                }
            }
            
            if (!confirm('Bạn có chắc chắn muốn xác nhận duyệt thành công cho yêu cầu này?')) {
                setIsSubmittingAction(false);
                return;
            }
            
            const res = await fetch('/api/admin/withdrawals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    id: withdrawalId,
                    method: 'AUTOMATIC_SIMULATED'
                })
            });

            if (res.ok) {
                alert('Duyệt thanh toán thành công!');
                setShowWithdrawalModal(false);
                setSelectedWithdrawal(null);
                fetchWithdrawals();
                fetchStats();
                fetchTransactions();
            } else {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra khi duyệt rút tiền.');
            }
        } catch (err) {
            console.error(err);
            alert('Không thể kết nối máy chủ.');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // Handle Automatic Payout Simulation with full retro terminal logs
    const handleAutomaticPayout = (withdrawalId: string) => {
        setIsProcessingAuto(true);
        setAutoTerminalLogs([
            '🚀 [SYSTEM] Khởi tạo kết nối cổng thanh toán Napas 24/7 trực tiếp...',
        ]);
        
        setTimeout(() => {
            setAutoTerminalLogs(prev => [...prev, '🔑 [AUTH] Đang gửi thông tin định danh Merchant & kiểm tra chứng thư...']);
        }, 500);
        
        setTimeout(() => {
            setAutoTerminalLogs(prev => [...prev, '🛡️ [SECURITY] Thiết lập kênh mã hóa SSL/TLS SHA-256 đối xứng...']);
        }, 1000);
        
        setTimeout(() => {
            setAutoTerminalLogs(prev => [...prev, '🔍 [VALIDATE] Đang kiểm tra trạng thái ngân hàng thụ hưởng & số tài khoản đích...']);
        }, 1500);

        setTimeout(() => {
            setAutoTerminalLogs(prev => [...prev, '💸 [GATEWAY] Số dư ví Admin hợp lệ. Đang phát lệnh thanh toán điện tử tự động...']);
        }, 2000);

        setTimeout(() => {
            setAutoTerminalLogs(prev => [...prev, '⚡ [TRANSACTION] Chuyển khoản liên ngân hàng Napas nhanh 247 đang được xử lý...']);
        }, 2500);

        setTimeout(() => {
            setAutoTerminalLogs(prev => [...prev, '✨ [SUCCESS] Trực tuyến báo có thành công! Mã giao dịch: NPS-MyTube-' + Math.floor(Math.random() * 900000 + 100000)]);
        }, 3200);

        setTimeout(async () => {
            try {
                const res = await fetch('/api/admin/withdrawals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'approve',
                        id: withdrawalId,
                        method: 'AUTOMATIC'
                    })
                });

                if (res.ok) {
                    alert('Chi tự động siêu tốc thành công! Hệ thống đã tự động chuyển khoản & trừ số dư Creator.');
                    setIsProcessingAuto(false);
                    setShowWithdrawalModal(false);
                    setSelectedWithdrawal(null);
                    fetchWithdrawals();
                    fetchStats();
                    fetchTransactions();
                } else {
                    const data = await res.json();
                    alert(data.error || 'Lỗi khi gửi duyệt tự động lên hệ thống.');
                    setIsProcessingAuto(false);
                }
            } catch (err) {
                console.error(err);
                alert('Không thể kết nối máy chủ.');
                setIsProcessingAuto(false);
            }
        }, 3700);
    };

    // Handle rejection
    const handleRejectWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối rút tiền.');
            return;
        }

        setIsSubmittingAction(true);
        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    id: selectedWithdrawal._id,
                    reason: rejectReason.trim()
                })
            });

            if (res.ok) {
                alert('Đã từ chối yêu cầu rút tiền thành công!');
                setIsRejecting(false);
                setRejectReason('');
                setShowWithdrawalModal(false);
                setSelectedWithdrawal(null);
                fetchWithdrawals();
            } else {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra khi từ chối yêu cầu.');
            }
        } catch (err) {
            console.error(err);
            alert('Không thể kết nối máy chủ.');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // Quick open detail from notifications
    const handleNotificationClick = (withdrawal: any) => {
        setSelectedWithdrawal(withdrawal);
        setActiveTab('withdrawals');
        setShowWithdrawalModal(true);
        setShowNotifications(false);
        setPaymentStep('details');
    };

    // Filter withdrawals logic
    const filteredWithdrawals = withdrawals.filter(w => {
        const matchesStatus = withdrawalFilters === 'ALL' || w.status === withdrawalFilters;
        const matchesSearch = 
            w.bankAccount.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
            w.bankAccountHolder.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
            (w.userId && w.userId.name.toLowerCase().includes(withdrawalSearch.toLowerCase())) ||
            (w.userId && w.userId.email.toLowerCase().includes(withdrawalSearch.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (!admin) return <div className="min-h-screen bg-black"></div>;

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-red-500 selection:text-white">
            {/* Sidebar Admin */}
            <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col z-20 transition-all duration-500 bg-[#070707]">
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('overview')}>
                        <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center transition-transform group-hover:rotate-12">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-base tracking-tight hidden lg:block uppercase italic">ADMIN PANEL</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'overview' ? 'bg-white/[0.04] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block">Tổng quan</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('videos')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'videos' ? 'bg-white/[0.04] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <Video size={18} className={activeTab === 'videos' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block">Quản lý Video</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('finance')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'finance' ? 'bg-white/[0.04] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <CreditCard size={18} className={activeTab === 'finance' ? 'text-red-500' : ''} />
                        <span className="hidden lg:block">Tài chính (Đơn hàng)</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('withdrawals')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'withdrawals' ? 'bg-white/[0.04] border border-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                    >
                        <div className="flex items-center gap-4">
                            <DollarSign size={18} className={activeTab === 'withdrawals' ? 'text-red-500' : ''} />
                            <span className="hidden lg:block">Duyệt rút tiền</span>
                        </div>
                        {pendingCount > 0 && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce hidden lg:inline-block">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-white/20 hover:text-red-500 transition-all rounded-xl"
                    >
                        <LogOut size={18} />
                        <span className="hidden lg:block font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#070707] z-10">
                    <div className="flex items-center gap-4 text-white/40 hover:text-white/60 transition-colors cursor-pointer group">
                        <Search size={18} />
                        <span className="text-sm font-medium hidden md:block">Tìm kiếm mọi thứ...</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hệ thống an toàn</span>
                        </div>
                        
                        {/* Notifications Bell Section */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-white/60 hover:text-white transition-colors relative bg-white/5 rounded-full hover:bg-white/10"
                            >
                                <Bell size={18} />
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Container */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-white">Yêu cầu rút tiền mới</h4>
                                        <span className="bg-red-600/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount} chờ duyệt</span>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                        {pendingWithdrawals.length > 0 ? (
                                            pendingWithdrawals.map((withdrawal) => (
                                                <div 
                                                    key={withdrawal._id} 
                                                    onClick={() => handleNotificationClick(withdrawal)}
                                                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group"
                                                >
                                                    <img 
                                                        src={withdrawal.userId?.avatar || '/assets/img/avata.jpg'} 
                                                        className="w-8 h-8 rounded-full border border-white/10 object-cover mt-0.5" 
                                                        alt="" 
                                                    />
                                                    <div className="flex-1 text-xs">
                                                        <p className="font-bold text-white group-hover:text-red-500 transition-colors">
                                                            {withdrawal.userId?.name || 'Creator Ẩn Danh'}
                                                        </p>
                                                        <p className="text-[10px] text-white/55 mt-0.5">
                                                            Yêu cầu rút <span className="font-bold text-green-500">{formatVND(withdrawal.amount)}</span> qua {withdrawal.bankName}
                                                        </p>
                                                        <p className="text-[9px] text-white/20 mt-1">
                                                            {new Date(withdrawal.createdAt).toLocaleDateString('vi-VN')} {new Date(withdrawal.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center text-white/30 text-xs italic flex flex-col items-center gap-2">
                                                <CheckCircle2 size={24} className="text-green-500" />
                                                <span>Không có yêu cầu chờ duyệt mới!</span>
                                            </div>
                                        )}
                                    </div>
                                    {pendingWithdrawals.length > 0 && (
                                        <button 
                                            onClick={() => { setActiveTab('withdrawals'); setShowNotifications(false); }}
                                            className="w-full text-center text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-1"
                                        >
                                            Xem tất cả <ChevronRight size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                            <div className="text-right">
                                <p className="text-xs font-bold">{admin.name}</p>
                                <p className="text-[10px] font-bold text-red-500 uppercase">Quản trị viên</p>
                            </div>
                            <img src={admin.avatar_url || '/assets/img/avata.jpg'} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt="" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-1 italic uppercase flex items-center gap-2">
                                {getGreeting()}, {admin.name.split(' ')[0]}
                            </h2>
                            <p className="text-white/30 text-sm">Hệ thống MyTube Studio: <span className="text-green-500 font-bold">100% Khả dụng</span></p>
                        </div>
                        {activeTab === 'withdrawals' && pendingCount > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                                <AlertCircle size={16} />
                                <span>Có {pendingCount} yêu cầu rút tiền đang chờ xử lý</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Tổng doanh thu mua</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{formatVND(stats.totalRevenue)}</h3>
                                <div className="text-red-500 flex items-center gap-0.5 text-[10px] font-bold">
                                    <TrendingUp size={12} />
                                    <span>TĂNG</span>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Phí sàn (10%)</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{formatVND(stats.platformFee)}</h3>
                                <div className="text-white/20 text-[10px] font-bold">10% SHARE</div>
                            </div>
                        </div>

                        <div className="group bg-[#110505] border border-red-900/10 p-6 rounded-2xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/45 text-[10px] font-black uppercase tracking-widest mb-4">Số dư khả dụng (Admin)</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-red-500">{formatVND(stats.adminBalance || 0)}</h3>
                                <div className="text-red-500/30 text-[9px] font-black uppercase">Ví Admin</div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Tổng Creators/Users</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{stats.totalUsers.toLocaleString('vi-VN')}</h3>
                                <div className="w-8 h-8 bg-red-600/5 rounded-lg flex items-center justify-center">
                                    <Users size={14} className="text-red-500" />
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-red-600/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Tài nguyên Video</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums">{stats.totalVideos.toLocaleString('vi-VN')}</h3>
                                <div className="text-white/20 text-[10px] font-bold">HOẠT ĐỘNG</div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation Content Area */}
                    <div className="w-full">
                        {/* 1. TAB OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                                <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-3xl p-8 h-[400px] flex flex-col relative">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <Activity size={18} className="text-red-600" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Luồng hoạt động hệ thống</h4>
                                        </div>
                                        <div className="flex bg-white/5 p-1 rounded-lg">
                                            <button className="px-3 py-1 text-[10px] font-bold bg-white/10 rounded-md">Realtime</button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex items-end gap-1.5 px-2">
                                        {[30, 45, 40, 65, 80, 50, 75, 90, 85, 70, 95, 100, 85, 70, 60, 50, 40, 65, 80, 50, 75, 90, 85].map((h, i) => (
                                            <div key={i} className="flex-1 bg-red-600/[0.06] hover:bg-red-600/70 transition-all duration-300 rounded-t-lg relative group/bar" style={{ height: `${h}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-[9px] px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity font-mono z-20">
                                                    {h}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 flex flex-col">
                                    <h4 className="font-bold text-sm uppercase tracking-wider mb-8">Giao dịch mua mới nhất</h4>
                                    <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                                        {Array.isArray(transactions) && transactions.length > 0 ? (
                                            transactions.slice(0, 6).map((order: any) => (
                                                <div key={order._id} className="flex items-center gap-4 group cursor-pointer border-b border-white/[0.02] pb-4">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="flex-1 text-xs">
                                                        <p className="font-bold text-white group-hover:text-red-500 transition-colors">{order.userId?.name || 'Khách vãng lai'}</p>
                                                        <p className="text-[10px] text-white/40 mt-0.5">{formatVND(order.amount)} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <div className="text-red-500 font-mono text-[10px] font-bold">+{formatVND(order.amount * 0.1)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-white/30 text-xs italic py-10 text-center">Chưa có giao dịch mua video nào.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. TAB VIDEOS */}
                        {activeTab === 'videos' && (
                            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 animate-in fade-in duration-500">
                                <h3 className="text-xl font-bold mb-6 italic uppercase">Quản lý nội dung nền tảng</h3>
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-white/40 text-xs">Dữ liệu video được tải lên từ Creators trong toàn bộ hệ thống.</p>
                                </div>
                                <div className="flex flex-col items-center justify-center py-20 text-white/20 italic bg-white/[0.01] rounded-2xl border border-white/5">
                                     <Video size={48} className="mb-4 text-white/10" />
                                     <span>Tính năng Quản lý báo cáo/xóa video hệ thống đang bảo trì định kỳ.</span>
                                </div>
                            </div>
                        )}

                        {/* 3. TAB FINANCE (TRANSACTIONS) */}
                        {activeTab === 'finance' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold italic uppercase mb-1">Nhật ký giao dịch</h3>
                                            <p className="text-white/40 text-xs">Liệt kê tất cả các đơn hàng mua khoá học/video Premium trên MyTube.</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                                    <th className="px-8 py-5">Mã đơn hàng</th>
                                                    <th className="px-8 py-5">Người mua</th>
                                                    <th className="px-8 py-5">Video / Khoá học</th>
                                                    <th className="px-8 py-5 text-right">Tổng tiền</th>
                                                    <th className="px-8 py-5 text-right text-red-500">Phí sàn (10%)</th>
                                                    <th className="px-8 py-5 text-right">Ngày giao dịch</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.02]">
                                                {Array.isArray(transactions) && transactions.length > 0 ? (
                                                    transactions.map((order: any) => (
                                                        <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                                                            <td className="px-8 py-5 font-mono text-xs text-white/40">#{order.orderCode}</td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={order.userId?.avatar || '/assets/img/avata.jpg'} className="w-6 h-6 rounded-full border border-white/10 object-cover" alt="" />
                                                                    <span className="text-sm font-bold">{order.userId?.name || 'Unknown User'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className="text-sm text-white/60 line-clamp-1 max-w-[250px]">{order.videoId?.title || 'Video đã bị gỡ'}</span>
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-bold text-sm">{formatVND(order.amount)}</td>
                                                            <td className="px-8 py-5 text-right font-bold text-sm text-red-500">{formatVND(order.amount * 0.1)}</td>
                                                            <td className="px-8 py-5 text-right text-xs text-white/20">
                                                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-8 py-16 text-center text-white/30 text-xs italic">
                                                            Chưa có bất kỳ giao dịch mua hàng nào trên nền tảng.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. TAB WITHDRAWALS (DUYỆT RÚT TIỀN) */}
                        {activeTab === 'withdrawals' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* Header stats inside the tab for professional layout */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Chờ giải quyết</p>
                                            <p className="text-lg font-bold text-yellow-500 mt-0.5">{pendingCount} yêu cầu</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Đã hoàn tất</p>
                                            <p className="text-lg font-bold text-green-500 mt-0.5">
                                                {withdrawals.filter(w => w.status === 'SUCCESS').length} yêu cầu
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                            <X size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Đã từ chối</p>
                                            <p className="text-lg font-bold text-red-500 mt-0.5">
                                                {withdrawals.filter(w => w.status === 'REJECTED').length} yêu cầu
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 font-mono font-bold text-sm">
                                            VNĐ
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Tổng tiền chờ duyệt</p>
                                            <p className="text-lg font-bold text-white mt-0.5">
                                                {formatVND(pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters and Search row */}
                                <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                                    <div className="flex bg-white/5 p-1 rounded-xl w-fit">
                                        {(['ALL', 'PENDING', 'SUCCESS', 'REJECTED'] as const).map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setWithdrawalFilters(filter)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${withdrawalFilters === filter ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                                            >
                                                {filter === 'ALL' && 'Tất cả'}
                                                {filter === 'PENDING' && 'Chờ duyệt'}
                                                {filter === 'SUCCESS' && 'Đã thanh toán'}
                                                {filter === 'REJECTED' && 'Từ chối'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full md:w-80 group">
                                        <input
                                            type="text"
                                            placeholder="Tìm theo chủ tài khoản, số TK, người dùng..."
                                            value={withdrawalSearch}
                                            onChange={(e) => setWithdrawalSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-red-500 transition-all"
                                        />
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-500 transition-colors" size={14} />
                                    </div>
                                </div>

                                {/* Withdrawals Table Grid */}
                                <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                                    <th className="px-8 py-5">Creator</th>
                                                    <th className="px-8 py-5">Tài khoản đích</th>
                                                    <th className="px-8 py-5 text-right">Số tiền rút</th>
                                                    <th className="px-8 py-5">Phương thức</th>
                                                    <th className="px-8 py-5">Ngày tạo</th>
                                                    <th className="px-8 py-5">Trạng thái</th>
                                                    <th className="px-8 py-5 text-right">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.02]">
                                                {filteredWithdrawals.length > 0 ? (
                                                    filteredWithdrawals.map((withdrawal) => (
                                                        <tr key={withdrawal._id} className="hover:bg-white/[0.01] transition-colors group">
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={withdrawal.userId?.avatar || '/assets/img/avata.jpg'} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt="" />
                                                                    <div>
                                                                        <span className="text-sm font-bold block">{withdrawal.userId?.name || 'Creator Ẩn Danh'}</span>
                                                                        <span className="text-[10px] text-white/35 block mt-0.5">{withdrawal.userId?.email || 'Chưa định danh'}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="text-xs">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="bg-white/5 border border-white/10 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                                                                            {withdrawal.bankName}
                                                                        </span>
                                                                        <span className="font-bold text-white/80">{withdrawal.bankAccount}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-white/40 block mt-1 uppercase tracking-wider">
                                                                        {withdrawal.bankAccountHolder}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <span className="text-sm font-bold text-green-500 font-mono">
                                                                    {formatVND(withdrawal.amount)}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                {withdrawal.status !== 'PENDING' ? (
                                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${withdrawal.method === 'AUTOMATIC' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                                                        {withdrawal.method === 'AUTOMATIC' ? 'Tự động' : 'Thủ công'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-5 text-xs text-white/30">
                                                                {new Date(withdrawal.createdAt).toLocaleDateString('vi-VN')}<br />
                                                                <span className="text-[10px] text-white/15">
                                                                    {new Date(withdrawal.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                {withdrawal.status === 'PENDING' && (
                                                                    <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full relative">
                                                                        <span className="w-1 h-1 bg-yellow-500 rounded-full animate-ping"></span>
                                                                        Chờ duyệt
                                                                    </span>
                                                                )}
                                                                {withdrawal.status === 'SUCCESS' && (
                                                                    <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                                        Thành công
                                                                    </span>
                                                                )}
                                                                {withdrawal.status === 'REJECTED' && (
                                                                    <span 
                                                                        title={withdrawal.rejectReason} 
                                                                        className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-help"
                                                                    >
                                                                        Bị từ chối
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <button
                                                                    onClick={() => { 
                                                                        setSelectedWithdrawal(withdrawal); 
                                                                        setShowWithdrawalModal(true); 
                                                                        setPaymentStep('details');
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300"
                                                                >
                                                                    Chi tiết
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-8 py-16 text-center text-white/30 text-xs italic">
                                                            Không có yêu cầu rút tiền nào trùng khớp với bộ lọc.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* WITHDRAWAL DETAILS MODAL */}
            {showWithdrawalModal && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#111] border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative">
                        
                        {/* Close button */}
                        <button 
                            onClick={() => {
                                if (isProcessingAuto) return;
                                setShowWithdrawalModal(false);
                                setSelectedWithdrawal(null);
                                setIsRejecting(false);
                                setRejectReason('');
                                setPaymentStep('details');
                                setCopiedField(null);
                            }}
                            disabled={isProcessingAuto}
                            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                        >
                            <X size={18} />
                        </button>

                        {/* Automatic Payout Simulator Interface Override */}
                        {isProcessingAuto ? (
                            <div className="p-10 flex flex-col items-center justify-center min-h-[480px] bg-black font-mono">
                                <Loader2 size={40} className="text-red-500 animate-spin mb-6" />
                                <h3 className="text-lg font-bold text-red-500 uppercase tracking-widest mb-2 animate-pulse">GATEWAY CHI TỰ ĐỘNG</h3>
                                <p className="text-white/40 text-xs mb-8">ĐANG KẾT NỐI HỆ THỐNG GIẢI NGÂN NAPAS247</p>

                                <div className="w-full bg-[#090909] border border-white/5 rounded-2xl p-6 h-64 overflow-y-auto custom-scrollbar flex flex-col gap-2.5 text-left font-mono">
                                    {autoTerminalLogs.map((log, index) => (
                                        <div key={index} className="text-[11px] leading-relaxed animate-in slide-in-from-left duration-200">
                                            {log}
                                        </div>
                                    ))}
                                    <div ref={terminalEndRef} />
                                </div>
                            </div>
                        ) : (
                            /* Standard Modal Layout */
                            <div className="flex flex-col">
                                <div className="p-8 border-b border-white/5 bg-[#141414]">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                                        {paymentStep === 'qr_pay' ? 'QUÉT MÃ VÀ CHUYỂN KHOẢN THỰC TẾ' : 'CHI TIẾT YÊU CẦU'}
                                    </p>
                                    <h3 className="text-xl font-bold italic uppercase flex items-center gap-2">
                                        {paymentStep === 'qr_pay' ? 'Xác nhận chuyển khoản VietQR' : 'Rút tiền từ ví Creator'}
                                    </h3>
                                </div>

                                {paymentStep === 'qr_pay' ? (
                                    /* Premium VietQR Payment View */
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {/* QR display card */}
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-xl w-64 border border-white/10 group relative overflow-hidden">
                                                <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    <Smartphone size={8} /> SCAN REAL VIETQR
                                                </div>
                                                <img 
                                                    src={`https://img.vietqr.io/image/${getVietQrBankCode(selectedWithdrawal.bankName)}-${selectedWithdrawal.bankAccount}-compact.png?amount=${selectedWithdrawal.amount}&addInfo=${encodeURIComponent('MyTube Rut tien ' + selectedWithdrawal._id.slice(-6).toUpperCase())}&accountName=${encodeURIComponent(selectedWithdrawal.bankAccountHolder)}`}
                                                    className="w-48 h-48 object-contain my-3"
                                                    alt="VietQR code" 
                                                />
                                                <p className="text-[10px] text-black/55 text-center font-bold leading-relaxed px-1">
                                                    Quét mã bằng app ngân hàng hỗ trợ Napas247 để chuyển tiền thật 100%
                                                </p>
                                            </div>

                                            {/* SePay webhook active status indicator */}
                                            <div className="w-64 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col items-center justify-center space-y-1.5 shadow-md">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    <span>SePay Auto-Detection Active</span>
                                                </div>
                                                <p className="text-[8.5px] text-white/50 text-center leading-normal font-medium">
                                                    Hệ thống đang tự động giám sát giao dịch tài khoản MB Bank. Trạng thái giải ngân sẽ tự động cập nhật khi chuyển khoản thành công.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bank transfer info & copy buttons */}
                                        <div className="space-y-6">
                                            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-wider mb-2">Thông tin tài khoản nhận</p>
                                                
                                                <div className="space-y-3.5">
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase">Ngân hàng thụ hưởng</p>
                                                            <p className="font-bold text-white text-xs mt-1">{selectedWithdrawal.bankName}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleCopyToClipboard(selectedWithdrawal.bankName, 'bankName')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                            title="Sao chép"
                                                        >
                                                            {copiedField === 'bankName' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase">Số tài khoản nhận</p>
                                                            <p className="font-mono font-bold text-white text-sm mt-1">{selectedWithdrawal.bankAccount}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleCopyToClipboard(selectedWithdrawal.bankAccount, 'bankAccount')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                            title="Sao chép"
                                                        >
                                                            {copiedField === 'bankAccount' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase">Tên chủ tài khoản</p>
                                                            <p className="font-bold text-white text-xs mt-1 uppercase">{selectedWithdrawal.bankAccountHolder}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleCopyToClipboard(selectedWithdrawal.bankAccountHolder, 'bankAccountHolder')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                            title="Sao chép"
                                                        >
                                                            {copiedField === 'bankAccountHolder' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase">Số tiền chuyển</p>
                                                            <p className="font-mono font-black text-green-500 text-sm mt-1">{formatVND(selectedWithdrawal.amount)}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleCopyToClipboard(selectedWithdrawal.amount.toString(), 'amount')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                            title="Sao chép"
                                                        >
                                                            {copiedField === 'amount' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase">Nội dung chuyển khoản</p>
                                                            <p className="font-mono font-bold text-red-500 text-xs mt-1 uppercase">
                                                                MyTube Rut tien {selectedWithdrawal._id.slice(-6).toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleCopyToClipboard(`MyTube Rut tien ${selectedWithdrawal._id.slice(-6).toUpperCase()}`, 'addInfo')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                            title="Sao chép"
                                                        >
                                                            {copiedField === 'addInfo' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                {selectedWithdrawal.status === 'SUCCESS' ? (
                                                    <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 py-3.5 px-4 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-950/20 animate-fade-in">
                                                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                                                            <CheckCircle2 size={16} className="text-green-500 animate-pulse" />
                                                            <span>Giải ngân thành công!</span>
                                                        </div>
                                                        <p className="text-[9.5px] text-white/50 text-center leading-normal">
                                                            Hệ thống đã nhận diện tín hiệu thanh toán thực tế và duyệt tự động.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApproveManual(selectedWithdrawal._id)}
                                                        disabled={isSubmittingAction}
                                                        className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 group disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={14} className="group-hover:scale-110 transition-transform" />
                                                        <span>Xác nhận đã chuyển khoản thành công</span>
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => setPaymentStep('details')}
                                                    className="w-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    Quay lại
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Details View */
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {/* Creator and bank details column */}
                                        <div className="space-y-6">
                                            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                                                <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-3">Tài khoản yêu cầu</p>
                                                <div className="flex items-center gap-3">
                                                    <img src={selectedWithdrawal.userId?.avatar || '/assets/img/avata.jpg'} className="w-10 h-10 rounded-full border border-white/10 object-cover" alt="" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{selectedWithdrawal.userId?.name || 'Creator Ẩn Danh'}</p>
                                                        <p className="text-xs text-white/40">{selectedWithdrawal.userId?.email || 'no-email@mytube.com'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
                                                <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Thông tin chuyển khoản</p>
                                                
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                                                    <div>
                                                        <p className="text-white/40 text-[10px]">Ngân hàng thụ hưởng</p>
                                                        <p className="font-bold text-white mt-1.5 flex items-center gap-1.5">
                                                            <span className="bg-white/5 border border-white/10 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                                                {selectedWithdrawal.bankName}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-white/40 text-[10px]">Số tài khoản nhận</p>
                                                        <p className="font-mono font-bold text-white text-sm mt-1.5 select-all">
                                                            {selectedWithdrawal.bankAccount}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2 border-t border-white/5 pt-3">
                                                        <p className="text-white/40 text-[10px]">Tên chủ tài khoản thụ hưởng</p>
                                                        <p className="font-bold text-white text-sm mt-1.5 uppercase select-all">
                                                            {selectedWithdrawal.bankAccountHolder}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2 border-t border-white/5 pt-3">
                                                        <p className="text-white/40 text-[10px]">Số tiền yêu cầu giải ngân</p>
                                                        <p className="font-mono font-black text-green-500 text-lg mt-1 select-all">
                                                            {formatVND(selectedWithdrawal.amount)}
                                                        </p>
                                                        <span className="text-[10px] text-white/20 block mt-1">
                                                            (Hệ thống sẽ trừ tương ứng vào số dư khả dụng của Creator)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                            {/* Column 2: Actions & Status */}
                                            <div className="space-y-6 flex flex-col justify-between">
                                                <div className="space-y-6">
                                                    {/* Status Card */}
                                                    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-xs space-y-3">
                                                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">Trạng thái yêu cầu</p>
                                                        <div className="flex justify-between">
                                                            <span className="text-white/40">Thời gian tạo:</span>
                                                            <span className="text-white/80">{new Date(selectedWithdrawal.createdAt).toLocaleString('vi-VN')}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-white/40">Trạng thái hiện tại:</span>
                                                            <span className={`font-bold ${selectedWithdrawal.status === 'PENDING' ? 'text-yellow-500' : selectedWithdrawal.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {selectedWithdrawal.status === 'PENDING' && 'Chờ xử lý'}
                                                                {selectedWithdrawal.status === 'SUCCESS' && 'Giải ngân thành công'}
                                                                {selectedWithdrawal.status === 'REJECTED' && 'Đã từ chối'}
                                                            </span>
                                                        </div>
                                                        {selectedWithdrawal.status === 'REJECTED' && selectedWithdrawal.rejectReason && (
                                                            <div className="border-t border-white/5 pt-2 mt-2">
                                                                <p className="text-white/40 text-[9px] uppercase">Lý do từ chối:</p>
                                                                <p className="text-red-400 mt-1 italic text-xs">{selectedWithdrawal.rejectReason}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Operations Panel */}
                                                    {selectedWithdrawal.status === 'PENDING' && (
                                                        <div className="space-y-4">
                                                            <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Hành động xử lý</p>
                                                            
                                                            {isRejecting ? (
                                                                <form onSubmit={handleRejectWithdrawal} className="space-y-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl animate-in slide-in-from-top duration-300">
                                                                    <div>
                                                                        <label className="text-white/40 text-[10px] uppercase font-bold">Lý do từ chối</label>
                                                                        <textarea
                                                                            value={rejectReason}
                                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                                            placeholder="Nhập lý do từ chối chi tiết..."
                                                                            className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-xs mt-2 focus:border-red-600 focus:outline-none h-24 resize-none"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="submit"
                                                                            disabled={isSubmittingAction}
                                                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                                                                        >
                                                                            {isSubmittingAction ? 'Đang gửi...' : 'Xác nhận từ chối'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setIsRejecting(false);
                                                                                setRejectReason('');
                                                                            }}
                                                                            className="px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs py-2 rounded-xl transition-colors"
                                                                        >
                                                                            Hủy
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <button
                                                                        onClick={() => {
                                                                            setPaymentStep('qr_pay');
                                                                        }}
                                                                        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 group"
                                                                    >
                                                                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                                        <span>Xác nhận chuyển khoản</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => setIsRejecting(true)}
                                                                        className="w-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
                                                                    >
                                                                        Từ chối yêu cầu
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {selectedWithdrawal.status !== 'PENDING' && (
                                                        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-center space-y-2">
                                                            <CheckCircle2 size={32} className="text-green-500 mx-auto" />
                                                            <p className="font-bold text-white text-xs">Yêu cầu đã được xử lý</p>
                                                            <p className="text-white/40 text-[9px]">Giao dịch này không còn ở trạng thái chờ duyệt.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setShowWithdrawalModal(false);
                                                        setSelectedWithdrawal(null);
                                                        setIsRejecting(false);
                                                        setRejectReason('');
                                                        setPaymentStep('details');
                                                        setCopiedField(null);
                                                    }}
                                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all w-full mt-auto"
                                                >
                                                    Đóng chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}
