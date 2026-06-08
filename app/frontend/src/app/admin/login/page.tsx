"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function AdminLoginPage() {
    const router = useRouter();
    const { theme } = useUI();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<1 | 2>(1); // 1: Nhập SĐT, 2: Nhập OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const logoRef = useRef<HTMLDivElement | null>(null);

    // Audio frequency decoration controls
    const [gainAngle, setGainAngle] = useState(45);
    const [freqAngle, setFreqAngle] = useState(90);
    const [filterAngle, setFilterAngle] = useState(180);

    const amplitudeRef = useRef(25);
    const targetAmplitudeRef = useRef(25);
    const frequencyRef = useRef(0.015);
    const targetFrequencyRef = useRef(0.015);

    // Clock display state
    const [clockStr, setClockStr] = useState('00:00:00');

    // Page success transition overlay state
    const [transitionActive, setTransitionActive] = useState(false);

    // Clock update loop
    useEffect(() => {
        const updateClock = () => {
            setClockStr(new Date().toTimeString().split(' ')[0] + ' // UTC+7');
        };
        const interval = setInterval(updateClock, 1000);
        updateClock();
        return () => clearInterval(interval);
    }, []);

    // OTP Resend Countdown
    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [countdown]);

    // Background Canvas Oscilloscope threads drawing
    const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const bgCanvas = bgCanvasRef.current;
        if (!bgCanvas) return;
        const bgCtx = bgCanvas.getContext('2d');
        if (!bgCtx) return;

        let bgW = bgCanvas.width = window.innerWidth;
        let bgH = bgCanvas.height = window.innerHeight;

        const handleResize = () => {
            if (bgCanvas) {
                bgW = bgCanvas.width = window.innerWidth;
                bgH = bgCanvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);

        let bgPhase = 0;
        let animationFrameId: number;

        function drawBackgroundWaves() {
            if (!bgCtx || !bgCanvas) return;
            bgCtx.clearRect(0, 0, bgW, bgH);

            // 1. Draw static faint grid coordinates on background
            bgCtx.strokeStyle = 'rgba(239, 68, 68, 0.02)';
            bgCtx.lineWidth = 0.5;
            for (let x = 0; x < bgW; x += 60) {
                bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, bgH); bgCtx.stroke();
            }
            for (let y = 0; y < bgH; y += 60) {
                bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(bgW, y); bgCtx.stroke();
            }

            bgCtx.lineWidth = 1.25;
            
            // 2. Draw background wave threads (horizontal sweep)
            for (let w = 0; w < 2; w++) {
                bgCtx.strokeStyle = `rgba(239, 68, 68, ${0.15 + (w * 0.08)})`;
                bgCtx.beginPath();
                
                for (let x = 0; x < bgW; x += 4) {
                    const y = bgH / 2 + 
                        Math.sin(x * 0.0035 + bgPhase + w * 2.2) * 35 + 
                        Math.sin(x * 0.008 - bgPhase) * 8;
                        
                    if (x === 0) bgCtx.moveTo(x, y);
                    else bgCtx.lineTo(x, y);
                }
                bgCtx.stroke();
            }

            // 3. Draw dancing Equalizers in the bottom corners (Faint Red)
            const eqBars = 14;
            const barW = 4;
            const barG = 4;
            const eqHeightMax = 50;
            bgCtx.fillStyle = 'rgba(239, 68, 68, 0.07)';

            // Bottom-Left Equalizer
            for (let i = 0; i < eqBars; i++) {
                const hVal = Math.max(3, (Math.sin(bgPhase * 3.5 + i * 0.45) * 0.5 + 0.5) * eqHeightMax * (0.4 + Math.random() * 0.6));
                const x = 50 + i * (barW + barG);
                const y = bgH - 60 - hVal;
                bgCtx.fillRect(x, y, barW, hVal);
            }
            
            // Bottom-Right Equalizer
            for (let i = 0; i < eqBars; i++) {
                const hVal = Math.max(3, (Math.cos(bgPhase * 3.5 + i * 0.45) * 0.5 + 0.5) * eqHeightMax * (0.4 + Math.random() * 0.6));
                const x = bgW - 50 - (eqBars - i) * (barW + barG);
                const y = bgH - 60 - hVal;
                bgCtx.fillRect(x, y, barW, hVal);
            }

            // 4. Draw side level meter stacks (vertical blocks fluctuating)
            const meterBlocks = 10;
            const blockH = 3;
            const blockW = 10;
            const blockG = 3;
            for (let i = 0; i < meterBlocks; i++) {
                const activeLimit = Math.floor((Math.sin(bgPhase * 1.8 + i * 0.25) * 0.5 + 0.5) * meterBlocks);
                const isActive = i < activeLimit;
                
                bgCtx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.015)';
                
                // Left vertical meter
                bgCtx.fillRect(40, 80 + i * (blockH + blockG), blockW, blockH);
                // Right vertical meter
                bgCtx.fillRect(bgW - 40 - blockW, 80 + i * (blockH + blockG), blockW, blockH);
            }

            bgPhase += 0.006;
            animationFrameId = requestAnimationFrame(drawBackgroundWaves);
        }

        drawBackgroundWaves();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // VU meter initialization & updates
    const vuLeftRef = useRef<HTMLDivElement | null>(null);
    const vuRightRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const vuLeft = vuLeftRef.current;
        const vuRight = vuRightRef.current;
        if (!vuLeft || !vuRight) return;

        const ledCount = 18;
        vuLeft.innerHTML = '';
        vuRight.innerHTML = '';

        for (let i = 0; i < ledCount; i++) {
            const ledL = document.createElement('div');
            ledL.className = 'h-0.5 w-full bg-red-950/30 rounded-[1px] transition-colors duration-75';
            vuLeft.appendChild(ledL);

            const ledR = document.createElement('div');
            ledR.className = 'h-0.5 w-full bg-red-950/30 rounded-[1px] transition-colors duration-75';
            vuRight.appendChild(ledR);
        }

        const interval = setInterval(() => {
            amplitudeRef.current += (targetAmplitudeRef.current - amplitudeRef.current) * 0.08;
            frequencyRef.current += (targetFrequencyRef.current - frequencyRef.current) * 0.08;

            const lPower = Math.min(ledCount, Math.floor((amplitudeRef.current / 120) * ledCount + Math.random() * 2));
            const rPower = Math.min(ledCount, Math.floor((amplitudeRef.current / 120) * ledCount + Math.random() * 2));

            const lNodes = vuLeft.children;
            const rNodes = vuRight.children;

            for (let i = 0; i < ledCount; i++) {
                let activeClass = 'bg-red-950';
                if (i > 8) activeClass = 'bg-red-650';
                if (i > 13) activeClass = 'bg-red-500';

                if (i < lPower) {
                    if (lNodes[i]) lNodes[i].className = `h-0.5 w-full rounded-[1px] ${activeClass}`;
                } else {
                    if (lNodes[i]) lNodes[i].className = 'h-0.5 w-full bg-red-950/10 rounded-[1px]';
                }

                if (i < rPower) {
                    if (rNodes[i]) rNodes[i].className = `h-0.5 w-full rounded-[1px] ${activeClass}`;
                } else {
                    if (rNodes[i]) rNodes[i].className = 'h-0.5 w-full bg-red-950/10 rounded-[1px]';
                }
            }
        }, 120);

        return () => clearInterval(interval);
    }, [step]);

    // Handle Phone text typing
    const handlePhoneChange = (val: string) => {
        setPhone(val);
        targetAmplitudeRef.current = 60;
        targetFrequencyRef.current = 0.035;
        setTimeout(() => {
            const currentBaseAmplitude = 15 + (gainAngle / 360) * 45;
            const currentBaseFrequency = 0.01 + (freqAngle / 360) * 0.04;
            targetAmplitudeRef.current = currentBaseAmplitude;
            targetFrequencyRef.current = currentBaseFrequency;
        }, 350);
    };

    // OTP logic
    const handleOtpChange = (value: string, index: number) => {
        const cleanValue = value.replace(/\D/g, '');
        const newOtpArray = [...otpArray];
        if (!cleanValue) {
            newOtpArray[index] = '';
            setOtpArray(newOtpArray);
            setOtp(newOtpArray.join(''));
            return;
        }

        newOtpArray[index] = cleanValue.substring(cleanValue.length - 1);
        setOtpArray(newOtpArray);
        setOtp(newOtpArray.join(''));

        targetAmplitudeRef.current = amplitudeRef.current + 20;
        setTimeout(() => {
            const currentBaseAmplitude = 15 + (gainAngle / 360) * 45;
            targetAmplitudeRef.current = currentBaseAmplitude;
        }, 200);

        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otpArray[index] && index > 0) {
                const newOtpArray = [...otpArray];
                newOtpArray[index - 1] = '';
                setOtpArray(newOtpArray);
                setOtp(newOtpArray.join(''));
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtpArray = [...otpArray];
                newOtpArray[index] = '';
                setOtpArray(newOtpArray);
                setOtp(newOtpArray.join(''));
            }
        }
        if (e.key === 'Enter') {
            triggerAction();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
        const newOtpArray = [...otpArray];
        for (let i = 0; i < pastedData.length; i++) {
            newOtpArray[i] = pastedData[i];
        }
        setOtpArray(newOtpArray);
        setOtp(newOtpArray.join(''));
        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleResetPhone = () => {
        setStep(1);
        setOtp('');
        setOtpArray(['', '', '', '', '', '']);
        setSuccess('');
        setError('');
    };

    // Knobs adjusters
    const adjustKnob = (type: 'gain' | 'freq' | 'filter') => {
        if (type === 'gain') {
            const nextAngle = (gainAngle + 45) % 360;
            setGainAngle(nextAngle);
            const currentBaseAmplitude = 15 + (nextAngle / 360) * 45;
            targetAmplitudeRef.current = currentBaseAmplitude;
        } else if (type === 'freq') {
            const nextAngle = (freqAngle + 45) % 360;
            setFreqAngle(nextAngle);
            const currentBaseFrequency = 0.01 + (nextAngle / 360) * 0.04;
            targetFrequencyRef.current = currentBaseFrequency;
        } else if (type === 'filter') {
            setFilterAngle((filterAngle + 45) % 360);
        }
        const prevAmp = targetAmplitudeRef.current;
        targetAmplitudeRef.current = prevAmp + 15;
        setTimeout(() => {
            targetAmplitudeRef.current = prevAmp;
        }, 150);
    };

    // Form submission dispatches
    const triggerAction = async () => {
        // Trigger click animation on logo
        const logo = logoRef.current;
        if (logo) {
            logo.classList.remove('logo-click-effect');
            void logo.offsetWidth;
            logo.classList.add('logo-click-effect');
        }

        if (step === 1) {
            if (!phone.trim()) {
                setError('Vui lòng nhập số điện thoại');
                return;
            }

            setLoading(true);
            setError('');
            setSuccess('');
            targetAmplitudeRef.current = 65;
            targetFrequencyRef.current = 0.055;

            try {
                const res = await fetch('/api/admin/request-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone.trim() })
                });

                const data = await res.json();
                if (res.ok) {
                    setStep(2);
                    setSuccess('Mã OTP đã được gửi về máy chủ và Discord Bot thành công!');
                    setCountdown(120);
                    setTimeout(() => {
                        inputRefs.current[0]?.focus();
                    }, 200);
                } else {
                    setError(data.message || 'Số điện thoại này không có quyền quản trị');
                }
            } catch (err) {
                setError('Đã có lỗi xảy ra khi kết nối tới máy chủ');
            } finally {
                setLoading(false);
                const currentBaseAmplitude = 15 + (gainAngle / 360) * 45;
                const currentBaseFrequency = 0.01 + (freqAngle / 360) * 0.04;
                targetAmplitudeRef.current = currentBaseAmplitude;
                targetFrequencyRef.current = currentBaseFrequency;
            }
        } else if (step === 2) {
            const otpCode = otpArray.join('');
            if (otpCode.length < 6) {
                setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số');
                return;
            }

            setLoading(true);
            setError('');
            targetAmplitudeRef.current = 80;
            targetFrequencyRef.current = 0.07;

            let successFlag = false;
            try {
                const res = await fetch('/api/admin/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: phone.trim(),
                        otp: otpCode,
                        role: 'ADMIN'
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    sessionStorage.setItem('admin_token', JSON.stringify(data.admin));
                    setTransitionActive(true); // Smooth fade to black
                    targetAmplitudeRef.current = 5;
                    targetFrequencyRef.current = 0.003;
                    successFlag = true;
                    setTimeout(() => {
                        router.push('/admin');
                    }, 2500);
                } else {
                    setError(data.message || 'Mã OTP không chính xác hoặc đã hết hạn');
                }
            } catch (err) {
                setError('Lỗi xác thực mã OTP hệ thống');
            } finally {
                setLoading(false);
                if (!successFlag) {
                    const currentBaseAmplitude = 15 + (gainAngle / 360) * 45;
                    const currentBaseFrequency = 0.01 + (freqAngle / 360) * 0.04;
                    targetAmplitudeRef.current = currentBaseAmplitude;
                    targetFrequencyRef.current = currentBaseFrequency;
                }
            }
        }
    };

    const handleResendOtp = async () => {
        if (!phone.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setOtp('');
        setOtpArray(['', '', '', '', '', '']);

        try {
            const res = await fetch('/api/admin/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone.trim() })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('Mã OTP mới đã được gửi thành công!');
                setCountdown(120);
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 200);
            } else {
                setError(data.message || 'Số điện thoại này không có quyền quản trị');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi kết nối tới máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerAction();
    };

    return (
        <div className="min-h-screen p-6 md:p-10 flex flex-col justify-between relative bg-[#09090b] text-[#e4e4e7] overflow-hidden select-none font-mono">
            
            <style dangerouslySetInnerHTML={{ __html: `
                body {
                    background-color: #09090b !important;
                }
                .logo-dial {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    padding: 12px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .logo-dial:hover {
                    transform: scale(1.08);
                    filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.4));
                }
                .logo-dial:active {
                    transform: scale(0.95);
                }
                .logo-wrapper {
                    position: relative;
                    width: 130px;
                    height: 130px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .logo-scanner {
                    position: absolute;
                    inset: 0;
                    border: 1.5px dashed rgba(239, 68, 68, 0.25);
                    border-radius: 50%;
                    animation: rotateScanner 22s linear infinite;
                    transition: border-color 0.4s ease;
                }
                .logo-scanner::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #ef4444;
                }
                @keyframes rotateScanner {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .logo-wrapper:hover .logo-scanner {
                    border-color: rgba(239, 68, 68, 0.5);
                    animation-duration: 8s;
                }
                .eq-bar {
                    height: 4px;
                    animation: bounceBar 1.2s ease-in-out infinite alternate;
                }
                .eq-bar:nth-child(1) { animation-delay: 0.1s; animation-duration: 0.8s; }
                .eq-bar:nth-child(2) { animation-delay: 0.35s; animation-duration: 1.1s; }
                .eq-bar:nth-child(3) { animation-delay: 0.2s; animation-duration: 0.9s; }
                .eq-bar:nth-child(4) { animation-delay: 0.6s; animation-duration: 1.3s; }
                .eq-bar:nth-child(5) { animation-delay: 0.15s; animation-duration: 0.75s; }
                .eq-bar:nth-child(6) { animation-delay: 0.45s; animation-duration: 1.0s; }
                .eq-bar:nth-child(7) { animation-delay: 0.3s; animation-duration: 1.2s; }
                .eq-bar:nth-child(8) { animation-delay: 0.5s; animation-duration: 0.85s; }
                .eq-bar:nth-child(9) { animation-delay: 0.25s; animation-duration: 1.15s; }
                .eq-bar:nth-child(10) { animation-delay: 0.55s; animation-duration: 0.95s; }
                .eq-bar:nth-child(11) { animation-delay: 0.4s; animation-duration: 1.4s; }
                .eq-bar:nth-child(12) { animation-delay: 0.2s; animation-duration: 0.7s; }
                @keyframes bounceBar {
                    0% { height: 4px; background-color: rgba(239, 68, 68, 0.25); }
                    50% { height: 26px; background-color: rgba(239, 68, 68, 0.7); }
                    100% { height: 8px; background-color: rgba(239, 68, 68, 0.4); }
                }
                @keyframes logoClickAnim {
                    0% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.4)); }
                    20% { transform: scale(0.85) rotate(-15deg); filter: drop-shadow(0 0 25px rgba(239, 68, 68, 0.8)); }
                    60% { transform: scale(1.15) rotate(375deg); filter: drop-shadow(0 0 35px rgba(239, 68, 68, 0.9)); }
                    100% { transform: scale(1) rotate(360deg); filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.4)); }
                }
                .logo-click-effect {
                    animation: logoClickAnim 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                .stark-input-line {
                    background-color: transparent !important;
                    border: none !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
                    color: #ffffff !important;
                    border-radius: 0px !important;
                    outline: none !important;
                    transition: all 0.3s ease;
                }
                .stark-input-line:focus {
                    border-bottom-color: #ef4444 !important;
                    padding-left: 4px;
                }
                .rotary-knob {
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    background-color: rgba(0, 0, 0, 0.4);
                    transition: border-color 0.3s ease, background-color 0.3s ease;
                }
                .rotary-knob:hover {
                    border-color: #ef4444;
                    background-color: rgba(239, 68, 68, 0.05);
                }
                .console-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .console-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .console-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(239, 68, 68, 0.25);
                    border-radius: 1px;
                }
            `}} />

            {/* Fullscreen Background Waves */}
            <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none"></canvas>

            {/* TOP HUD */}
            <header className="w-full flex justify-between items-start z-10 text-[9px] opacity-50 tracking-wider">
                <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        <span>MYTUBE AV_DECK CORE // ADMIN // v1.5.0</span>
                    </div>
                    <div>DECRYPT: AUDIO-VISUAL_MATRIX</div>
                </div>
                <div className="hidden sm:flex items-center gap-4 border border-red-950/20 bg-black/25 px-3 py-1.5 rounded text-[8px]">
                    <span>SECURE SHELL</span>
                    <span className="text-red-900/40">|</span>
                    <span>SSL CHANNELS</span>
                </div>
                <div className="text-right text-[9px] font-bold">
                    {clockStr}
                </div>
            </header>

            {/* MAIN INTERACTIVE AREA */}
            <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-between z-10 gap-10 py-6">
                
                {/* Left Column: Logo & Scanner */}
                <div className="flex flex-col items-center gap-6 shrink-0 p-4 w-full lg:w-[240px]">
                    <div className="logo-wrapper">
                        <div className="logo-scanner"></div>
                        <div ref={logoRef} onClick={triggerAction} id="action-dial" className="logo-dial select-none">
                            <img 
                                src="/assets/img/logoMyTube.png" 
                                alt="MyTube Logo" 
                                className="w-16 h-auto object-contain transition-transform duration-300" 
                            />
                        </div>
                    </div>
                    <div className="text-center font-mono space-y-1">
                        <span className="text-[7px] font-bold uppercase tracking-widest block" id="dial-label">CLICK LOGO TO SUBMIT</span>
                        <span className="text-[6px] opacity-35 font-bold" id="dial-sub">
                            {step === 1 ? 'STATUS: STANDBY // GATEWAY_LOCK' : 'STATUS: AWAITING OTP // Discord API'}
                        </span>
                    </div>
                    {/* Dynamic Equalizer Visualizer */}
                    <div className="flex items-end justify-center gap-1 h-12 mt-2 w-[150px] opacity-70 border-b border-red-950/20 pb-1" id="deck-equalizer">
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                        <div className="eq-bar w-1.5 bg-red-800/60 rounded-t-sm"></div>
                    </div>
                </div>

                {/* Center Column: FormWrapper Card */}
                <div className="flex-1 w-full max-w-lg space-y-6 p-2 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="h-[2px] w-6 bg-red-600"></div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none" style={{ color: '#ffffff' }}>
                            ADMIN <span className="text-red-500">GATEWAY</span>
                        </h1>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-300" style={{ opacity: 0.85 }}>
                            {step === 1 ? 'system standby // input admin credentials' : 'system: token broadcasted. input security key'}
                        </p>
                    </div>

                    {/* Alert Boxes */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs flex items-center gap-3 font-semibold animate-pulse">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-3 font-semibold">
                            <CheckCircle2 size={16} className="flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Forms */}
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold block text-red-500" style={{ opacity: 0.9 }}>01. Phone Identifier (Admin)</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                            placeholder="NHẬP SỐ ĐIỆN THOẠI ADMIN..." 
                                            className="w-full stark-input-line py-2.5 pr-8 text-xs font-semibold tracking-widest bg-transparent text-white"
                                            disabled={loading}
                                            autoComplete="off"
                                            required
                                        />
                                        <button type="submit" disabled={loading} className="absolute right-0 text-red-500 hover:text-red-400 p-1 transition-transform hover:translate-x-0.5 cursor-pointer">
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-300 font-medium italic" style={{ opacity: 0.75 }}>Nhập số điện thoại Admin và nhấn Enter hoặc click logo để truyền phát mã OTP bảo mật.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[8px] uppercase tracking-widest opacity-45 font-bold block text-red-500">02. Discord Verification Key</label>
                                        <button type="button" onClick={handleResetPhone} className="text-[8px] text-red-500 hover:text-red-400 uppercase font-mono tracking-widest">[Back]</button>
                                    </div>
                                    {/* OTP Boxes Grid */}
                                    <div className="flex items-center gap-3">
                                        <div className="grid grid-cols-6 gap-2 flex-1">
                                            {otpArray.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                                                    ref={(el) => {
                                                        inputRefs.current[idx] = el;
                                                    }}
                                                    className="otp-field w-full aspect-square bg-transparent border-b border-white/10 text-center font-bold text-base focus:border-red-500 focus:outline-none transition-all text-white"
                                                    disabled={loading}
                                                    required
                                                />
                                            ))}
                                        </div>
                                        <button type="submit" disabled={loading} className="text-red-500 hover:text-red-400 p-2 transition-transform hover:translate-x-0.5 cursor-pointer flex-shrink-0">
                                            <ArrowRight size={22} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-center text-xs">
                                    {countdown > 0 ? (
                                        <span className="text-white/30 italic">Có thể gửi lại mã sau {countdown} giây</span>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="text-red-500 hover:text-red-400 font-bold flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RefreshCw size={12} /> Gửi lại mã OTP
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Knobs Footer */}
                    <div className="flex gap-4 border-t border-red-950/20 pt-5">
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[6px] font-bold text-white/30 tracking-widest uppercase">AMP GAIN</span>
                            <div className="rotary-knob w-8 h-8 rounded-full relative flex items-center justify-center cursor-pointer" onClick={() => adjustKnob('gain')}>
                                <div style={{ transform: `translateX(-50%) rotate(${gainAngle}deg)` }} className="absolute w-0.5 h-2.5 bg-red-600 top-0.5 left-1/2 origin-bottom transition-transform duration-200"></div>
                                <span className="text-[5px] font-bold opacity-20">AM</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[6px] font-bold text-white/30 tracking-widest uppercase">FREQ RATE</span>
                            <div className="rotary-knob w-8 h-8 rounded-full relative flex items-center justify-center cursor-pointer" onClick={() => adjustKnob('freq')}>
                                <div style={{ transform: `translateX(-50%) rotate(${freqAngle}deg)` }} className="absolute w-0.5 h-2.5 bg-red-600 top-0.5 left-1/2 origin-bottom transition-transform duration-200"></div>
                                <span className="text-[5px] font-bold opacity-20">FR</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[6px] font-bold text-white/30 tracking-widest uppercase">NOISE FLTR</span>
                            <div className="rotary-knob w-8 h-8 rounded-full relative flex items-center justify-center cursor-pointer" onClick={() => adjustKnob('filter')}>
                                <div style={{ transform: `translateX(-50%) rotate(${filterAngle}deg)` }} className="absolute w-0.5 h-2.5 bg-red-600 top-0.5 left-1/2 origin-bottom transition-transform duration-200"></div>
                                <span className="text-[5px] font-bold opacity-20">FT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: VU Meter Column */}
                <div className="border border-red-950/20 bg-black/20 flex flex-col items-center justify-between h-[240px] py-4 px-2.5 rounded-xl shrink-0 w-10 hidden md:flex">
                    <span className="text-[6px] opacity-40 font-bold tracking-widest">VU_L</span>
                    <div className="flex gap-1 flex-1 py-3">
                        <div ref={vuLeftRef} className="flex flex-col-reverse justify-between h-full w-1" id="vu-left"></div>
                        <div ref={vuRightRef} className="flex flex-col-reverse justify-between h-full w-1" id="vu-right"></div>
                    </div>
                    <span className="text-[6px] opacity-40 font-bold tracking-widest">VU_R</span>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="w-full flex justify-between items-center z-10 text-[8px] opacity-30 border-t border-white/5 pt-4">
                <div>SYS_LOC: //127.0.0.1:27017</div>
                <div className="font-bold tracking-widest">MyTube AV-DECK SECURITY GATEWAY // ADMIN_PORTAL</div>
                <div>V1.5.0 • © 2026 MYTUBE AV NETWORK</div>
            </footer>

            {/* Futuristic Page Transition Overlay */}
            <div id="transition-overlay" className={`fixed inset-0 bg-black z-50 transition-all duration-1000 ease-in-out flex items-center justify-center ${transitionActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`text-center space-y-4 transform transition-all duration-1000 delay-300 ${transitionActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <img 
                        src="/assets/img/logoMyTube.png" 
                        alt="MyTube Logo" 
                        className="h-12 w-auto mx-auto animate-pulse" 
                    />
                    <div className="h-[1px] w-24 bg-red-600 mx-auto"></div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold">Awaiting Secure Link...</div>
                </div>
            </div>

        </div>
    );
}
