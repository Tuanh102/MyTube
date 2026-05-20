"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, Lock } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function StaffLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError('');
        
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            
            // Dùng chung Proxy với Admin vì chúng ta chỉ phân biệt bằng Role
            const res = await fetch('/api/admin/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decoded)
            });

            const data = await res.json();

            if (res.ok) {
                if (data.admin.role !== 'STAFF' && data.admin.role !== 'ADMIN') {
                     setError('Tài khoản này không có quyền Nhân viên');
                     return;
                }
                localStorage.setItem('staff_token', JSON.stringify(data.admin));
                router.push('/staff');
            } else {
                setError(data.message || 'Bạn không có quyền truy cập khu vực nhân viên');
            }
        } catch (err) {
            setError('Lỗi kết nối hệ thống nhân viên');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId="749586632500-o84g24hihlvm6hoou2st5919r645lmv4.apps.googleusercontent.com">
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-red-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20">
                                <Users size={40} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Cổng Nhân Viên</h1>
                            <p className="text-white/40 text-sm">Hệ thống kiểm duyệt nội dung MyTube</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Đăng nhập thất bại')}
                                    theme="filled_black"
                                    shape="pill"
                                    width="320"
                                />
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between text-white/20 text-[10px] font-bold uppercase">
                            <span>V 1.0.4 - STAFF ONLY</span>
                            <span>© 2026 MyTube</span>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}
