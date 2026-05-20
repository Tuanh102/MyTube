"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight, Layout, Lock } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError('');
        
        try {
            // Giải mã token từ Google bằng hàm chuẩn v4
            const decoded: any = jwtDecode(credentialResponse.credential);
            
            // Gửi dữ liệu qua API Proxy cục bộ của Next.js
            const res = await fetch('/api/admin/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decoded)
            });

            const data = await res.json();

            if (res.ok) {
                // Lưu token admin riêng biệt, không liên quan tới User
                localStorage.setItem('admin_token', JSON.stringify(data.admin));
                router.push('/admin');
            } else {
                setError(data.message || 'Bạn không có quyền truy cập quản trị');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Đã có lỗi xảy ra khi kết nối Server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId="749586632500-o84g24hihlvm6hoou2st5919r645lmv4.apps.googleusercontent.com">
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-red-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                                <Shield size={40} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Quản trị MyTube</h1>
                            <p className="text-white/40 text-sm">Hệ thống quản trị nội dung và tài chính</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Đăng nhập Google thất bại')}
                                    useOneTap
                                    theme="filled_black"
                                    shape="pill"
                                    text="continue_with"
                                    width="320"
                                />
                            </div>

                            <div className="relative py-4 flex items-center gap-4">
                                <div className="flex-1 h-px bg-white/5"></div>
                                <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Hoặc dành cho Staff</span>
                                <div className="flex-1 h-px bg-white/5"></div>
                            </div>

                            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group">
                                <Lock size={18} />
                                <span>Đăng nhập bằng tài khoản nội bộ</span>
                            </button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-wider">
                                <Layout size={12} />
                                <span>V 1.0.4</span>
                            </div>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider">© 2026 MyTube Studio</p>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}
