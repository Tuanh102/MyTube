"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, 
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
    Copy,
    Sun,
    Moon,
    Laptop,
    Clock,
    Settings,
    BarChart3,
    ShieldAlert,
    Sparkles,
    Megaphone,
    Coins,
    Trash2,
    PlayCircle,
    Cloud,
    BadgeCheck,
    Building2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Server, Database, Radio, MessageSquare, Wifi, Eye, Edit3, Lock, Unlock, Key } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import ClockWidget from '@/components/ClockWidget';

const getAdDisplayType = (slotId: string) => {
    if (!slotId) return 'Không xác định';
    if (slotId.startsWith('video_preroll')) return 'Pre-roll Video';
    if (slotId.startsWith('suggested_sidebar')) return 'Sidebar liên kết';
    if (slotId.startsWith('homepage_main') || slotId.startsWith('homepage_sub')) return 'Banner chính';
    return slotId;
};

const isPendingAd = (ad: any) => {
    return ad.paymentStatus === 'PENDING' || 
           ad.paymentStatus === 'PENDING_PAYMENT' || 
           ad.status === 'PENDING' || 
           ad.status === 'PENDING_REVIEW' || 
           ad.status === 'PENDING_PAYMENT';
};

interface RadialProgressProps {
    percentage: number;
    title: string;
    subTitle: string;
    gradientId: string;
    fromColor: string;
    toColor: string;
    icon?: React.ReactNode;
    isGrowth?: boolean;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ 
    percentage, 
    title, 
    subTitle, 
    gradientId, 
    fromColor, 
    toColor,
    icon,
    isGrowth = false
}) => {
    const size = 130;
    const strokeWidth = 11;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // For growth, it might be negative or above 100, we cap the circle visual between 0 and 100
    const visualPercentage = Math.min(100, Math.max(0, Math.abs(percentage)));
    const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

    return (
        <div className="bg-white dark:bg-[#0c0c0c]/80 border border-rose-100 dark:border-red-950/20 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-red-500/35 hover:shadow-[0_10px_35px_rgba(244,63,94,0.08)] dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-500 group relative overflow-hidden text-center shadow-md shadow-rose-100/30 dark:shadow-none min-h-[320px]">
            {/* Soft decorative background glows */}
            <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-[0.03] dark:opacity-[0.07] blur-2xl pointer-events-none transition-opacity duration-550" style={{ backgroundColor: fromColor }}></div>
            <div className="absolute -left-10 -bottom-10 w-28 h-28 rounded-full opacity-[0.03] dark:opacity-[0.07] blur-2xl pointer-events-none transition-opacity duration-550" style={{ backgroundColor: toColor }}></div>
            
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-650 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
            
            <p className="text-zinc-400 dark:text-white/45 text-[11px] font-black uppercase tracking-widest mb-6">{title}</p>
            
            <div className="relative flex items-center justify-center mb-6" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_5px_rgba(239,68,68,0.1)] dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={fromColor} />
                            <stop offset="100%" stopColor={toColor} />
                        </linearGradient>
                    </defs>
                    <circle
                        className="text-slate-150 dark:text-zinc-900/65 stroke-current"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <circle
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black font-mono text-zinc-800 dark:text-white tracking-tight">
                        {isGrowth ? (percentage >= 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`) : `${percentage.toFixed(1)}%`}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-white/30 font-bold uppercase tracking-wider mt-0.5">Tỷ lệ</span>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-2.5 flex items-center justify-center gap-2 mt-2 shadow-inner">
                {icon}
                <span className="text-xs font-bold text-zinc-650 dark:text-white/60">{subTitle}</span>
            </div>
        </div>
    );
};

const CloudinaryDonut = ({ percentage, size = 150, strokeWidth = 14 }: { percentage: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.15)] dark:drop-shadow-[0_0_12px_rgba(59,130,246,0.25)]">
                <defs>
                    <linearGradient id="cloudinaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
                <circle
                    className="text-slate-150 dark:text-[#161616] stroke-current"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    stroke="url(#cloudinaryGrad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black font-mono text-zinc-800 dark:text-white tracking-tight">{percentage}%</span>
                <span className="text-[10px] text-zinc-400 dark:text-white/35 uppercase font-black tracking-widest mt-0.5">Sử dụng</span>
            </div>
        </div>
    );
};

export default function AdminPage() {
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

    const [admin, setAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [platformFeePercent, setPlatformFeePercent] = useState(10);
    
    // Smart search states
    const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
    const [smartSearchQuery, setSmartSearchQuery] = useState('');
    const [smartSearchResults, setSmartSearchResults] = useState<any>({
        users: [],
        videos: [],
        transactions: [],
        withdrawals: []
    });
    const [isSmartSearching, setIsSmartSearching] = useState(false);

    // Pending withdrawal amount calculator for partner list
    const getPendingWithdrawalAmount = (userId: string) => {
        if (!Array.isArray(withdrawals)) return 0;
        return withdrawals
            .filter(w => w.status === 'PENDING' && w.userId && (w.userId._id === userId || w.userId === userId))
            .reduce((sum, w) => sum + w.amount, 0);
    };
    
    // Chart type toggle
    const [chartDataType, setChartDataType] = useState<'revenue' | 'users' | 'traffic'>('revenue');
    
    // Real dynamic datasets
    const [usersList, setUsersList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showEditStaffModal, setShowEditStaffModal] = useState(false);
    const [staffName, setStaffName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffPassword, setStaffPassword] = useState('');
    const [staffError, setStaffError] = useState('');
    const [staffSuccess, setStaffSuccess] = useState('');
    const [isCreatingStaff, setIsCreatingStaff] = useState(false);
    const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isStaffDetailOpen, setIsStaffDetailOpen] = useState(false);
    const [editStaffName, setEditStaffName] = useState('');
    const [editStaffAvatar, setEditStaffAvatar] = useState('');
    const [editStaffPassword, setEditStaffPassword] = useState('');
    const [updateStaffError, setUpdateStaffError] = useState('');
    const [updateStaffSuccess, setUpdateStaffSuccess] = useState('');

    // Channel management
    const [allChannels, setAllChannels] = useState<any[]>([]);
    const [isChannelActionLoading, setIsChannelActionLoading] = useState<string | null>(null);

    // Ads states
    const [adsList, setAdsList] = useState<any[]>([]);
    const [globalAdEnabled, setGlobalAdEnabled] = useState(true);
    const [adSubTab, setAdSubTab] = useState<'review' | 'active' | 'revenue'>('review');
    const [adRevenueData, setAdRevenueData] = useState<any>(null);
    const [isAdSubmitting, setIsAdSubmitting] = useState(false);
    const [isRevenueLoading, setIsRevenueLoading] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [selectedAdSlot, setSelectedAdSlot] = useState<any>(null);
    
    const [adForm, setAdForm] = useState({
        title: '',
        type: 'pre-roll',
        videoUrl: '',
        clickUrl: '',
        bannerUrl: '',
        targetViews: 1000,
        costPerView: 500,
        totalBudget: 500000,
        ownerId: '',
        status: 'ACTIVE'
    });

    const [rejectAdReason, setRejectAdReason] = useState('');
    const [showRejectAdModal, setShowRejectAdModal] = useState(false);
    
    const [stats, setStats] = useState<any>({
        totalRevenue: 0,
        platformFee: 0,
        totalUsers: 0,
        totalVideos: 0,
        totalCreators: 0,
        adminBalance: 0,
        userGrowth: '0.0',
        retentionRate: '100.0',
        totalViews: 0,
        mapData: [] as any[]
    });

    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [isLoadingSystemStatus, setIsLoadingSystemStatus] = useState(false);
    
    // Transactions / Payments history
    const [transactions, setTransactions] = useState<any[]>([]);

    // Premium Packages states
    const [premiumPackages, setPremiumPackages] = useState<any[]>([]);
    const [showPkgModal, setShowPkgModal] = useState(false);
    const [pkgFormMode, setPkgFormMode] = useState<'create' | 'edit'>('create');
    const [pkgForm, setPkgForm] = useState({
        key: '',
        name: '',
        price: 0,
        durationDays: 30,
        description: ''
    });

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
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notificationTab, setNotificationTab] = useState<'all' | 'withdrawals'>('all');
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
        if (activeTab === 'ads') {
            fetchAds();
            fetchAdSettings();
            fetchAdRevenue();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'staff') {
            fetchStaff();
        } else if (activeTab === 'subscription') {
            fetchPremiumPackages();
        } else if (activeTab === 'analytics') {
            fetchSystemStatus();
        } else if (activeTab === 'channels') {
            fetchChannels();
        }
    }, [activeTab]);

    useEffect(() => {
        const adminData = sessionStorage.getItem('admin_token');
        if (!adminData || adminData === "undefined") {
            sessionStorage.removeItem('admin_token');
            router.push('/admin/login');
            return;
        }

        try {
            setAdmin(JSON.parse(adminData));
            fetchStats();
            fetchTransactions();
            fetchWithdrawals();
            fetchUsers();
            fetchStaff();
            fetchPremiumPackages();
        } catch (e) {
            sessionStorage.removeItem('admin_token');
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

    const fetchSystemStatus = async () => {
        setIsLoadingSystemStatus(true);
        try {
            const res = await fetch('/api/admin/system-status');
            const data = await res.json();
            if (res.ok) {
                setSystemStatus(data);
            }
        } catch (error) {
            console.error('Lỗi lấy trạng thái hệ thống:', error);
        } finally {
            setIsLoadingSystemStatus(false);
        }
    };

    useEffect(() => {
        if (!smartSearchQuery.trim()) {
            setSmartSearchResults({ users: [], videos: [], transactions: [], withdrawals: [] });
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setIsSmartSearching(true);
            try {
                const res = await fetch(`/api/admin/smart-search?q=${encodeURIComponent(smartSearchQuery)}`);
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

    const fetchNotifications = async () => {
        const adminData = sessionStorage.getItem('admin_token');
        if (!adminData || adminData === "undefined") return;
        try {
            const adminObj = JSON.parse(adminData);
            if (!adminObj || !adminObj._id) return;
            const res = await fetch(`/notifications?userId=${adminObj._id}`);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (err) {
            console.error('[FETCH NOTIFICATIONS ERROR]:', err);
        }
    };

    const handleMarkNotificationRead = async (notificationId: string) => {
        try {
            const res = await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST'
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.notification_id === notificationId ? { ...n, is_read: 1 } : n));
            }
        } catch (err) {
            console.error('[MARK READ ERROR]:', err);
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        const adminData = sessionStorage.getItem('admin_token');
        if (!adminData || adminData === "undefined") return;
        try {
            const adminObj = JSON.parse(adminData);
            if (!adminObj || !adminObj._id) return;
            const res = await fetch(`/notifications/read-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: adminObj._id })
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            }
        } catch (err) {
            console.error('[MARK ALL READ ERROR]:', err);
        }
    };

    useEffect(() => {
        if (!admin || !admin._id) return;
        fetchNotifications();
        const intervalId = setInterval(() => {
            fetchNotifications();
            fetchWithdrawals();
            fetchTransactions();
            fetchStats();
        }, 10000);
        return () => clearInterval(intervalId);
    }, [admin]);

    const handleLogout = () => {
        sessionStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setUsersList(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserAction = async (userId: string, action: 'lock' | 'unlock' | 'delete') => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/${action}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                alert(action === 'lock' ? 'Đã khóa tài khoản thành công!' : action === 'unlock' ? 'Đã mở khóa tài khoản thành công!' : 'Đã xóa tài khoản thành công!');
                fetchUsers();
            } else {
                alert(data.message || 'Lỗi khi thực hiện thao tác');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối đến máy chủ');
        }
    };

    const fetchPremiumPackages = async () => {
        try {
            const res = await fetch('/api/admin/premium-packages');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setPremiumPackages(data);
            }
        } catch (err) {
            console.error('Error fetching premium packages:', err);
        }
    };

    const handleOpenCreatePkg = () => {
        setPkgFormMode('create');
        setPkgForm({
            key: '',
            name: '',
            price: 0,
            durationDays: 30,
            description: ''
        });
        setShowPkgModal(true);
    };

    const handleOpenEditPkg = (pkg: any) => {
        setPkgFormMode('edit');
        setPkgForm({
            key: pkg.key,
            name: pkg.name,
            price: pkg.price,
            durationDays: pkg.durationDays,
            description: pkg.description || ''
        });
        setShowPkgModal(true);
    };

    const handleSavePkg = async () => {
        if (!pkgForm.key || !pkgForm.name || pkgForm.price <= 0 || pkgForm.durationDays <= 0) {
            alert('Vui lòng điền đầy đủ và chính xác thông tin gói!');
            return;
        }

        try {
            const url = pkgFormMode === 'create' 
                ? '/api/admin/premium-packages' 
                : `/api/admin/premium-packages/${pkgForm.key}`;
            const method = pkgFormMode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pkgForm)
            });

            if (res.ok) {
                alert(pkgFormMode === 'create' ? 'Đã thêm gói hội viên mới thành công!' : 'Đã cập nhật gói hội viên thành công!');
                setShowPkgModal(false);
                fetchPremiumPackages();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Lỗi khi lưu gói hội viên');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối máy chủ');
        }
    };

    const handleDeletePkg = async (key: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa gói hội viên này không?')) return;

        try {
            const res = await fetch(`/api/admin/premium-packages/${key}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Đã xóa gói hội viên thành công!');
                fetchPremiumPackages();
            } else {
                alert('Lỗi khi xóa gói hội viên');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối máy chủ');
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/admin/staff');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setStaffList(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setStaffError('');
        setStaffSuccess('');
        setIsCreatingStaff(true);
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: staffName,
                    email: staffEmail,
                    password: staffPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStaffSuccess('Cấp tài khoản Staff thành công!');
                setStaffName('');
                setStaffEmail('');
                setStaffPassword('');
                fetchStaff();
                setTimeout(() => {
                    setShowStaffModal(false);
                    setStaffSuccess('');
                }, 1500);
            } else {
                setStaffError(data.error || 'Có lỗi xảy ra khi tạo Staff');
            }
        } catch (err) {
            setStaffError('Lỗi kết nối tới máy chủ');
        } finally {
            setIsCreatingStaff(false);
        }
    };

    const handleViewStaff = (st: any) => {
        setSelectedStaff(st);
        setIsStaffDetailOpen(true);
    };

    const handleEditStaffClick = (st: any) => {
        setSelectedStaff(st);
        setEditStaffName(st.name || '');
        setEditStaffAvatar(st.avatar_url || '');
        setEditStaffPassword('');
        setUpdateStaffError('');
        setUpdateStaffSuccess('');
        setShowEditStaffModal(true);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingFile(true);
        setUpdateStaffError('');
        setUpdateStaffSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload-avatar', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setEditStaffAvatar(data.url);
                setUpdateStaffSuccess('Tải ảnh đại diện lên thành công!');
            } else {
                setUpdateStaffError(data.error || 'Lỗi khi tải ảnh đại diện');
            }
        } catch (err) {
            setUpdateStaffError('Lỗi kết nối máy chủ');
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;

        setIsUpdatingStaff(true);
        setUpdateStaffError('');
        setUpdateStaffSuccess('');

        try {
            // 1. Update name and avatar if they changed
            const nameChanged = editStaffName !== selectedStaff.name;
            const avatarChanged = editStaffAvatar !== selectedStaff.avatar_url;

            if (nameChanged || avatarChanged) {
                const res = await fetch(`/api/admin/staff/${selectedStaff._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: editStaffName,
                        avatar_url: editStaffAvatar
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    setUpdateStaffError(data.error || 'Lỗi khi cập nhật thông tin nhân viên');
                    setIsUpdatingStaff(false);
                    return;
                }
            }

            // 2. Change password if password field is filled
            if (editStaffPassword) {
                const res = await fetch(`/api/admin/staff/${selectedStaff._id}/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        password: editStaffPassword
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    setUpdateStaffError(data.error || 'Lỗi khi đổi mật khẩu');
                    setIsUpdatingStaff(false);
                    return;
                }
            }

            setUpdateStaffSuccess('Cập nhật nhân viên thành công!');
            fetchStaff();
            setTimeout(() => {
                setShowEditStaffModal(false);
                setUpdateStaffSuccess('');
            }, 1500);
        } catch (err) {
            setUpdateStaffError('Lỗi kết nối đến máy chủ');
        } finally {
            setIsUpdatingStaff(false);
        }
    };

    const handleToggleLockStaff = async (st: any) => {
        const action = st.isActive ? 'lock' : 'unlock';
        const confirmMsg = st.isActive 
            ? `Bạn có chắc chắn muốn KHÓA tài khoản của nhân viên ${st.name}?`
            : `Bạn có muốn MỞ KHÓA tài khoản cho nhân viên ${st.name}?`;

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/admin/staff/${st._id}/${action}`, {
                method: 'POST'
            });
            if (res.ok) {
                alert(`Đã ${st.isActive ? 'khóa' : 'mở khóa'} tài khoản nhân viên thành công!`);
                fetchStaff();
            } else {
                const data = await res.json();
                alert(data.error || `Lỗi khi ${st.isActive ? 'khóa' : 'mở khóa'} nhân viên`);
            }
        } catch (err) {
            alert('Lỗi kết nối máy chủ');
        }
    };

    const handleDeleteStaffClick = async (st: any) => {
        if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản của nhân viên ${st.name}? Thao tác này không thể hoàn tác.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/staff/${st._id}/delete`, {
                method: 'POST'
            });
            if (res.ok) {
                alert('Đã xóa tài khoản nhân viên thành công!');
                fetchStaff();
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi khi xóa nhân viên');
            }
        } catch (err) {
            alert('Lỗi kết nối máy chủ');
        }
    };

    const fetchChannels = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/channels');
            if (res.ok) {
                const data = await res.json();
                setAllChannels(data);
            }
        } catch (err) {
            console.error('Lỗi lấy kênh:', err);
        }
    };

    const handleAdminVerifyChannel = async (channelId: string, action: 'verify' | 'unverify') => {
        setIsChannelActionLoading(channelId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/channels/${channelId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_verified: action === 'verify' })
            });
            if (res.ok) {
                fetchChannels();
                alert(action === 'verify' ? 'Đã cấp tích xanh thành công!' : 'Đã thu hồi tích xanh!');
            }
        } catch (err) {
            alert('Lỗi kết nối');
        } finally {
            setIsChannelActionLoading(null);
        }
    };

    const handleAdminPenalizeChannel = async (channelId: string, action: 'STRIKE' | 'BAN_7DAYS' | 'BAN_30DAYS' | 'BAN_FOREVER') => {
        const labels: Record<string, string> = {
            STRIKE: 'Xác nhận đánh 1 gậy cảnh cáo? (3 gậy = khóa vĩnh viễn)',
            BAN_7DAYS: 'Xác nhận khóa kênh 7 ngày?',
            BAN_30DAYS: 'Xác nhận khóa kênh 30 ngày?',
            BAN_FOREVER: 'KHÓA VĨNH VIỄN kênh này? Không thể hoàn tác!'
        };
        if (!window.confirm(labels[action])) return;
        setIsChannelActionLoading(channelId);
        try {
            const res = await fetch(`http://127.0.0.1:5000/channels/${channelId}/penalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                fetchChannels();
                alert('Đã xử phạt thành công! Creator đã được thông báo qua hệ thống.');
            }
        } catch (err) {
            alert('Lỗi kết nối');
        } finally {
            setIsChannelActionLoading(null);
        }
    };

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/ads');
            const data = await res.json();
            if (res.ok) {
                const ads = Array.isArray(data) ? data : (data.ads || []);
                setAdsList(ads);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAdSettings = async () => {
        try {
            const res = await fetch('/api/ads/settings');
            const data = await res.json();
            if (res.ok && data) {
                setGlobalAdEnabled(data.globalAdEnabled);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAdRevenue = async () => {
        setIsRevenueLoading(true);
        try {
            const res = await fetch('/api/ads/revenue');
            const data = await res.json();
            if (res.ok) {
                setAdRevenueData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsRevenueLoading(false);
        }
    };

    const handleToggleGlobalAds = async (enabled: boolean) => {
        try {
            const res = await fetch('/api/ads/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ globalAdEnabled: enabled })
            });
            if (res.ok) {
                setGlobalAdEnabled(enabled);
                alert(`✨ Đã ${enabled ? 'BẬT' : 'TẮT'} quảng cáo toàn hệ thống thành công!`);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối khi bật/tắt quảng cáo');
        }
    };

    const handleSaveAd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdSubmitting(true);
        try {
            const mediaUrl = adForm.type === 'pre-roll' ? adForm.videoUrl : adForm.bannerUrl;
            const linkUrl = adForm.clickUrl;

            if (!mediaUrl || !mediaUrl.trim()) {
                alert('Vui lòng nhập Đường dẫn Media (Video hoặc Banner)!');
                setIsAdSubmitting(false);
                return;
            }
            if (!linkUrl || !linkUrl.trim()) {
                alert('Vui lòng nhập Đường dẫn click!');
                setIsAdSubmitting(false);
                return;
            }

            const payload: any = {
                title: adForm.title,
                mediaUrl: mediaUrl.trim(),
                linkUrl: linkUrl.trim(),
                status: adForm.status,
                isActive: adForm.status === 'ACTIVE',
                targetViews: adForm.targetViews,
                costPerView: adForm.costPerView,
                totalBudget: adForm.totalBudget,
                advertiserId: adForm.ownerId || admin?._id || '',
                advertiserName: 'Admin',
                paymentStatus: 'APPROVED'
            };

            if (editorMode === 'create') {
                const prefix = adForm.type === 'pre-roll' 
                    ? 'video_preroll' 
                    : adForm.type === 'sidebar' 
                        ? 'suggested_sidebar' 
                        : 'homepage_main';
                payload.slotId = prefix;
            }

            const url = editorMode === 'create' ? '/api/ads' : `/api/ads/${selectedAdSlot._id}`;
            const method = editorMode === 'create' ? 'POST' : 'PUT';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`✨ ${editorMode === 'create' ? 'Tạo' : 'Cập nhật'} quảng cáo thành công!`);
                setShowAdModal(false);
                fetchAds();
                fetchAdRevenue();
            } else {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra khi lưu quảng cáo.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối máy chủ.');
        } finally {
            setIsAdSubmitting(false);
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm('⚠️ Bạn có chắc chắn muốn XÓA quảng cáo này?')) return;
        try {
            const res = await fetch(`/api/ads/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Đã xóa quảng cáo thành công!');
                fetchAds();
                fetchAdRevenue();
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối khi xóa.');
        }
    };

    const handleVerifyAdPayment = async (slotId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch(`/api/ads/${slotId}/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: status })
            });
            if (res.ok) {
                alert(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} thanh toán thành công!`);
                fetchAds();
                fetchAdRevenue();
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối.');
        }
    };

    const handleVerifyAdContent = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !rejectAdReason.trim()) {
            alert('Vui lòng nhập lý do từ chối.');
            return;
        }
        try {
            const res = await fetch(`/api/ads/${selectedAdSlot._id}/verify-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    rejectReason: action === 'reject' ? rejectAdReason.trim() : undefined
                })
            });
            if (res.ok) {
                alert(`Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} nội dung quảng cáo thành công!`);
                setShowRejectAdModal(false);
                setRejectAdReason('');
                fetchAds();
                fetchAdRevenue();
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối.');
        }
    };

    const getPastDates = () => {
        const dates = [];
        for (let i = 9; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }));
        }
        return dates;
    };

    const getChartData = () => {
        if (stats && stats.chartData) {
            if (chartDataType === 'revenue') {
                return stats.chartData.revenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            } else if (chartDataType === 'users') {
                return stats.chartData.users || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            } else {
                return stats.chartData.traffic || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
        }
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Calculate pending count
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');
    const pendingCount = pendingWithdrawals.length;
    const unreadNotificationsCount = notifications.filter(n => n.is_read === 0).length;

    // Handle Manual approval
    const [isCheckingManual, setIsCheckingManual] = useState(false);
    const handleApproveManual = async (withdrawalId: string) => {
        setIsSubmittingAction(true);
        try {
            // Check status on the server first to ensure they didn't skip simulator
            const checkRes = await fetch(`/api/admin/withdrawals/${withdrawalId}`);
            if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.status === 'SUCCESS') {
                    alert('✨ Hệ thống đã tự động ghi nhận thanh toán thành công!\n\nKhông cần duyệt lại.');
                    setShowWithdrawalModal(false);
                    setSelectedWithdrawal(null);
                    fetchWithdrawals();
                    fetchStats();
                    fetchTransactions();
                    setIsSubmittingAction(false);
                    return;
                }

                if (checkData.status !== 'SUCCESS') {
                    const confirmManual = confirm(
                        '⚠️ HỆ THỐNG CHƯA NHẬN ĐƯỢC TÍN HIỆU THANH TOÁN TỰ ĐỘNG (Giao dịch đang ở trạng thái PENDING)!\n\n' +
                        'Nếu bạn ĐÃ CHUYỂN TIỀN THỰC TẾ thành công bằng tay từ tài khoản ngân hàng của bạn và muốn Ép buộc Duyệt thủ công giao dịch này, hãy bấm OK.\n\n' +
                        'Lưu ý: Thao tác này sẽ trừ số dư của Creator, giảm số dư ví Admin và cập nhật trạng thái yêu cầu rút tiền thành SUCCESS.'
                    );
                    if (!confirmManual) {
                        setIsSubmittingAction(false);
                        return;
                    }

                    // Proceed with MANUAL approval bypass
                    const res = await fetch('/api/admin/withdrawals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'approve',
                            id: withdrawalId,
                            method: 'MANUAL'
                        })
                    });

                    if (res.ok) {
                        alert('Duyệt chi thủ công (Bypass) thành công!');
                        setShowWithdrawalModal(false);
                        setSelectedWithdrawal(null);
                        fetchWithdrawals();
                        fetchStats();
                        fetchTransactions();
                    } else {
                        const data = await res.json();
                        alert(data.error || 'Có lỗi xảy ra khi duyệt rút tiền.');
                    }
                    setIsSubmittingAction(false);
                    return;
                }
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
            (w.userId && w.userId.username && w.userId.username.toLowerCase().includes(withdrawalSearch.toLowerCase())) ||
            (w.userId && w.userId.email.toLowerCase().includes(withdrawalSearch.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (!admin) return (<div className="min-h-screen bg-rose-50/20 dark:bg-black transition-colors duration-300"></div>);

    return (
        <div className="min-h-screen bg-rose-50/20 dark:bg-[#020202] text-zinc-800 dark:text-zinc-100 flex font-sans selection:bg-red-650 selection:text-white transition-colors duration-300 relative overflow-hidden">
            {/* Crimson-onyx radial glow for Admin panel */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.04),rgba(0,0,0,0)_75%)] pointer-events-none z-0 block dark:hidden"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.12),rgba(0,0,0,0)_75%)] pointer-events-none z-0 hidden dark:block"></div>

            {/* Sidebar Admin */}
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
                            <span className="text-[10px] text-red-500 font-bold ml-1.5 uppercase bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 relative top-[-1px]">ADMIN</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-3.5 space-y-4 mt-6 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                    {/* Group 1: Giám sát & Thống kê */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Giám sát & Thống kê
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
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'analytics' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <BarChart3 size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Phân tích hệ thống</span>
                        </button>
                    </div>

                    {/* Group 2: Vận hành Hệ thống */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Vận hành Hệ thống
                        </div>
                        <button 
                            onClick={() => setActiveTab('videos')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'videos' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Video size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Quản lý Video</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'users' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Users size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Quản lý Thành viên</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('staff')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'staff' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <ShieldAlert size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Quản lý Nhân viên</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('channels')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'channels' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Building2 size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Quản lý Kênh</span>
                        </button>
                    </div>

                    {/* Group 3: Tài chính & Dịch vụ */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Tài chính & Dịch vụ
                        </div>
                        <button 
                            onClick={() => setActiveTab('finance')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'finance' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <CreditCard size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Giao dịch mua hàng</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('withdrawals')}
                            className={`w-full flex items-center justify-center group-hover:justify-between px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm relative ${
                                activeTab === 'withdrawals' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <div className="flex items-center justify-center group-hover:justify-start">
                                <DollarSign size={18} className="flex-shrink-0" />
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Duyệt rút tiền</span>
                            </div>
                            {pendingCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 group-hover:static bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce transition-all duration-300">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('subscription')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'subscription' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Sparkles size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Gói hội viên</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('ads')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'ads' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Megaphone size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Quản lý Quảng cáo</span>
                        </button>
                    </div>

                    {/* Group 4: Hệ thống */}
                    <div className="space-y-1">
                        <div className="px-3.5 mb-2 text-[10px] font-black uppercase tracking-wider text-red-500/60 transition-all opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">
                            Hệ thống
                        </div>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center justify-center group-hover:justify-start px-3.5 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                                activeTab === 'settings' 
                                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white shadow-md border border-red-500/20' 
                                    : 'text-zinc-500 dark:text-white/40 hover:text-red-650 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Settings size={18} className="flex-shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto group-hover:ml-4 transition-all duration-300 overflow-hidden">Cấu hình hệ thống</span>
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
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-rose-50/20 dark:bg-black/20 backdrop-blur-sm transition-colors duration-300 relative z-10">
                <header className="relative z-50 h-20 border-b border-rose-100 dark:border-red-950/10 flex items-center justify-between px-10 bg-white/80 dark:bg-[#090909]/80 backdrop-blur-md transition-colors duration-300">
                    {/* Search Form */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim(); if (q) router.push(`/admin/search?q=${encodeURIComponent(q)}`); }}
                        className="flex items-center gap-3 text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/60 transition-colors group"
                    >
                        <button type="submit" className="p-1.5 hover:text-red-500 transition-colors"><Search size={18} /></button>
                        <input
                            name="q"
                            type="text"
                            placeholder="Tìm kiếm thông minh AI..."
                            className="bg-transparent text-sm font-medium text-zinc-500 dark:text-white/40 placeholder:text-zinc-400 dark:placeholder:text-white/30 outline-none w-48 focus:w-64 transition-all duration-300 hidden md:block"
                        />
                    </form>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hệ thống an toàn</span>
                        </div>

                        {/* Real-time clock */}
                        <ClockWidget />

                        {/* Notifications Bell Section */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-white/60 hover:text-white transition-colors relative bg-white/5 rounded-full hover:bg-white/10"
                            >
                                <Bell size={18} />
                                {(unreadNotificationsCount + pendingCount) > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                                        {unreadNotificationsCount + pendingCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Container */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-zinc-100">
                                    {/* Tabs Selector */}
                                    <div className="flex border-b border-white/5 mb-3 gap-2">
                                        <button 
                                            onClick={() => setNotificationTab('all')}
                                            className={`pb-2 text-xs font-bold uppercase tracking-wider relative flex-1 text-center transition-colors cursor-pointer ${notificationTab === 'all' ? 'text-red-500 border-b-2 border-red-500 font-extrabold' : 'text-white/40 hover:text-white'}`}
                                        >
                                            Thông báo ({unreadNotificationsCount})
                                        </button>
                                        <button 
                                            onClick={() => setNotificationTab('withdrawals')}
                                            className={`pb-2 text-xs font-bold uppercase tracking-wider relative flex-1 text-center transition-colors cursor-pointer ${notificationTab === 'withdrawals' ? 'text-red-500 border-b-2 border-red-500 font-extrabold' : 'text-white/40 hover:text-white'}`}
                                        >
                                            Rút tiền ({pendingCount})
                                        </button>
                                    </div>

                                    {notificationTab === 'all' && (
                                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.03]">
                                            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Thông báo hệ thống</span>
                                            {unreadNotificationsCount > 0 && (
                                                <button 
                                                    onClick={handleMarkAllNotificationsRead}
                                                    className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider cursor-pointer"
                                                >
                                                    Đọc tất cả
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                        {notificationTab === 'all' ? (
                                            notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div 
                                                        key={notif.notification_id}
                                                        onClick={() => handleMarkNotificationRead(notif.notification_id)}
                                                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5 hover:bg-white/5 relative group ${notif.is_read === 0 ? 'bg-white/[0.02]' : ''}`}
                                                    >
                                                        {notif.is_read === 0 && (
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                        )}
                                                        <img 
                                                            src={notif.actor_avatar || '/assets/img/avata.jpg'} 
                                                            className="w-8 h-8 rounded-full border border-white/10 object-cover mt-0.5 flex-shrink-0" 
                                                            alt="" 
                                                        />
                                                        <div className="flex-1 text-xs pr-2">
                                                            <p className="font-bold text-white group-hover:text-red-500 transition-colors">
                                                                {notif.actor_name}
                                                            </p>
                                                            <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-[8px] text-white/25 mt-1 font-mono">
                                                                {new Date(notif.created_at).toLocaleDateString('vi-VN')} {new Date(notif.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-white/30 text-xs italic flex flex-col items-center gap-2">
                                                    <span>Không có thông báo mới!</span>
                                                </div>
                                            )
                                        ) : (
                                            pendingWithdrawals.length > 0 ? (
                                                pendingWithdrawals.map((withdrawal) => (
                                                    <div 
                                                        key={withdrawal._id} 
                                                        onClick={() => handleNotificationClick(withdrawal)}
                                                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group"
                                                    >
                                                        <img 
                                                            src={withdrawal.userId?.avatar || '/assets/img/avata.jpg'} 
                                                            className="w-8 h-8 rounded-full border border-white/10 object-cover mt-0.5 flex-shrink-0" 
                                                            alt="" 
                                                        />
                                                        <div className="flex-1 text-xs">
                                                            <p className="font-bold text-white group-hover:text-red-500 transition-colors">
                                                                {withdrawal.userId?.username || 'Creator Ẩn Danh'}
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
                                                <div className="py-8 text-center text-white/30 text-xs italic flex flex-col items-center gap-2">
                                                    <CheckCircle2 size={24} className="text-green-500 animate-bounce" />
                                                    <span>Không có yêu cầu chờ duyệt mới!</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    {notificationTab === 'withdrawals' && pendingWithdrawals.length > 0 && (
                                        <button 
                                            onClick={() => { setActiveTab('withdrawals'); setShowNotifications(false); }}
                                            className="w-full text-center text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            Xem tất cả <ChevronRight size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10 relative z-10">
                        {/* Card 1: Tổng doanh thu */}
                        <div className="bg-white dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative overflow-hidden group shadow-sm shadow-rose-100/40 dark:shadow-none">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">Tổng doanh thu mua</p>
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                                    <DollarSign size={14} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{formatVND(stats.totalRevenue)}</h3>
                                <div className="text-emerald-500 flex items-center gap-0.5 text-[10px] font-bold">
                                    <TrendingUp size={12} />
                                    <span>TĂNG</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Phí sàn */}
                        <div className="bg-white dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative overflow-hidden group shadow-sm shadow-rose-100/40 dark:shadow-none">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">Phí sàn ({platformFeePercent}%)</p>
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                                    <Activity size={14} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{formatVND(stats.platformFee || (stats.totalRevenue * platformFeePercent / 100))}</h3>
                                <div className="text-zinc-450 dark:text-white/20 text-[10px] font-bold">{platformFeePercent}% SHARE</div>
                            </div>
                        </div>

                        {/* Card 3: Số dư khả dụng ví Admin */}
                        <div className="bg-white dark:bg-[#110505]/60 border border-rose-200 dark:border-red-950/20 rounded-2xl p-6 hover:border-red-500/35 hover:shadow-[0_4px_25px_rgba(244,63,94,0.08)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300 relative overflow-hidden group shadow-sm shadow-rose-100/40 dark:shadow-none">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-red-650 dark:text-red-400/80 text-[10px] font-black uppercase tracking-widest">Số dư ví Admin</p>
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">
                                    <CreditCard size={14} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-red-500">{formatVND(stats.adminBalance || 0)}</h3>
                                <div className="text-red-500/40 text-[9px] font-black uppercase">Ví Khả Dụng</div>
                            </div>
                        </div>

                        {/* Card 4: Tổng Creators */}
                        <div className="bg-white dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative overflow-hidden group shadow-sm shadow-rose-100/40 dark:shadow-none">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">Tổng Creators</p>
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                                    <Users size={14} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{(stats.totalCreators || 0).toLocaleString('vi-VN')}</h3>
                                <div className="text-zinc-450 dark:text-white/20 text-[10px] font-bold">CREATOR</div>
                            </div>
                        </div>

                        {/* Card 5: Tài nguyên Video */}
                        <div className="bg-white dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative overflow-hidden group shadow-sm shadow-rose-100/40 dark:shadow-none">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">Tài nguyên Video</p>
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                                    <Video size={14} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{stats.totalVideos.toLocaleString('vi-VN')}</h3>
                                <div className="text-emerald-500 text-[10px] font-bold">HOẠT ĐỘNG</div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation Content Area */}
                    <div className="w-full">
                        {/* 1. TAB OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                                <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-3xl p-8 h-[400px] flex flex-col relative shadow-sm dark:shadow-none">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <Activity size={18} className="text-red-600 animate-pulse" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900 dark:text-white">
                                                {chartDataType === 'revenue' && 'Biểu đồ Doanh thu (10 ngày gần nhất)'}
                                                {chartDataType === 'users' && 'Biểu đồ Thành viên mới (10 ngày gần nhất)'}
                                                {chartDataType === 'traffic' && 'Biểu đồ Lượt truy cập (10 ngày gần nhất)'}
                                            </h4>
                                        </div>
                                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
                                            {(['revenue', 'users', 'traffic'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setChartDataType(type)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                        chartDataType === type 
                                                            ? 'bg-red-650 text-white shadow-md' 
                                                            : 'text-zinc-500 dark:text-white/40 hover:text-zinc-950 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {type === 'revenue' && 'Doanh thu'}
                                                    {type === 'users' && 'Người dùng'}
                                                    {type === 'traffic' && 'Lượt truy cập'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex items-end gap-3 px-2">
                                        {getChartData().map((val, i) => {
                                            const dates = getPastDates();
                                            const maxVal = Math.max(...getChartData(), 1);
                                            const heightPercent = (val / maxVal) * 80 + 10;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                                    <div className="w-full bg-red-600/[0.06] hover:bg-gradient-to-t hover:from-red-600 hover:to-amber-500 transition-all duration-300 rounded-t-lg relative flex items-end justify-center" style={{ height: `${heightPercent}%` }}>
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-zinc-900/90 text-white text-[10px] px-2.5 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity font-mono z-30 shadow-xl pointer-events-none whitespace-nowrap">
                                                            {chartDataType === 'revenue' && formatVND(val)}
                                                            {chartDataType === 'users' && `${val} thành viên`}
                                                            {chartDataType === 'traffic' && `${val.toLocaleString()} truy cập`}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400 dark:text-white/30 font-mono">{dates[i]}</span>
                                                </div>
                                            );
                                        })}
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
                                                        <p className="font-bold text-white group-hover:text-red-500 transition-colors">{order.userId?.username || 'Khách vãng lai'}</p>
                                                        <p className="text-[10px] text-white/40 mt-0.5">{formatVND(order.amount)} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <div className="text-red-500 font-mono text-[10px] font-bold">+{formatVND(order.amount * platformFeePercent / 100)}</div>
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
                                <div className="bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="p-8 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold italic uppercase mb-1">Nhật ký giao dịch</h3>
                                            <p className="text-zinc-500 dark:text-white/40 text-xs font-medium">Liệt kê tất cả các đơn hàng mua khoá học/video Premium trên MyTube.</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-white/5 text-zinc-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                                    <th className="px-8 py-5">Mã đơn hàng</th>
                                                    <th className="px-8 py-5">Người mua</th>
                                                    <th className="px-8 py-5">Video / Khoá học</th>
                                                    <th className="px-8 py-5 text-right">Tổng tiền</th>
                                                    <th className="px-8 py-5 text-right text-red-500 font-bold">Phí sàn ({platformFeePercent}%)</th>
                                                    <th className="px-8 py-5 text-center">Trạng thái</th>
                                                    <th className="px-8 py-5 text-right">Ngày giao dịch</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.02]">
                                                {Array.isArray(transactions) && transactions.length > 0 ? (
                                                    transactions.map((order: any) => (
                                                        <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group">
                                                                <td className="px-8 py-5 font-mono text-xs text-zinc-500 dark:text-white/40">#{order.orderCode}</td>
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={order.userId?.avatar || '/assets/img/avata.jpg'} className="w-6 h-6 rounded-full border border-white/10 object-cover" alt="" />
                                                                        <span className="text-sm font-bold">{order.userId?.username || 'Unknown User'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="text-sm text-zinc-650 dark:text-white/60 line-clamp-1 max-w-[250px]">{order.videoId?.title || 'Video đã bị gỡ'}</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right font-bold text-sm">{formatVND(order.amount)}</td>
                                                                <td className="px-8 py-5 text-right font-bold text-sm text-red-500">{formatVND(order.amount * platformFeePercent / 100)}</td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                        order.status === 'SUCCESS'
                                                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                                            : order.status === 'FAILED'
                                                                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                                    }`}>
                                                                        {order.status || 'PENDING'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right text-xs text-zinc-500 dark:text-white/20">
                                                                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                                                                </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-8 py-16 text-center text-zinc-500 dark:text-white/30 text-xs italic">
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
                                                                        <span className="text-sm font-bold block">{withdrawal.userId?.username || 'Creator Ẩn Danh'}</span>
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

                        {/* 5. TAB SETTINGS */}
                        {activeTab === 'settings' && (
                            <div className="bg-white/[0.01] dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-in fade-in duration-500">
                                <div className="border-b border-rose-100 dark:border-white/5 pb-6 mb-8">
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white italic uppercase flex items-center gap-2">
                                        <Settings size={20} className="text-red-500" />
                                        Thiết lập & Cấu hình Hệ thống
                                    </h3>
                                    <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">Cấu hình các tham số vận hành, tài chính và phân quyền trên nền tảng MyTube.</p>
                                </div>

                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Cấu hình tài chính */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                                            <CreditCard size={16} />
                                            Cấu hình Tài chính & Thanh toán
                                        </h4>
                                        <div className="bg-white/5 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl p-6 space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-700 dark:text-white/60 uppercase mb-2">Tỷ lệ chiết khấu doanh thu (Platform Fee)</label>
                                                <div className="relative flex items-center">
                                                    <input 
                                                        type="number" 
                                                        value={platformFeePercent}
                                                        onChange={(e) => setPlatformFeePercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-rose-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-white font-mono focus:border-red-500 focus:outline-none transition-colors"
                                                        min={0}
                                                        max={100}
                                                    />
                                                    <span className="absolute right-4 font-mono font-bold text-zinc-400">%</span>
                                                </div>
                                                <span className="text-[10px] text-zinc-500 dark:text-white/30 block mt-1.5 leading-relaxed">
                                                    Tỷ lệ phần trăm doanh thu sàn sẽ trích lại từ các giao dịch mua nội dung Premium của Creator.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-rose-100 dark:border-white/5 flex justify-end">
                                    <button 
                                        onClick={() => {
                                            alert("✨ Đã lưu các thiết lập hệ thống thành công!");
                                        }}
                                        className="bg-gradient-to-r from-red-700 via-red-655 to-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border border-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Lưu cấu hình
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 7. TAB CHANNELS */}
                        {activeTab === 'channels' && (
                            <div className="animate-in fade-in duration-500 space-y-6">
                                {/* Stats */}
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
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Có cảnh cáo</p>
                                        <p className="text-2xl font-bold text-amber-500 tabular-nums">{allChannels.filter(c => (c.strikes || 0) > 0 && c.status !== 'BANNED').length}</p>
                                    </div>
                                    <div className="bg-white dark:bg-white/[0.02] border border-red-200 dark:border-red-500/20 p-5 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Bị khóa</p>
                                        <p className="text-2xl font-bold text-red-500 tabular-nums">{allChannels.filter(c => c.status === 'BANNED').length}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold italic uppercase text-zinc-800 dark:text-white flex items-center gap-2">
                                            <Building2 size={20} className="text-red-500" /> Quản lý kênh Creator
                                        </h3>
                                        <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">Xác minh, đánh gậy cảnh cáo và kiểm soát toàn bộ kênh trên nền tảng.</p>
                                    </div>
                                    <button onClick={fetchChannels} className="px-4 py-2 text-xs font-bold border border-rose-100 dark:border-white/10 text-zinc-600 dark:text-white/50 rounded-xl hover:bg-rose-50 dark:hover:bg-white/5 transition-all flex items-center gap-2">
                                        <Activity size={14} /> Làm mới
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl overflow-x-auto">
                                    <table className="w-full text-left text-xs min-w-[950px]">
                                        <thead>
                                            <tr className="bg-rose-50/50 dark:bg-white/[0.01] border-b border-rose-100 dark:border-white/5 text-zinc-500 dark:text-white/30 font-black uppercase tracking-wider text-[10px]">
                                                <th className="p-4">Kênh</th>
                                                <th className="p-4">Subscribers</th>
                                                <th className="p-4">Gậy cảnh cáo</th>
                                                <th className="p-4">Trạng thái</th>
                                                <th className="p-4">Tích xanh</th>
                                                <th className="p-4 text-right">Xử phạt (Admin)</th>
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
                                                                    {isBanned && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white dark:border-[#0c0c0c]" />}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <p className="font-bold text-zinc-900 dark:text-white">{channel.channel_name}</p>
                                                                        {channel.is_verified && <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />}
                                                                    </div>
                                                                    <p className="text-[10px] text-zinc-400 dark:text-white/25 font-mono">{channel.user?.username || '—'} · {channel.user?.email || ''}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-bold text-zinc-800 dark:text-white tabular-nums">
                                                            {(channel.subscribers?.length || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1">
                                                                {[0, 1, 2].map(i => (
                                                                    <div key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black border ${
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
                                                                    onClick={() => handleAdminVerifyChannel(channel._id, 'unverify')}
                                                                    disabled={isChannelActionLoading === channel._id}
                                                                    className="px-3 py-1.5 rounded-lg border border-blue-400/30 text-blue-500 text-[10px] font-black hover:bg-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                                                                >
                                                                    {isChannelActionLoading === channel._id ? <Loader2 size={10} className="animate-spin" /> : <BadgeCheck size={10} />}
                                                                    Thu hồi ✓
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAdminVerifyChannel(channel._id, 'verify')}
                                                                    disabled={isChannelActionLoading === channel._id || isBanned}
                                                                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                                                                >
                                                                    {isChannelActionLoading === channel._id ? <Loader2 size={10} className="animate-spin" /> : <BadgeCheck size={10} />}
                                                                    Cấp tích ✓
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {!isBanned ? (
                                                                <div className="flex items-center gap-1.5 justify-end">
                                                                    <button
                                                                        onClick={() => handleAdminPenalizeChannel(channel._id, 'STRIKE')}
                                                                        disabled={isChannelActionLoading === channel._id}
                                                                        title="Đánh 1 gậy (3 gậy = vĩnh viễn)"
                                                                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
                                                                    >
                                                                        🪄 +Gậy
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAdminPenalizeChannel(channel._id, 'BAN_7DAYS')}
                                                                        disabled={isChannelActionLoading === channel._id}
                                                                        title="Khóa 7 ngày"
                                                                        className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-black hover:bg-orange-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                                    >7N</button>
                                                                    <button
                                                                        onClick={() => handleAdminPenalizeChannel(channel._id, 'BAN_30DAYS')}
                                                                        disabled={isChannelActionLoading === channel._id}
                                                                        title="Khóa 30 ngày"
                                                                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                                    >30N</button>
                                                                    <button
                                                                        onClick={() => handleAdminPenalizeChannel(channel._id, 'BAN_FOREVER')}
                                                                        disabled={isChannelActionLoading === channel._id}
                                                                        title="Khóa vĩnh viễn"
                                                                        className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-black hover:bg-red-700 transition-all cursor-pointer disabled:opacity-40 shadow-sm shadow-red-600/20 whitespace-nowrap"
                                                                    >⛔ Vĩnh viễn</button>
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
                                                        <p className="font-bold">Chưa có kênh nào trên nền tảng.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 6. TAB ANALYTICS */}
                        {activeTab === 'analytics' && (
                            <div className="bg-white/[0.01] dark:bg-[#0c0c0c]/60 border border-slate-200 dark:border-red-950/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-in fade-in duration-500">
                                <div className="border-b border-slate-200 dark:border-white/5 pb-6 mb-8">
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white italic uppercase flex items-center gap-2">
                                        <BarChart3 size={20} className="text-red-500" />
                                        Phân tích & Thống kê hệ thống
                                    </h3>
                                    <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">Báo cáo chi tiết hiệu suất truy cập, tăng trưởng người dùng và doanh thu toàn sàn.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <RadialProgress 
                                        percentage={parseFloat(stats.userGrowth) || 0} 
                                        title="Tăng trưởng Người dùng" 
                                        subTitle="Tháng này" 
                                        gradientId="userGrowthGrad" 
                                        fromColor="#f43f5e" 
                                        toColor="#fbbf24" 
                                        icon={<TrendingUp size={12} className="text-emerald-500" />}
                                        isGrowth={true}
                                    />
                                    <RadialProgress 
                                        percentage={parseFloat(stats.retentionRate) || 100} 
                                        title="Tỷ lệ Giữ chân (Retention Rate)" 
                                        subTitle="Mục tiêu: 100%" 
                                        gradientId="retentionGrad" 
                                        fromColor="#10b981" 
                                        toColor="#3b82f6" 
                                        icon={<Activity size={12} className="text-indigo-400" />}
                                    />
                                    <div className="bg-white dark:bg-[#0c0c0c]/80 border border-rose-100 dark:border-red-950/20 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-red-500/35 hover:shadow-[0_10px_35px_rgba(244,63,94,0.08)] dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-500 group relative overflow-hidden text-center shadow-md shadow-rose-100/30 dark:shadow-none min-h-[320px]">
                                        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-[0.03] dark:opacity-[0.07] bg-emerald-500 blur-2xl pointer-events-none transition-opacity duration-550"></div>
                                        
                                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-650 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
                                        
                                        <p className="text-zinc-400 dark:text-white/45 text-[11px] font-black uppercase tracking-widest mb-6">Tổng lượt xem video</p>
                                        
                                        <div className="relative flex items-center justify-center mb-6 w-[130px] h-[130px]">
                                            <div className="w-[100px] h-[100px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/[0.03] border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:shadow-[0_0_30px_rgba(16,185,129,0.05)] group-hover:scale-105 transition-transform duration-500">
                                                <PlayCircle size={36} className="animate-pulse mb-1" />
                                                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500/60">Live</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-black font-mono text-zinc-800 dark:text-zinc-100 tracking-tight">
                                                {(stats.totalViews || 0).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-2.5 flex items-center justify-center gap-2 mt-2 shadow-inner">
                                            <TrendingUp size={12} className="text-emerald-500 animate-bounce" />
                                            <span className="text-xs font-bold text-emerald-500">Lượt xem toàn sàn</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cloudinary Storage Section */}
                                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5">
                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Cloud size={18} className="text-blue-500 animate-pulse" />
                                        Dung lượng lưu trữ Cloudinary
                                    </h4>

                                    {isLoadingSystemStatus ? (
                                        <div className="flex items-center justify-center py-10 bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                                            <span className="text-sm text-zinc-500 dark:text-white/40">Đang tải dữ liệu dung lượng lưu trữ từ Cloudinary...</span>
                                        </div>
                                    ) : systemStatus?.cloudinaryStorage ? (
                                        <div className="bg-white/5 dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 hover:border-red-500/30 transition-all duration-300 relative group overflow-hidden shadow-sm shadow-rose-100/40 dark:shadow-none">
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            
                                            <CloudinaryDonut percentage={systemStatus.cloudinaryStorage.used_percent} />

                                            <div className="flex-1 text-center md:text-left space-y-4">
                                                <div>
                                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center md:justify-start">
                                                        <span className="text-3xl font-extrabold font-mono text-zinc-800 dark:text-white tracking-tight">
                                                            {formatBytes(systemStatus.cloudinaryStorage.usage)}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 dark:text-white/40 font-medium">
                                                            đã dùng của {formatBytes(systemStatus.cloudinaryStorage.limit)} (Giới hạn tối đa)
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 dark:text-white/30 mt-2 leading-relaxed">
                                                        Không gian lưu trữ Cloudinary phục vụ cho việc lưu trữ video, hình ảnh, tài nguyên truyền thông được tải lên từ người dùng và người sáng tạo nội dung trong hệ thống.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 max-w-sm pt-4 border-t border-slate-100 dark:border-white/5 mx-auto md:mx-0">
                                                    <div>
                                                        <p className="text-[10px] text-zinc-400 dark:text-white/20 uppercase font-black tracking-widest">Trạng thái dung lượng</p>
                                                        <p className="text-xs font-bold text-emerald-500 mt-1">An toàn & Sẵn sàng</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-400 dark:text-white/20 uppercase font-black tracking-widest">Còn lại khả dụng</p>
                                                        <p className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300 mt-1">
                                                            {formatBytes(systemStatus.cloudinaryStorage.limit - systemStatus.cloudinaryStorage.usage)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center py-10 bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl text-red-500">
                                            <AlertCircle size={20} className="mr-2" />
                                            <span className="text-sm">Không thể lấy thông tin dung lượng từ Cloudinary. Vui lòng kiểm tra lại cấu hình API.</span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. System Traffic & Performance Metrics */}
                                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5">
                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Activity size={18} className="text-red-500 animate-pulse" />
                                        Thông số truy cập & Hiệu năng hệ thống
                                    </h4>

                                    {isLoadingSystemStatus ? (
                                        <div className="flex items-center justify-center py-10 bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl">
                                            <Loader2 className="w-6 h-6 animate-spin text-red-500 mr-2" />
                                            <span className="text-sm text-zinc-500 dark:text-white/40">Đang tải thông số truy cập từ máy chủ...</span>
                                        </div>
                                    ) : systemStatus?.traffic ? (
                                        <div className="space-y-8">
                                            {/* Traffic Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Card 1: Online Users */}
                                                <div className="bg-white/5 dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative group overflow-hidden shadow-sm shadow-rose-100/40 dark:shadow-none">
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-wider">Người dùng trực tuyến</p>
                                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Real-time</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-3xl font-extrabold font-mono text-zinc-800 dark:text-white tracking-tight">
                                                            {systemStatus.traffic.onlineUsersSimulated}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500 dark:text-white/30 font-medium mt-2 leading-relaxed">
                                                            * Tính tất cả phiên hoạt động của <b>cả người dùng cũ và người dùng mới</b> khi truy cập vào hệ thống.
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card 2: Daily Requests */}
                                                <div className="bg-white/5 dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative group overflow-hidden shadow-sm shadow-rose-100/40 dark:shadow-none">
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-wider">Lượt yêu cầu hàng ngày</p>
                                                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                                            <Server size={12} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-3xl font-extrabold font-mono text-zinc-800 dark:text-white tracking-tight">
                                                            {systemStatus.traffic.dailyRequests.toLocaleString('vi-VN')}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500 dark:text-white/30 font-medium mt-2 leading-relaxed">
                                                            * Ghi nhận mỗi lần tải trang, gọi API hoặc gửi dữ liệu của <b>toàn bộ người dùng</b> trên trang web.
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card 3: Active Live Streams */}
                                                <div className="bg-white/5 dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300 relative group overflow-hidden shadow-sm shadow-rose-100/40 dark:shadow-none">
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-zinc-400 dark:text-white/40 text-[10px] font-black uppercase tracking-wider">Phiên Livestream trực tuyến</p>
                                                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Live</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-3xl font-extrabold font-mono text-zinc-800 dark:text-white tracking-tight">
                                                            {systemStatus.traffic.activeStreams}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500 dark:text-white/30 font-medium mt-2 leading-relaxed">
                                                            * Số lượng kênh của các Creator đang phát sóng trực tiếp (Livestreaming) đồng thời trên hệ thống.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DB Statistics Grid */}
                                            {systemStatus?.dbCollections && (
                                                <div className="bg-white/5 dark:bg-[#0c0c0c]/60 border border-rose-100 dark:border-red-950/10 p-6 rounded-3xl shadow-sm dark:shadow-none">
                                                    <h5 className="text-xs font-black text-zinc-700 dark:text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <Database size={14} className="text-indigo-400" />
                                                        Thống kê dữ liệu lưu trữ (Database Collections)
                                                    </h5>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-center hover:border-red-500/20 transition-all duration-300">
                                                            <p className="text-zinc-400 dark:text-white/30 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                                                                <Users size={10} />
                                                                Thành viên
                                                            </p>
                                                            <p className="text-xl font-black font-mono text-zinc-800 dark:text-white">{systemStatus.dbCollections.users.toLocaleString('vi-VN')}</p>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-center hover:border-red-500/20 transition-all duration-300">
                                                            <p className="text-zinc-400 dark:text-white/30 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                                                                <Video size={10} />
                                                                Videos
                                                            </p>
                                                            <p className="text-xl font-black font-mono text-zinc-800 dark:text-white">{systemStatus.dbCollections.videos.toLocaleString('vi-VN')}</p>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-center hover:border-red-500/20 transition-all duration-300">
                                                            <p className="text-zinc-400 dark:text-white/30 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                                                                <DollarSign size={10} />
                                                                Đơn hàng
                                                            </p>
                                                            <p className="text-xl font-black font-mono text-zinc-800 dark:text-white">{systemStatus.dbCollections.orders.toLocaleString('vi-VN')}</p>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-center hover:border-red-500/20 transition-all duration-300">
                                                            <p className="text-zinc-400 dark:text-white/30 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                                                                <Building2 size={10} />
                                                                Kênh Creator
                                                            </p>
                                                            <p className="text-xl font-black font-mono text-zinc-800 dark:text-white">{systemStatus.dbCollections.channels.toLocaleString('vi-VN')}</p>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-center hover:border-red-500/20 transition-all duration-300 col-span-2 sm:col-span-1">
                                                            <p className="text-zinc-400 dark:text-white/30 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                                                                <MessageSquare size={10} />
                                                                Bình luận
                                                            </p>
                                                            <p className="text-xl font-black font-mono text-zinc-800 dark:text-white">{systemStatus.dbCollections.comments.toLocaleString('vi-VN')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center py-10 bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl text-red-500">
                                            <AlertCircle size={20} className="mr-2" />
                                            <span className="text-sm">Không thể lấy thông tin lưu lượng truy cập hệ thống.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 7. TAB USERS */}
                        {activeTab === 'users' && (
                            <div className="bg-white/[0.01] dark:bg-[#0c0c0c]/60 border border-slate-200 dark:border-red-950/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-in fade-in duration-500">
                                <div className="border-b border-slate-200 dark:border-white/5 pb-6 mb-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-800 dark:text-white italic uppercase flex items-center gap-2">
                                            <Users size={20} className="text-red-500" />
                                            Quản lý Thành viên & Đối tác
                                        </h3>
                                        <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">Danh sách người dùng, đối tác sản xuất nội dung (Creators) và nhà quảng cáo.</p>
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-2xl bg-white/5 dark:bg-[#121212]">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-rose-100 dark:border-white/5 text-zinc-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                                <th className="px-6 py-4 text-center">Avatar</th>
                                                <th className="px-6 py-4">Tên tài khoản</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Vai trò</th>
                                                <th className="px-6 py-4 text-right">Số dư</th>
                                                <th className="px-6 py-4 text-right">Số tiền chờ rút</th>
                                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                                <th className="px-6 py-4 text-center">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-white/[0.02]">
                                            {usersList.length > 0 ? (
                                                usersList.map((user) => (
                                                    <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4 text-center">
                                                            <img 
                                                                src={user.avatar || '/assets/img/avata.jpg'} 
                                                                alt="" 
                                                                className="w-8 h-8 rounded-full border border-rose-100 dark:border-white/10 object-cover mx-auto" 
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 font-mono font-bold text-zinc-800 dark:text-zinc-100">{user.username}</td>
                                                        <td className="px-6 py-4">{user.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                user.role === 'CREATOR' 
                                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                                    : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                                                            }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono font-bold text-green-500">{formatVND(user.balance || 0)}</td>
                                                        <td className="px-6 py-4 text-right font-mono font-bold text-red-500">{formatVND(getPendingWithdrawalAmount(user._id))}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                user.status === 'LOCKED' 
                                                                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                                                                    : user.status === 'DELETED'
                                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                            }`}>
                                                                {user.status || 'ACTIVE'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                {user.status !== 'DELETED' ? (
                                                                    <>
                                                                        {user.status === 'LOCKED' ? (
                                                                            <button
                                                                                onClick={() => handleUserAction(user._id, 'unlock')}
                                                                                className="px-2 py-1 bg-green-550 hover:bg-green-600 text-white rounded text-[10px] font-bold transition-all"
                                                                            >
                                                                                Mở khóa
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleUserAction(user._id, 'lock')}
                                                                                className="px-2 py-1 bg-amber-550 hover:bg-amber-600 text-white rounded text-[10px] font-bold transition-all"
                                                                            >
                                                                                Khóa acc
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.username}? Thao tác này sẽ xóa tất cả video và kênh liên quan và không thể khôi phục.`)) {
                                                                                    handleUserAction(user._id, 'delete');
                                                                                }
                                                                            }}
                                                                            className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] font-bold transition-all"
                                                                        >
                                                                            Xóa acc
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[10px] text-zinc-500 dark:text-white/20 italic">Đã xóa</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-10 text-center text-zinc-500 dark:text-white/30 italic">
                                                        Không có dữ liệu thành viên nào.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 8. TAB STAFF */}
                        {activeTab === 'staff' && (
                            <div className="bg-white/[0.01] dark:bg-[#0c0c0c]/60 border border-slate-200 dark:border-red-950/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-in fade-in duration-500">
                                <div className="border-b border-slate-200 dark:border-white/5 pb-6 mb-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-800 dark:text-white italic uppercase flex items-center gap-2">
                                            <ShieldCheck size={20} className="text-red-500" />
                                            Đội ngũ Nhân viên & Kiểm duyệt viên (Staff)
                                        </h3>
                                        <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">Phân quyền, cấp khóa bảo mật, quản lý tài khoản điều hành viên hệ thống.</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setStaffError('');
                                            setStaffSuccess('');
                                            setShowStaffModal(true);
                                        }}
                                        className="bg-gradient-to-r from-red-700 via-red-655 to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md border border-red-500/20"
                                    >
                                        Cấp quyền Staff mới
                                    </button>
                                </div>

                                <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-2xl bg-white/5 dark:bg-[#121212]">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-white/5 text-zinc-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/[0.01] py-4">
                                                <th className="px-6 py-4">Mã Staff</th>
                                                <th className="px-6 py-4">Tên Nhân viên</th>
                                                <th className="px-6 py-4">Vai trò</th>
                                                <th className="px-6 py-4">Trạng thái</th>
                                                <th className="px-6 py-4">Hoạt động cuối</th>
                                                <th className="px-6 py-4 text-center">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-white/[0.02] text-xs">
                                            {staffList.length > 0 ? (
                                                staffList.map((st, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4 font-mono text-zinc-400">STF-{String(idx + 1).padStart(3, '0')}</td>
                                                        <td className="px-6 py-4 font-bold">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <img src={st.avatar_url || '/assets/img/avata.jpg'} className="w-6 h-6 rounded-full object-cover border border-white/10" alt="" />
                                                                <div>
                                                                    <span>{st.name}</span>
                                                                    <span className="text-[10px] text-zinc-500 dark:text-white/30 block mt-0.5">{st.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 border rounded font-black text-[10px] ${
                                                                st.role === 'ADMIN' 
                                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                                                    : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                            }`}>
                                                                {st.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {st.isActive ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-500">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Trực tuyến
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-zinc-400">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Ngoại tuyến
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-zinc-400">
                                                            {st.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleViewStaff(st)}
                                                                    className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <Eye size={12} /> Xem
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditStaffClick(st)}
                                                                    className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-600 text-amber-500 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                                                    title="Sửa thông tin"
                                                                >
                                                                    <Edit3 size={12} /> Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleLockStaff(st)}
                                                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                                                        st.isActive 
                                                                            ? 'bg-orange-500/10 hover:bg-orange-600 text-orange-500 hover:text-white' 
                                                                            : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white'
                                                                    }`}
                                                                    title={st.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                                >
                                                                    {st.isActive ? (
                                                                        <>
                                                                            <Lock size={12} /> Khóa
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Unlock size={12} /> Mở khóa
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteStaffClick(st)}
                                                                    className="px-2.5 py-1.5 bg-red-650/10 hover:bg-red-750 text-red-500 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                                                    title="Xóa nhân viên"
                                                                >
                                                                    <Trash2 size={12} /> Xóa
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-10 text-center text-zinc-500 dark:text-white/30 italic">
                                                        Không có nhân viên nào.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 9. TAB SUBSCRIPTION */}
                        {activeTab === 'subscription' && (
                            <div className="bg-white/[0.01] dark:bg-[#0c0c0c]/60 border border-slate-200 dark:border-red-950/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-in fade-in duration-500">
                                <div className="border-b border-slate-200 dark:border-white/5 pb-6 mb-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-800 dark:text-white italic uppercase flex items-center gap-2">
                                            <Sparkles size={20} className="text-red-500" />
                                            Cấu hình Gói hội viên & Phí dịch vụ
                                        </h3>
                                        <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">Định nghĩa các gói Premium Subscription, mức giá và quyền lợi đặc quyền của thành viên.</p>
                                    </div>
                                    <button 
                                        onClick={handleOpenCreatePkg}
                                        className="bg-gradient-to-r from-red-700 via-red-655 to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md border border-red-500/20"
                                    >
                                        Tạo gói dịch vụ mới
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {Array.isArray(premiumPackages) && premiumPackages.length > 0 ? (
                                        premiumPackages.map((pkg: any) => (
                                            <div key={pkg._id} className="bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 p-6 rounded-2xl relative overflow-hidden group flex flex-col justify-between min-h-[220px]">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2 gap-2">
                                                        <h4 className="text-base font-bold text-zinc-800 dark:text-white truncate">{pkg.name}</h4>
                                                        <span className="bg-red-500/10 text-red-500 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-red-500/20 flex-shrink-0">{pkg.key}</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 dark:text-white/40 mt-1 line-clamp-2">{pkg.description || 'Không có mô tả'}</p>
                                                    <p className="text-xl font-bold font-mono text-red-500 mt-4">{formatVND(pkg.price)}<span className="text-[10px] text-zinc-400 font-normal">/{pkg.durationDays} ngày</span></p>
                                                </div>
                                                <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                                                    <button
                                                        onClick={() => handleOpenEditPkg(pkg)}
                                                        className="flex-1 py-2 bg-slate-200 dark:bg-white/5 text-zinc-800 dark:text-white font-bold text-[10px] uppercase rounded-xl hover:bg-slate-300 dark:hover:bg-white/10 transition"
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePkg(pkg.key)}
                                                        className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] uppercase rounded-xl transition"
                                                    >
                                                        Xóa gói
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 py-16 text-center text-zinc-500 dark:text-white/30 text-xs italic">
                                            Chưa định nghĩa gói hội viên nào. Vui lòng tạo gói mới!
                                        </div>
                                    )}
                                </div>

                                {/* Modal tạo/chỉnh sửa gói hội viên */}
                                {showPkgModal && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                        <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative text-zinc-800 dark:text-white">
                                            <h4 className="text-lg font-bold text-zinc-800 dark:text-white mb-6 uppercase tracking-wider">
                                                {pkgFormMode === 'create' ? 'Tạo gói hội viên mới' : 'Cập nhật gói hội viên'}
                                            </h4>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 dark:text-white/60 uppercase mb-2">Mã gói (Key - Unique)</label>
                                                    <input 
                                                        type="text" 
                                                        disabled={pkgFormMode === 'edit'}
                                                        value={pkgForm.key}
                                                        onChange={(e) => setPkgForm(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                                                        placeholder="Ví dụ: PREMIUM_MONTH"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-white font-mono focus:border-red-500 focus:outline-none disabled:opacity-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 dark:text-white/60 uppercase mb-2">Tên hiển thị</label>
                                                    <input 
                                                        type="text" 
                                                        value={pkgForm.name}
                                                        onChange={(e) => setPkgForm(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Ví dụ: Gói Premium 1 Tháng"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-white focus:border-red-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 dark:text-white/60 uppercase mb-2">Giá tiền (VNĐ)</label>
                                                    <input 
                                                        type="number" 
                                                        value={pkgForm.price}
                                                        onChange={(e) => setPkgForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                        placeholder="25000"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 dark:text-white/60 uppercase mb-2">Thời hạn sử dụng (Ngày)</label>
                                                    <input 
                                                        type="number" 
                                                        value={pkgForm.durationDays}
                                                        onChange={(e) => setPkgForm(prev => ({ ...prev, durationDays: Number(e.target.value) }))}
                                                        placeholder="30"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 dark:text-white/60 uppercase mb-2">Mô tả chi tiết</label>
                                                    <textarea 
                                                        rows={3}
                                                        value={pkgForm.description}
                                                        onChange={(e) => setPkgForm(prev => ({ ...prev, description: e.target.value }))}
                                                        placeholder="Xem video chặn quảng cáo..."
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-white focus:border-red-500 focus:outline-none resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mt-8">
                                                <button 
                                                    onClick={() => setShowPkgModal(false)}
                                                    className="flex-1 py-3 bg-slate-200 dark:bg-zinc-800 text-zinc-800 dark:text-white font-bold text-xs uppercase rounded-xl border border-slate-350 dark:border-white/5 hover:bg-slate-300 dark:hover:bg-zinc-700 transition"
                                                >
                                                    Hủy
                                                </button>
                                                <button 
                                                    onClick={handleSavePkg}
                                                    className="flex-1 py-3 bg-gradient-to-r from-red-700 via-red-655 to-amber-500 text-white font-bold text-xs uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition shadow-md border border-red-500/20"
                                                >
                                                    Lưu lại
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 10. TAB ADS (QUẢN LÝ QUẢNG CÁO) */}
                        {activeTab === 'ads' && (
                            <div className="space-y-8 animate-in fade-in duration-500 text-left">
                                {/* Header */}
                                <div className="bg-white/[0.01] dark:bg-[#0c0c0c]/60 border border-slate-200 dark:border-red-950/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/5 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-800 dark:text-white italic uppercase flex items-center gap-2">
                                                <Megaphone size={20} className="text-red-500" />
                                                Quản lý & Cấu hình Chiến dịch Quảng cáo
                                            </h3>
                                            <p className="text-zinc-500 dark:text-white/40 text-xs mt-1">
                                                Tạo chiến dịch, bật/tắt quảng cáo toàn hệ thống, kiểm duyệt ngân sách và duyệt hiển thị.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            {/* Global status toggle */}
                                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10">
                                                <span className="text-xs font-bold text-zinc-650 dark:text-white/50">Trạng thái hệ thống:</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={globalAdEnabled} 
                                                        onChange={(e) => handleToggleGlobalAds(e.target.checked)}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650"></div>
                                                </label>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setEditorMode('create');
                                                    setAdForm({
                                                        title: '',
                                                        type: 'pre-roll',
                                                        videoUrl: '',
                                                        clickUrl: '',
                                                        bannerUrl: '',
                                                        targetViews: 1000,
                                                        costPerView: 500,
                                                        totalBudget: 500000,
                                                        ownerId: admin._id || '',
                                                        status: 'ACTIVE'
                                                    });
                                                    setShowAdModal(true);
                                                }}
                                                className="bg-gradient-to-r from-red-700 via-red-650 to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md border border-red-500/20 cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Plus size={14} /> + Thêm quảng cáo mới
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                <div className="bg-white/5 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="p-8 border-b border-slate-200 dark:border-white/5">
                                        <h4 className="font-bold text-sm uppercase tracking-wider">Danh sách quảng cáo hoạt động</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-white/5 text-zinc-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                                    <th className="px-6 py-4">Chiến dịch</th>
                                                    <th className="px-6 py-4">Loại</th>
                                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                                    <th className="px-6 py-4 text-right">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.02]">
                                                {adsList.filter(ad => !isPendingAd(ad)).length > 0 ? (
                                                    adsList.filter(ad => !isPendingAd(ad)).map((ad) => (
                                                        <tr key={ad._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                                            <td className="px-6 py-4 font-bold">
                                                                <div className="text-sm">{ad.title}</div>
                                                                {(ad.advertiserName || ad.advertiserId) && (
                                                                    <div className="text-[10px] text-zinc-500 dark:text-white/30 block mt-0.5">Nhà QC: {ad.advertiserName || ad.advertiserId}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 uppercase font-bold tracking-wider text-[10px]">{getAdDisplayType(ad.slotId)}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    ad.isActive || ad.status === 'ACTIVE' || ad.status === 'APPROVED'
                                                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                                }`}>
                                                                    {ad.isActive || ad.status === 'ACTIVE' || ad.status === 'APPROVED' ? 'HOẠT ĐỘNG' : 'TẠM DỪNG'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex gap-2 justify-end">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSelectedAdSlot(ad);
                                                                            const isPreRoll = ad.slotId?.startsWith('video_preroll');
                                                                            const adType = isPreRoll ? 'pre-roll' : ad.slotId?.startsWith('suggested_sidebar') ? 'sidebar' : 'banner';
                                                                            setAdForm({
                                                                                title: ad.title,
                                                                                type: adType,
                                                                                videoUrl: isPreRoll ? (ad.mediaUrl || '') : '',
                                                                                clickUrl: ad.linkUrl || '',
                                                                                bannerUrl: !isPreRoll ? (ad.mediaUrl || '') : '',
                                                                                targetViews: ad.targetViews || 1000,
                                                                                costPerView: ad.costPerView || 500,
                                                                                totalBudget: ad.totalBudget || 500000,
                                                                                ownerId: ad.advertiserId || '',
                                                                                status: ad.status || 'ACTIVE'
                                                                            });
                                                                            setEditorMode('edit');
                                                                            setShowAdModal(true);
                                                                        }}
                                                                        className="px-2 py-1 bg-white/5 border border-white/10 rounded font-bold cursor-pointer text-white/80 hover:text-white hover:bg-white/10 transition"
                                                                    >
                                                                        Sửa
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteAd(ad._id)}
                                                                        className="px-2 py-1 bg-red-650 hover:bg-red-750 text-white rounded font-bold cursor-pointer transition"
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-10 text-center text-zinc-500 dark:text-white/30 italic">
                                                            Không có chiến dịch quảng cáo nào đang chạy.
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
                            <div className="p-10 flex flex-col items-center justify-center min-h-[480px] bg-black font-mono payout-terminal">
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
                                                        <p className="text-sm font-bold text-white">{selectedWithdrawal.userId?.username || 'Creator Ẩn Danh'}</p>
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
        
{/* AD CREATE/EDIT MODAL */}
            {showAdModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#111] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative text-left">
                        <button 
                            type="button"
                            onClick={() => setShowAdModal(false)}
                            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <form onSubmit={handleSaveAd} className="p-8 space-y-6">
                            <h3 className="text-xl font-bold italic uppercase border-b border-white/5 pb-4">
                                {editorMode === 'create' ? 'Tạo quảng cáo mới' : 'Chỉnh sửa quảng cáo'}
                            </h3>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Tiêu đề chiến dịch</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={adForm.title}
                                        onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors"
                                        placeholder="Nhập tiêu đề quảng cáo..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Loại hiển thị</label>
                                        <select 
                                            value={adForm.type}
                                            onChange={(e) => setAdForm({...adForm, type: e.target.value})}
                                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors"
                                        >
                                            <option value="pre-roll">Pre-roll Video</option>
                                            <option value="banner">Banner chính</option>
                                            <option value="sidebar">Sidebar liên kết</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Trạng thái</label>
                                        <select 
                                            value={adForm.status}
                                            onChange={(e) => setAdForm({...adForm, status: e.target.value})}
                                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors"
                                        >
                                            <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
                                            <option value="PAUSED_BY_USER">Tạm dừng (PAUSED)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Đường dẫn Video (.mp4) / Banner (.jpg, .png)</label>
                                    <input 
                                        type="text" 
                                        value={adForm.type === 'pre-roll' ? adForm.videoUrl : adForm.bannerUrl}
                                        onChange={(e) => {
                                            if (adForm.type === 'pre-roll') {
                                                setAdForm({...adForm, videoUrl: e.target.value, bannerUrl: ''});
                                            } else {
                                                setAdForm({...adForm, bannerUrl: e.target.value, videoUrl: ''});
                                            }
                                        }}
                                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors font-mono"
                                        placeholder="https://example.com/media.mp4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Đường dẫn click (khi nhấn QC)</label>
                                    <input 
                                        type="text" 
                                        value={adForm.clickUrl}
                                        onChange={(e) => setAdForm({...adForm, clickUrl: e.target.value})}
                                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors font-mono"
                                        placeholder="https://destination-link.com"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAdModal(false)}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isAdSubmitting}
                                    className="bg-gradient-to-r from-red-700 via-red-655 to-amber-500 text-white rounded-xl text-xs font-bold px-5 py-2.5 transition flex items-center gap-1.5 shadow shadow-red-500/20 cursor-pointer disabled:opacity-50"
                                >
                                    {isAdSubmitting && <Loader2 size={12} className="animate-spin" />}
                                    {editorMode === 'create' ? 'Tạo ngay' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AD REJECT CONTENT MODAL */}
            {showRejectAdModal && selectedAdSlot && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6 text-left">
                        <div>
                            <h3 className="text-lg font-bold italic uppercase mb-1">Từ chối duyệt nội dung</h3>
                            <p className="text-xs text-white/40">Nhập lý do từ chối chiến dịch <b>"{selectedAdSlot.title}"</b></p>
                        </div>
                        <div>
                            <textarea 
                                value={rejectAdReason}
                                onChange={(e) => setRejectAdReason(e.target.value)}
                                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors h-28 resize-none"
                                placeholder="Nhập lý do chi tiết..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => {
                                    setShowRejectAdModal(false);
                                    setRejectAdReason('');
                                }}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={() => handleVerifyAdContent('reject')}
                                className="bg-red-650 hover:bg-red-750 text-white rounded-xl text-xs font-bold px-5 py-2.5 transition cursor-pointer"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                                                </div>
                                            )}

            {/* SMART SEARCH MODAL */}
            {isSmartSearchOpen && (
                <div className="fixed inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0c0c0c] border border-rose-100 dark:border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] transition-all duration-300">
                        {/* Search header */}
                        <div className="p-6 border-b border-rose-100 dark:border-white/5 flex items-center gap-4 bg-rose-50/20 dark:bg-white/[0.01]">
                            <Search className="text-red-500" size={24} />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm thông minh AI (Thành viên, Video, Giao dịch, Yêu cầu rút tiền)..."
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
                                    <p className="text-xs mt-1">Tìm trên toàn hệ thống các Thành viên, Video, Giao dịch mua hàng và Rút tiền</p>
                                </div>
                            ) : (
                                <>
                                    {/* No results checking */}
                                    {(!smartSearchResults.users || smartSearchResults.users.length === 0) && 
                                     (!smartSearchResults.videos || smartSearchResults.videos.length === 0) && 
                                     (!smartSearchResults.transactions || smartSearchResults.transactions.length === 0) && 
                                     (!smartSearchResults.withdrawals || smartSearchResults.withdrawals.length === 0) && (
                                        <div className="text-center py-20 text-zinc-400 dark:text-white/30">
                                            <AlertCircle className="mx-auto mb-4 text-zinc-500" size={40} />
                                            <p className="font-bold text-sm">Không tìm thấy kết quả phù hợp</p>
                                            <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                                        </div>
                                    )}

                                    {/* Users section */}
                                    {smartSearchResults.users?.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                                                <Users size={12} />
                                                Thành viên ({smartSearchResults.users.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {smartSearchResults.users.map((user: any) => (
                                                    <div 
                                                        key={user._id} 
                                                        onClick={() => {
                                                            setActiveTab('users');
                                                            setIsSmartSearchOpen(false);
                                                        }}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-red-500/30 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img src={user.avatar || '/assets/img/avata.jpg'} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt="" />
                                                            <div>
                                                                <p className="font-bold text-zinc-800 dark:text-white group-hover:text-red-500 transition-colors">{user.username}</p>
                                                                <p className="text-[10px] text-zinc-500 mt-0.5">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400`}>
                                                                {user.role}
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
                                                            setActiveTab('videos');
                                                            setIsSmartSearchOpen(false);
                                                        }}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-start gap-4 cursor-pointer hover:border-amber-500/30 transition-all"
                                                    >
                                                        <img src={v.thumbnail_url} className="w-24 aspect-video rounded-lg object-cover border border-slate-200 dark:border-white/10" alt="" />
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

                                    {/* Transactions section */}
                                    {smartSearchResults.transactions?.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                                                <CreditCard size={12} />
                                                Giao dịch mua hàng ({smartSearchResults.transactions.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {smartSearchResults.transactions.map((tx: any) => (
                                                    <div 
                                                        key={tx._id} 
                                                        onClick={() => {
                                                            setActiveTab('finance');
                                                            setIsSmartSearchOpen(false);
                                                        }}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-emerald-500/30 transition-all group"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-zinc-800 dark:text-white group-hover:text-emerald-500 transition-colors">#{tx.orderCode}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-0.5">Số tiền: {formatVND(tx.amount)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${tx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                {tx.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Withdrawals section */}
                                    {smartSearchResults.withdrawals?.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3 flex items-center gap-2">
                                                <ArrowUpRight size={12} />
                                                Yêu cầu rút tiền ({smartSearchResults.withdrawals.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {smartSearchResults.withdrawals.map((w: any) => (
                                                    <div 
                                                        key={w._id} 
                                                        onClick={() => {
                                                            setActiveTab('withdrawals');
                                                            setIsSmartSearchOpen(false);
                                                        }}
                                                        className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-purple-500/30 transition-all group"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-zinc-800 dark:text-white group-hover:text-purple-500 transition-colors">Rút {formatVND(w.amount)} về {w.bankName}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-0.5">Tài khoản: {w.bankAccountHolder} ({w.bankAccount})</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : w.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                {w.status}
                                                            </span>
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
            {/* MODAL CẤP QUYỀN STAFF MỚI */}
            {showStaffModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <ShieldCheck size={24} className="text-red-500" />
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic">Cấp Tài Khoản Staff Mới</h3>
                                <p className="text-[10px] text-white/40">Tài khoản nhân viên điều hành và kiểm duyệt nội dung</p>
                            </div>
                        </div>

                        {staffError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-2xl mb-4 text-xs font-semibold">
                                {staffError}
                            </div>
                        )}

                        {staffSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-2xl mb-4 text-xs font-semibold">
                                {staffSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/50 uppercase tracking-wider block">Tên nhân viên *</label>
                                <input
                                    type="text"
                                    value={staffName}
                                    onChange={(e) => setStaffName(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition text-sm font-semibold"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/50 uppercase tracking-wider block">Email đăng nhập (ID) *</label>
                                <input
                                    type="email"
                                    value={staffEmail}
                                    onChange={(e) => setStaffEmail(e.target.value)}
                                    placeholder="Ví dụ: nva@mytube.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition text-sm font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/50 uppercase tracking-wider block">Mật khẩu *</label>
                                <input
                                    type="password"
                                    value={staffPassword}
                                    onChange={(e) => setStaffPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition text-sm"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowStaffModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition text-xs uppercase tracking-wider"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingStaff}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition text-xs uppercase tracking-wider shadow-lg shadow-red-600/15"
                                >
                                 </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL XEM CHI TIẾT STAFF */}
            {isStaffDetailOpen && selectedStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <Info size={24} className="text-blue-500" />
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic">Chi Tiết Nhân Viên</h3>
                                <p className="text-[10px] text-white/40">Hồ sơ thông tin tài khoản nhân sự hệ thống</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-3 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                                <img 
                                    src={selectedStaff.avatar_url || '/assets/img/avata.jpg'} 
                                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/30 shadow-lg shadow-blue-500/10" 
                                    alt={selectedStaff.name} 
                                />
                                <div className="text-center">
                                    <h4 className="text-base font-bold text-white">{selectedStaff.name}</h4>
                                    <span className="text-[10px] font-mono text-white/50">{selectedStaff.email}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                    <span className="text-white/40">Mã nhân sự:</span>
                                    <span className="font-mono font-bold text-white/80">STF-{selectedStaff._id.substring(selectedStaff._id.length - 6).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                    <span className="text-white/40">Vai trò hệ thống:</span>
                                    <span className="px-2 py-0.5 border border-orange-500/20 bg-orange-500/10 text-orange-500 rounded font-black text-[9px]">
                                        {selectedStaff.role}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                    <span className="text-white/40">Trạng thái tài khoản:</span>
                                    {selectedStaff.isActive ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Đã khóa
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/40">Ngày tham gia:</span>
                                    <span className="text-white/80">{new Date(selectedStaff.createdAt).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsStaffDetailOpen(false);
                                        handleEditStaffClick(selectedStaff);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition text-xs uppercase tracking-wider shadow-lg shadow-blue-600/15"
                                >
                                    Sửa đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsStaffDetailOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition text-xs uppercase tracking-wider"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SỬA THÔNG TIN & ĐỔI MẬT KHẨU STAFF */}
            {showEditStaffModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <Edit3 size={24} className="text-amber-500" />
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic">Chỉnh Sửa Staff</h3>
                                <p className="text-[10px] text-white/40">Cập nhật hồ sơ thông tin và bảo mật của nhân viên</p>
                            </div>
                        </div>

                        {updateStaffError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-2xl mb-4 text-xs font-semibold">
                                {updateStaffError}
                            </div>
                        )}

                        {updateStaffSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-2xl mb-4 text-xs font-semibold">
                                {updateStaffSuccess}
                            </div>
                        )}

                        <form onSubmit={handleUpdateStaff} className="space-y-4">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl relative">
                                <img 
                                    src={editStaffAvatar || '/assets/img/avata.jpg'} 
                                    className="w-16 h-16 rounded-full object-cover border border-white/10" 
                                    alt="Staff Avatar" 
                                />
                                <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1">
                                    {isUploadingFile ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleAvatarUpload} 
                                        className="hidden" 
                                        disabled={isUploadingFile}
                                    />
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/50 uppercase tracking-wider block">Tên nhân viên *</label>
                                <input
                                    type="text"
                                    value={editStaffName}
                                    onChange={(e) => setEditStaffName(e.target.value)}
                                    placeholder="Tên đầy đủ của nhân viên"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500 transition text-sm font-semibold"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/50 uppercase tracking-wider block">Email đăng nhập (Không thể đổi)</label>
                                <input
                                    type="email"
                                    value={selectedStaff.email}
                                    className="w-full bg-white/[0.01] border border-white/5 rounded-xl py-3 px-4 text-white/40 cursor-not-allowed text-sm font-mono"
                                    disabled
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/50 uppercase tracking-wider block flex items-center gap-1">
                                    <Key size={10} className="text-amber-500" />
                                    Mật khẩu mới (Để trống nếu giữ nguyên)
                                </label>
                                <input
                                    type="password"
                                    value={editStaffPassword}
                                    onChange={(e) => setEditStaffPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500 transition text-sm"
                                    minLength={6}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditStaffModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition text-xs uppercase tracking-wider"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingStaff || isUploadingFile}
                                    className="flex-1 py-3 rounded-xl bg-amber-550 hover:bg-amber-600 text-white font-bold transition text-xs uppercase tracking-wider shadow-lg shadow-amber-550/15"
                                >
                                    {isUpdatingStaff ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}