"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, LogIn, Tv, Volume2 } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Số điện thoại hoặc mật khẩu không đúng');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50" />
      
      <div className="relative w-full max-w-[850px] animate-in fade-in zoom-in duration-700">
        
        {/* ANTENNAS */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none">
          <div className="absolute bottom-0 left-10 w-1.5 h-32 bg-gradient-to-t from-[#333] to-[#555] origin-bottom -rotate-[25deg] rounded-full shadow-lg" />
          <div className="absolute bottom-0 right-10 w-1.5 h-20 bg-gradient-to-t from-[#333] to-[#555] origin-bottom rotate-[15deg] rounded-full shadow-lg" />
        </div>

        {/* TV BODY */}
        <div className="bg-[#1a1a1a] p-5 rounded-[50px] shadow-[0_0_100px_rgba(0,0,0,1),inset_0_2px_10px_rgba(255,255,255,0.1)] border-[10px] border-[#222] relative z-10">
          
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
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-600/10 mb-3 border border-red-600/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                      <Tv className="text-red-600" size={28} />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">MyTube Channel</h1>
                    <p className="text-white/30 text-[10px] mt-1 uppercase tracking-[0.3em]">Signal: Verified</p>
                  </div>

                  {registered && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-xl text-xs mb-4 text-center animate-pulse">
                      Đăng ký thành công! Hãy đăng nhập.
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="group relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-red-600/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                        required
                      />
                    </div>

                    <div className="group relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        type="password" 
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-red-600/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-[0.98]"
                    >
                      {loading ? 'Đang kết nối...' : (
                        <>
                          <LogIn size={20} />
                          Đăng nhập
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* BOTTOM LINK INSIDE SCREEN */}
                <div className="pt-6 w-full text-center border-t border-white/5 mt-4">
                  <p className="text-xs text-white/30">
                    Bạn chưa có tài khoản?{' '}
                    <Link href="/register" className="text-red-500 hover:text-red-400 font-bold transition-colors">Đăng ký ngay</Link>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: THE CONTROLS (2/10 parts) */}
            <div className="hidden md:flex flex-[2] flex-col justify-between py-8 px-2 border-l border-white/5">
              <div className="space-y-8">
                {/* Dial Knobs */}
                <div className="flex flex-col items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-[#111] border-4 border-[#222] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center relative group cursor-pointer active:rotate-45 transition-transform">
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-red-600 rounded-full" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#111] border-4 border-[#222] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center relative group cursor-pointer active:-rotate-90 transition-transform">
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-white/10 rounded-full" />
                  </div>
                </div>

                {/* Speaker Grill */}
                <div className="space-y-2 opacity-20 px-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-1 bg-black rounded-full shadow-inner" />
                  ))}
                  <div className="flex justify-center pt-2">
                    <Volume2 size={16} className="text-white/20" />
                  </div>
                </div>
              </div>

              {/* Power & Social Buttons */}
              <div className="flex flex-col items-center gap-4">
                 <button 
                  onClick={() => signIn('google')}
                  className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group active:scale-90"
                  title="Đăng nhập bằng Google"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                 <button 
                  onClick={() => signIn('facebook')}
                  className="w-12 h-12 rounded-2xl bg-[#1877F2] flex items-center justify-center hover:bg-[#166FE5] transition-all shadow-[0_0_20px_rgba(24,119,242,0.2)] group active:scale-90"
                  title="Đăng nhập bằng Facebook"
                >
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                <div className="flex flex-col items-center gap-1 mt-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)] animate-pulse" />
                  <span className="text-[8px] text-white/20 font-bold uppercase">Power</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TV STAND */}
        <div className="flex justify-around px-28 -mt-2">
           <div className="w-14 h-8 bg-[#1a1a1a] rounded-b-3xl border-x-[6px] border-b-[6px] border-[#111] shadow-2xl" />
           <div className="w-14 h-8 bg-[#1a1a1a] rounded-b-3xl border-x-[6px] border-b-[6px] border-[#111] shadow-2xl" />
        </div>
      </div>
    </div>
  );
}
