"use client";
 
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
 
export default function PaymentSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, update } = useSession();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
 
    const videoId = searchParams.get('videoId');
    const orderId = searchParams.get('orderId');
    const isPremium = videoId === 'PREMIUM_MONTH' || videoId === 'PREMIUM_6MONTHS' || videoId === 'PREMIUM_YEAR';
 
    useEffect(() => {
        const user = session?.user as any;
        const verifyPayment = async () => {
            if (!user?.id || !videoId) return;
 
            try {
                const res = await fetch('/api/payments/verify-success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, videoId, orderId: Number(orderId) })
                });
 
                if (res.ok) {
                    // Cập nhật session NextAuth ngay lập tức để đồng bộ danh sách purchased_videos & premium!
                    try {
                        const profileRes = await fetch(`/api/users/profile/${user.id}`);
                        if (profileRes.ok) {
                            const freshUser = await profileRes.json();
                            await update({
                                ...session,
                                user: {
                                    ...session?.user,
                                    is_premium: freshUser.is_premium || false,
                                    purchased_videos: freshUser.purchased_videos || []
                                }
                            });
                            console.log('[PAYMENT SUCCESS] Đã cập nhật session với profile mới nhất từ DB:', freshUser.purchased_videos);
                        }
                    } catch (syncErr) {
                        console.error('[PAYMENT SUCCESS] Không thể đồng bộ session:', syncErr);
                    }
                    
                    setStatus('success');
                    
                    // Tự động chuyển hướng
                    setTimeout(() => {
                        if (isPremium) {
                            router.push('/');
                        } else {
                            router.push(`/watch/${videoId}`);
                        }
                    }, 4000);
                } else {
                    setStatus('error');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };
 
        if (user?.id && videoId) {
            verifyPayment();
        }
    }, [session, videoId, router, isPremium]);
 
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#282828] rounded-3xl p-8 text-center shadow-2xl border border-white/10">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Đang xác thực giao dịch...</h1>
                        <p className="text-white/60">
                            {isPremium 
                              ? "Vui lòng chờ trong giây lát, chúng tôi đang kích hoạt quyền lợi Premium cho bạn."
                              : "Vui lòng chờ trong giây lát, chúng tôi đang mở khóa video cho bạn."
                            }
                        </p>
                    </div>
                )}
 
                {status === 'success' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                        <CheckCircle className="w-20 h-20 text-[#00b082] mx-auto animate-bounce" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                            {isPremium ? "Premium Đã Sẵn Sàng!" : "Thanh toán thành công!"}
                        </h1>
                        <p className="text-white/80 text-base leading-relaxed">
                            {isPremium 
                              ? "Chúc mừng bạn! Tài khoản đã được nâng cấp lên MyTube Premium thành công. Toàn bộ quảng cáo đã bị loại bỏ!"
                              : "Cảm ơn bạn đã ủng hộ tác giả. Video đã được mở khóa và sẵn sàng thưởng thức."
                            }
                        </p>
                        <div className="pt-6">
                            <button 
                                onClick={() => router.push(isPremium ? '/' : `/watch/${videoId}`)}
                                className="w-full bg-white text-black py-3.5 rounded-xl font-bold hover:bg-white/90 transition shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                {isPremium ? "Khám phá MyTube Premium ngay" : "Xem video ngay"}
                            </button>
                        </div>
                    </div>
                )}
 
                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-red-500 text-4xl font-bold">!</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Có lỗi xảy ra</h1>
                        <p className="text-white/60">Chúng tôi không thể xác thực giao dịch này. Vui lòng liên hệ hỗ trợ.</p>
                        <button 
                            onClick={() => router.push('/')}
                            className="w-full bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition"
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
