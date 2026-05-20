"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Lock, ArrowRight, Tv, Volume2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const router = useRouter();

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, password }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50" />
      
      <div className="relative w-full max-w-[850px] animate-in slide-in-from-bottom-10 duration-700">
        
        {/* ANTENNAS */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none">
          <div className="absolute bottom-0 left-10 w-1.5 h-32 bg-gradient-to-t from-[#333] to-[#555] origin-bottom -rotate-[25deg] rounded-full shadow-lg" />
          <div className="absolute bottom-0 right-10 w-1.5 h-20 bg-gradient-to-t from-[#333] to-[#555] origin-bottom rotate-[15deg] rounded-full shadow-lg" />
        </div>

        {/* TV BODY */}
        <div className="bg-[#1a1a1a] p-5 rounded-[50px] shadow-[0_0_100px_rgba(0,0,0,1)] border-[10px] border-[#222] relative z-10">
          
          <div className="flex flex-col md:flex-row gap-5 aspect-[16/10] md:aspect-[16/9]">
            
            {/* LEFT: THE SCREEN (8/10 parts) */}
            <div className="flex-[8] relative bg-[#000] rounded-[35px] overflow-hidden border-4 border-[#111] shadow-[inset_0_0_80px_rgba(255,0,0,0.05)]">
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.04] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              
              {/* REAL-TIME CLOCK */}
              <div className="absolute top-6 left-8 z-30 text-[10px] font-mono text-red-600/80 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                {time.toLocaleTimeString('vi-VN')}
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-between p-8 md:p-10 z-10">
                <div className="w-full max-w-sm my-auto">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Registration</h1>
                    <p className="text-white/30 text-[10px] mt-1 uppercase tracking-[0.3em]">Connecting to MyTube Network...</p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Tên người dùng"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-red-600/50 transition-all"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-red-600/50 transition-all"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        type="password" 
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-red-600/50 transition-all"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-[0.98]"
                    >
                      {loading ? 'Đang gửi dữ liệu...' : (
                        <>
                          Đăng ký ngay
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* BOTTOM LINK INSIDE SCREEN */}
                <div className="pt-6 w-full text-center border-t border-white/5 mt-4">
                  <p className="text-xs text-white/30">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-red-500 hover:text-red-400 font-bold transition-colors">Đăng nhập ngay</Link>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: THE CONTROLS (2/10 parts) */}
            <div className="hidden md:flex flex-[2] flex-col justify-between py-8 px-2 border-l border-white/5">
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-[#111] border-4 border-[#222] shadow-lg" />
                  <div className="w-14 h-14 rounded-full bg-[#111] border-4 border-[#222] shadow-lg" />
                </div>
                <div className="space-y-2 opacity-20 px-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-1 bg-black rounded-full" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] animate-pulse" />
                <span className="text-[8px] text-white/20 font-bold uppercase">Active</span>
              </div>
            </div>

          </div>
        </div>

        {/* TV STAND */}
        <div className="flex justify-around px-28 -mt-2">
           <div className="w-14 h-8 bg-[#1a1a1a] rounded-b-3xl border-x-[6px] border-b-[6px] border-[#111]" />
           <div className="w-14 h-8 bg-[#1a1a1a] rounded-b-3xl border-x-[6px] border-b-[6px] border-[#111]" />
        </div>

      </div>
    </div>
  );
}
