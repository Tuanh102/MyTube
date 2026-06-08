"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function StaffLoginPage() {
    const router = useRouter();
    const { theme } = useUI();

    // Auth & Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [generatedCaptcha, setGeneratedCaptcha] = useState('');
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 3: Success Decryption
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // UI Visual States
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSuccessState, setIsSuccessState] = useState(false);
    const [activeTab, setActiveTab] = useState<'labor' | 'security' | 'procedures' | 'operations'>('labor');

    // Clock State
    const [clockStr, setClockStr] = useState('00:00:00');

    // Robot mascot state
    const [robotEyeState, setRobotEyeState] = useState<'normal' | 'scanning' | 'happy' | 'error'>('normal');
    const [eyeX, setEyeX] = useState(0);
    const [eyeY, setEyeY] = useState(0);
    const [isShaking, setIsShaking] = useState(false);

    // New Interactive Robot States
    const [headX, setHeadX] = useState(0);
    const [headY, setHeadY] = useState(0);
    const [headRotate, setHeadRotate] = useState(0);
    const [isTickled, setIsTickled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [speechText, setSpeechText] = useState('Chào đồng chí! Sẵn sàng trực ca chưa?');

    const robotCircleRef = useRef<HTMLDivElement>(null);

    // 1. Initialize clock
    useEffect(() => {
        const updateClock = () => {
            setClockStr(new Date().toTimeString().split(' ')[0]);
        };
        const interval = setInterval(updateClock, 1000);
        updateClock();
        return () => clearInterval(interval);
    }, []);

    // 2. Initialize Captcha
    const generateNewCaptcha = () => {
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const numbers = '23456789';
        let captcha = '';
        // Guarantee at least 1 letter and 1 number for mix
        captcha += letters.charAt(Math.floor(Math.random() * letters.length));
        captcha += numbers.charAt(Math.floor(Math.random() * numbers.length));
        const combined = letters + numbers;
        captcha += combined.charAt(Math.floor(Math.random() * combined.length));
        captcha += combined.charAt(Math.floor(Math.random() * combined.length));
        
        // Shuffle the characters
        captcha = captcha.split('').sort(() => Math.random() - 0.5).join('');
        
        setGeneratedCaptcha(captcha);
        setCaptchaInput('');
    };

    useEffect(() => {
        generateNewCaptcha();
    }, []);

    // 3. Eye tracking coordinates computation
    const handleInputChange = (val: string) => {
        if (isSuccessState) return;
        const len = val.length;
        const maxTrackLen = 22;
        const percentage = Math.min(len / maxTrackLen, 1);
        const tx = -5.5 + (percentage * 11);
        const ty = 3.5;
        setEyeX(tx);
        setEyeY(ty);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isSuccessState || isTickled) return;

        const activeEl = document.activeElement;
        const isFocused = activeEl?.id === 'email' || activeEl?.id === 'password' || activeEl?.id === 'captcha-input';
        if (isFocused) return;

        if (!robotCircleRef.current) return;

        const rect = robotCircleRef.current.getBoundingClientRect();
        const robotCenterX = rect.left + rect.width / 2;
        const robotCenterY = rect.top + rect.height / 2;

        const dx = e.clientX - robotCenterX;
        const dy = e.clientY - robotCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxHeadMove = 4; 
        const maxEyeMove = 4.5;

        if (distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            
            const intensity = Math.min(distance / 250, 1); 
            
            const hx = nx * maxHeadMove * intensity;
            const hy = ny * maxHeadMove * intensity;
            const ex = nx * maxEyeMove * intensity;
            const ey = ny * maxEyeMove * intensity;

            let rot = dx / 40; 
            if (rot > 8) rot = 8;
            if (rot < -8) rot = -8;

            setHeadX(hx);
            setHeadY(hy);
            setHeadRotate(rot);

            if (robotEyeState === 'normal') {
                setEyeX(ex);
                setEyeY(ey);
            }
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (isSuccessState || isTickled) return;

        const activeEl = document.activeElement;
        const isFocused = activeEl?.id === 'email' || activeEl?.id === 'password' || activeEl?.id === 'captcha-input';
        if (isFocused) return;

        setHeadX(0);
        setHeadY(0);
        setHeadRotate(0);
        setEyeX(0);
        setEyeY(0);
    };

    const handleInputBlur = () => {
        if (isSuccessState) return;
        setTimeout(() => {
            const activeEl = document.activeElement;
            if (activeEl?.id !== 'email' && activeEl?.id !== 'password' && activeEl?.id !== 'captcha-input') {
                setEyeX(0);
                setEyeY(0);
                setHeadX(0);
                setHeadY(0);
                setHeadRotate(0);
                if (robotEyeState === 'scanning') {
                    setRobotEyeState('normal');
                }
                setSpeechText("Tôi vẫn đang canh gác hệ thống!");
            }
        }, 80);
    };

    const handleEmailFocus = (val: string) => {
        if (isSuccessState) return;
        setError('');
        setSuccess('');
        setRobotEyeState('normal');
        
        setHeadX(-1.5);
        setHeadY(3);
        setHeadRotate(-2);
        
        handleInputChange(val);
        setSpeechText("Nhập ID nhân viên của bạn vào đây nhé.");
    };

    const handlePasswordFocus = () => {
        if (isSuccessState) return;
        setError('');
        setSuccess('');
        if (isPasswordVisible) {
            setRobotEyeState('normal');
            setHeadX(1.5);
            setHeadY(3);
            setHeadRotate(2);
            handleInputChange(password);
            setSpeechText("Mật khẩu đang hiển thị, hãy cẩn thận xung quanh!");
        } else {
            setRobotEyeState('scanning');
            setHeadX(0);
            setHeadY(4);
            setHeadRotate(0);
            setEyeX(0);
            setEyeY(0);
            setSpeechText("Suỵt! Tôi nhắm mắt rồi, bạn nhập mật khẩu đi.");
        }
    };

    const handleCaptchaFocus = (val: string) => {
        if (isSuccessState) return;
        setError('');
        setSuccess('');
        setRobotEyeState('normal');
        
        setHeadX(0);
        setHeadY(3.5);
        setHeadRotate(0);
        
        handleInputChange(val);
        setSpeechText("Nhập mã xác thực captcha ở kế bên nha.");
    };

    const togglePasswordVisibility = () => {
        const nextVisible = !isPasswordVisible;
        setIsPasswordVisible(nextVisible);

        if (nextVisible) {
            setRobotEyeState('normal');
            setHeadX(1.5);
            setHeadY(3);
            setHeadRotate(2);
            handleInputChange(password);
            setSpeechText("Ồ, bạn đang cho hiện mật khẩu à? Trông bảo mật đấy!");
        } else {
            setRobotEyeState('scanning');
            setHeadX(0);
            setHeadY(4);
            setHeadRotate(0);
            setEyeX(0);
            setEyeY(0);
            setSpeechText("Đã kích hoạt quét bảo mật, che mắt lại rồi nha!");
        }
    };

    const handleRobotClick = () => {
        if (isSuccessState || isTickled) return;
        setIsTickled(true);
        
        const oldEyeState = robotEyeState;
        setRobotEyeState('happy');
        
        const giggleTexts = [
            "Haha, nhột quá! Đừng chọc tôi chứ!",
            "Ái chà! Bạn vừa chạm vào tôi đấy nhé!",
            "Bíp bíp! Hệ thống đang hoạt động ổn định!",
            "Chọt léc hả? Tôi là robot mà, không biết nhột đâu!",
            "Xin chào! Cùng làm việc chăm chỉ nhé!"
        ];
        const randomGiggle = giggleTexts[Math.floor(Math.random() * giggleTexts.length)];
        setSpeechText(randomGiggle);

        let tickCount = 0;
        const interval = setInterval(() => {
            setHeadRotate(tickCount % 2 === 0 ? 12 : -12);
            setHeadX(tickCount % 2 === 0 ? 3 : -3);
            setHeadY(tickCount % 2 === 0 ? -1 : 1);
            tickCount++;
            if (tickCount > 6) {
                clearInterval(interval);
                setHeadRotate(0);
                setHeadX(0);
                setHeadY(0);
                setRobotEyeState(oldEyeState);
                setIsTickled(false);
                setSpeechText("Tôi vẫn đang canh gác hệ thống!");
            }
        }, 100);
    };

    // Periodic blinking effect
    useEffect(() => {
        const blinkTimer = setInterval(() => {
            if (robotEyeState === 'normal') {
                setIsBlinking(true);
                setTimeout(() => {
                    setIsBlinking(false);
                    // Chance of double blink
                    if (Math.random() > 0.6) {
                        setTimeout(() => {
                            setIsBlinking(true);
                            setTimeout(() => {
                                setIsBlinking(false);
                            }, 80);
                        }, 120);
                    }
                }, 100);
            }
        }, 5000);

        return () => clearInterval(blinkTimer);
    }, [robotEyeState]);

    // Periodic idle speech bubble change
    useEffect(() => {
        const idleSpeechInterval = setInterval(() => {
            const activeEl = document.activeElement;
            const isFocused = activeEl?.id === 'email' || activeEl?.id === 'password' || activeEl?.id === 'captcha-input';
            
            if (!isFocused && !isSuccessState && robotEyeState === 'normal' && !loading && !error && !success && !isTickled) {
                const idleMessages = [
                    "Chào đồng chí! Sẵn sàng trực ca chưa?",
                    "Tôi đang bảo vệ hệ thống MyTube nè!",
                    "Đăng nhập để vào bảng điều khiển Staff nha.",
                    "Hôm nay thế nào? Cần tôi hỗ trợ gì không?",
                    "Có video mới đang chờ kiểm duyệt đó!",
                    "Nhớ quét khuôn mặt lúc đến văn phòng nha."
                ];
                let randomMsg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
                setSpeechText(randomMsg);
            }
        }, 10000);

        return () => clearInterval(idleSpeechInterval);
    }, [robotEyeState, isSuccessState, loading, error, success, isTickled]);

    // 4. Handle Submit Verification
    const triggerFail = () => {
        setRobotEyeState('error');
        setIsShaking(true);
        setHeadX(0);
        setHeadY(0);
        setHeadRotate(0);

        const errorMessages = [
            "Hic, có gì đó sai sai rồi...",
            "Thông tin chưa chính xác rồi bạn ơi!",
            "Thử lại xem sao, kiểm tra kỹ nhé!",
            "Bíp bíp! Đăng nhập thất bại rồi."
        ];
        setSpeechText(errorMessages[Math.floor(Math.random() * errorMessages.length)]);

        setTimeout(() => {
            setIsShaking(false);
        }, 500);

        // Return to normal tracking after 3s
        setTimeout(() => {
            if (!isSuccessState) {
                setRobotEyeState('normal');
                setSpeechText("Tôi vẫn đang chờ bạn thử lại đây.");
            }
        }, 3000);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSuccessState) return;

        setError('');
        setSuccess('');

        // Step 1: Validate Captcha
        if (captchaInput.trim().toUpperCase() !== generatedCaptcha) {
            triggerFail();
            setError('Mã xác thực không hợp lệ. Vui lòng nhập lại!');
            generateNewCaptcha(); // Reset captcha & clear field immediately
            const capInput = document.getElementById('captcha-input');
            if (capInput) (capInput as HTMLInputElement).focus();
            return;
        }

        setLoading(true);
        setSpeechText("Đang kiểm tra thông tin tài khoản...");

        try {
            const res = await fetch('/api/admin/staff-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.admin.role !== 'STAFF') {
                    triggerFail();
                    setError('Tài khoản này không có quyền Nhân viên');
                    generateNewCaptcha(); // Reset captcha on auth error
                    setLoading(false);
                    return;
                }

                // SUCCESS STATE
                setIsSuccessState(true);
                setRobotEyeState('happy');
                setSpeechText("Tuyệt vời! Đang mở khóa và giải mã tài khoản...");
                setHeadX(0);
                setHeadY(-1.5);
                setHeadRotate(0);
                setSuccess('Đăng nhập thành công! Đang giải mã khóa truy cập...');
                sessionStorage.setItem('staff_token', JSON.stringify(data.admin));
                setStep(3); // Decryption loading stage

                setTimeout(() => {
                    router.push('/staff');
                }, 2000);
            } else {
                triggerFail();
                setError(data.error || 'ID nhân viên hoặc mật khẩu không chính xác');
                generateNewCaptcha(); // Reset captcha on auth error
                setPassword(''); // Reset password input
                const passInput = document.getElementById('password');
                if (passInput) (passInput as HTMLInputElement).focus();
            }
        } catch (err) {
            triggerFail();
            setError('Lỗi kết nối tới hệ thống đăng nhập');
            generateNewCaptcha(); // Reset captcha on network error
        } finally {
            setLoading(false);
        }
    };

    const isLightTheme = theme === 'light';

    // SVG elements setup based on state
    let mouthD = "M 57 69 Q 60 72 63 69"; // Cute small smile by default
    let mouthStroke = "var(--robot-eye-color)";
    if (robotEyeState === 'happy') {
        mouthD = "M 54 68 Q 60 75 66 68"; // Friendly open smile
        mouthStroke = "#30d158";
    } else if (robotEyeState === 'error') {
        mouthD = "M 57 72 Q 60 68 63 72"; // Cute small sad mouth
        mouthStroke = "#ff453a";
    } else if (robotEyeState === 'scanning') {
        mouthD = "M 57 70 L 63 70"; // Small flat line during scanning
        mouthStroke = "#ffcc00";
    }

    const robotGlowColor = robotEyeState === 'happy'
        ? '#30d158'
        : robotEyeState === 'error'
            ? '#ff453a'
            : robotEyeState === 'scanning'
                ? '#ffcc00'
                : (isLightTheme ? '#00b4d8' : '#00e5ff');

    const robotCircleClass = `robot-avatar-circle ${robotEyeState === 'happy'
        ? 'success'
        : robotEyeState === 'error'
            ? 'fail'
            : ''
        } ${isShaking ? 'robot-shake' : ''}`;

    return (
        <div className={`staff-login-container ${isLightTheme ? 'light-mode' : ''} ${step === 3 ? 'success-out' : ''}`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .staff-login-container {
                    /* Dark Mode Theme (Default) */
                    --bg-color: #000000;
                    --left-bg: #000000;
                    --right-bg: #FF0000; /* Pure red matching the logo */
                    --header-bg: #000000; /* Black Header in Dark Mode */
                    --header-border-color: rgba(255, 255, 255, 0.1);
                    --header-text-color: #ffffff;
                    --header-subtext-color: rgba(255, 255, 255, 0.6);
                    --logo-my-color: #FF0000; /* Red "My" in Dark Mode */
                    --logo-tube-color: #FF0000; /* Red "Tube" in Dark Mode */
                    --text-color: #ffffff;
                    --subtext-color: rgba(255, 255, 255, 0.6);
                    --accent-red: #FF0000;
                    --accent-red-bg: rgba(255, 0, 0, 0.08);
                    --glass-bg: rgba(18, 18, 18, 0.65);
                    --glass-border: rgba(255, 255, 255, 0.08);
                    --shadow-color: rgba(0, 0, 0, 0.8);
                    --bubble-border: rgba(255, 0, 0, 0.28);
                    --bubble-inner-glow: rgba(255, 255, 255, 0.08);
                    --card-tab-bg: rgba(0, 0, 0, 0.25);
                    --news-date-bg: rgba(255, 0, 0, 0.12);
                    --news-date-text: #FF0000;
                    --accent-red-glow: rgba(255, 0, 0, 0.4);
                    
                    /* 3D Robot Colors (Chrome Silver - Always White) */
                    --metal-light: #ffffff;
                    --metal-mid: #e5e5ea;
                    --metal-dark: #a2a2a6;
                    --bolt-light: #d1d1d6;
                    --bolt-dark: #8e8e93;
                    --robot-outline: #c7c7cc;
                    --robot-eye-color: #00e5ff;
                    --robot-eye-glow: rgba(0, 229, 255, 0.45);
                    --robot-glow-cyan: #00e5ff;

                    font-family: 'Outfit', sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    overflow: hidden;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    transition: background-color 0.5s ease, color 0.5s ease;
                }

                .staff-login-container.light-mode {
                    /* Light Mode Theme */
                    --bg-color: #f5f6f8;
                    --left-bg: #f5f6f8;
                    --right-bg: #FF0000; /* Pure red matching the logo */
                    --header-bg: #ffffff; /* White Header in Light Mode */
                    --header-border-color: rgba(0, 0, 0, 0.08);
                    --header-text-color: #111111;
                    --header-subtext-color: rgba(0, 0, 0, 0.6);
                    --logo-my-color: #000000; /* Black "My" in Light Mode */
                    --logo-tube-color: #FF0000; /* Red "Tube" in Light Mode */
                    --text-color: #111111;
                    --subtext-color: rgba(0, 0, 0, 0.6);
                    --accent-red: #FF0000;
                    --accent-red-bg: rgba(255, 0, 0, 0.06);
                    --glass-bg: rgba(255, 255, 255, 0.7);
                    --glass-border: rgba(0, 0, 0, 0.08);
                    --shadow-color: rgba(0, 0, 0, 0.08);
                    --bubble-border: rgba(255, 0, 0, 0.22);
                    --bubble-inner-glow: rgba(0, 0, 0, 0.03);
                    --card-tab-bg: rgba(0, 0, 0, 0.02);
                    --news-date-bg: rgba(255, 0, 0, 0.08);
                    --news-date-text: #FF0000;
                    --accent-red-glow: rgba(255, 0, 0, 0.35);

                    /* 3D Robot Colors (Chrome Silver - Always White) */
                    --metal-light: #ffffff;
                    --metal-mid: #e5e5ea;
                    --metal-dark: #a2a2a6;
                    --bolt-light: #d1d1d6;
                    --bolt-dark: #8e8e93;
                    --robot-outline: #c7c7cc;
                    --robot-eye-color: #00b4d8;
                    --robot-eye-glow: rgba(0, 180, 216, 0.4);
                    --robot-glow-cyan: #00b4d8;
                }

                /* HEADER BANNER */
                .app-header {
                    width: 100%;
                    height: 80px;
                    background-color: var(--header-bg) !important;
                    border-bottom: 1.5px solid var(--header-border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    z-index: 100;
                    position: relative;
                    box-shadow: 0 4px 20px var(--shadow-color);
                    transition: background-color 0.5s ease, box-shadow 0.5s ease;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                }

                .header-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-logo-text {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -1px;
                    color: var(--logo-my-color) !important;
                    transition: color 0.5s ease;
                }

                .header-logo-text span {
                    color: var(--logo-tube-color) !important;
                }

                .header-separator {
                    width: 1px;
                    height: 28px;
                    background-color: var(--header-border-color) !important;
                    margin: 0 20px;
                }

                .header-title-block {
                    display: flex;
                    flex-direction: column;
                }

                .header-title {
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: var(--header-text-color) !important;
                }

                .header-subtitle {
                    font-size: 11px;
                    color: var(--header-subtext-color) !important;
                    font-weight: 500;
                    letter-spacing: 0.2px;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }

                .header-clock {
                    font-family: monospace;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--header-text-color) !important;
                    opacity: 0.95;
                    letter-spacing: 0.5px;
                }

                /* LAYOUT SPLIT (7.5 / 2.5) */
                .page-container {
                    display: flex;
                    flex: 1;
                    width: 100vw;
                    position: relative;
                }

                /* LEFT PANEL (75%) */
                .left-section {
                    width: 75%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 30px;
                    overflow: hidden;
                    background-color: var(--left-bg);
                    transition: background-color 0.5s ease;
                }

                /* RIGHT PANEL (25%): Form Panel (Lighter Red Background) */
                .right-section {
                    width: 25%;
                    height: 100%;
                    background-color: var(--right-bg);
                    box-shadow: -10px 0 35px var(--shadow-color);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 30px 25px;
                    z-index: 10;
                    position: relative;
                    overflow: hidden;
                    transition: background-color 0.5s ease, box-shadow 0.5s ease;
                    color: #ffffff;
                }

                /* 15 DECORATIVE RED BUBBLES IN LEFT BACKGROUND */
                .left-blobs-container {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    pointer-events: none;
                    overflow: hidden;
                }

                .bubble {
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, rgba(255, 59, 48, 0.24) 0%, rgba(255, 59, 48, 0.06) 65%, transparent 100%);
                    border: 1.5px solid var(--bubble-border);
                    box-shadow: 0 10px 30px rgba(255, 59, 48, 0.06), inset 0 0 15px var(--bubble-inner-glow);
                    pointer-events: none;
                    z-index: 1;
                    animation: float 20s infinite alternate ease-in-out;
                    transition: border-color 0.5s, box-shadow 0.5s;
                }

                .bubble-1 { width: 170px; height: 170px; top: 6%; left: 4%; animation-duration: 22s; animation-delay: 0s; }
                .bubble-2 { width: 95px; height: 95px; bottom: 12%; left: 9%; animation-duration: 18s; animation-delay: -3s; }
                .bubble-3 { width: 270px; height: 270px; top: 12%; right: 12%; animation-duration: 28s; animation-delay: -6s; filter: blur(1px); }
                .bubble-4 { width: 60px; height: 60px; top: 72%; left: 35%; animation-duration: 14s; animation-delay: -9s; }
                .bubble-5 { width: 110px; height: 110px; bottom: 4%; right: 18%; animation-duration: 20s; animation-delay: -12s; }
                .bubble-6 { width: 190px; height: 190px; top: 48%; left: 14%; animation-duration: 25s; animation-delay: -2s; }
                .bubble-7 { width: 75px; height: 75px; top: 4%; right: 42%; animation-duration: 16s; animation-delay: -5s; }
                .bubble-8 { width: 130px; height: 130px; top: 32%; left: 36%; animation-duration: 23s; animation-delay: -11s; opacity: 0.6; filter: blur(2px); }
                .bubble-9 { width: 50px; height: 50px; bottom: 35%; left: 3%; animation-duration: 13s; animation-delay: -15s; }
                .bubble-10 { width: 210px; height: 210px; bottom: 25%; right: 40%; animation-duration: 27s; animation-delay: -4s; filter: blur(1.5px); }
                .bubble-11 { width: 85px; height: 85px; top: 52%; right: 28%; animation-duration: 19s; animation-delay: -7s; }
                .bubble-12 { width: 140px; height: 140px; top: -50px; left: 25%; animation-duration: 21s; animation-delay: -10s; opacity: 0.7; }
                .bubble-13 { width: 105px; height: 105px; bottom: 42%; right: 6%; animation-duration: 24s; animation-delay: -13s; }
                .bubble-14 { width: 70px; height: 70px; top: 28%; left: 2%; animation-duration: 15s; animation-delay: -1s; }
                .bubble-15 { width: 125px; height: 125px; bottom: 50%; left: 45%; animation-duration: 26s; animation-delay: -8s; }

                /* 10 DECORATIVE WHITE BUBBLES IN RIGHT BACKGROUND (RED PANEL) */
                .right-blobs-container {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    pointer-events: none;
                    overflow: hidden;
                }

                .bubble-right {
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 60%, transparent 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.28);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), inset 0 0 12px rgba(255, 255, 255, 0.12);
                    pointer-events: none;
                    z-index: 1;
                    animation: floatRight 18s infinite alternate ease-in-out;
                }

                .bubble-r1 { width: 85px; height: 85px; top: 6%; right: 8%; animation-duration: 16s; animation-delay: 0s; }
                .bubble-r2 { width: 130px; height: 130px; bottom: 8%; left: 5%; animation-duration: 22s; animation-delay: -4s; filter: blur(0.5px); }
                .bubble-r3 { width: 55px; height: 55px; top: 48%; right: 10%; animation-duration: 14s; animation-delay: -8s; }
                .bubble-r4 { width: 100px; height: 100px; bottom: 32%; right: 4%; animation-duration: 20s; animation-delay: -12s; opacity: 0.85; }
                .bubble-r5 { width: 70px; height: 70px; top: 18%; left: 8%; animation-duration: 18s; animation-delay: -2s; }
                .bubble-r6 { width: 110px; height: 110px; top: 35%; left: 15%; animation-duration: 24s; animation-delay: -6s; filter: blur(1px); opacity: 0.75; }
                .bubble-r7 { width: 60px; height: 60px; bottom: 4%; right: 12%; animation-duration: 15s; animation-delay: -10s; }
                .bubble-r8 { width: 90px; height: 90px; top: 28%; right: 25%; animation-duration: 21s; animation-delay: -14s; }
                .bubble-r9 { width: 45px; height: 45px; bottom: 22%; left: 12%; animation-duration: 13s; animation-delay: -16s; }
                .bubble-r10 { width: 115px; height: 115px; top: -40px; left: 35%; animation-duration: 26s; animation-delay: -18s; filter: blur(1.5px); opacity: 0.65; }

                /* GLASSMORPHIC STAFF RULES BOARD (LEFT 75% SECTION) */
                .staff-board {
                    width: 100%;
                    max-width: 860px;
                    height: calc(100vh - 120px);
                    min-height: 480px;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 24px;
                    box-shadow: 0 15px 35px var(--shadow-color);
                    padding: 30px;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    transition: background-color 0.5s, border-color 0.5s, box-shadow 0.5s;
                }

                .tab-bar {
                    display: flex;
                    border-bottom: 2px solid var(--glass-border);
                    margin-bottom: 20px;
                    gap: 10px;
                }

                .tab-btn {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    opacity: 0.65;
                    font-size: 15px;
                    font-weight: 700;
                    padding: 12px 20px;
                    cursor: pointer;
                    position: relative;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all 0.3s;
                    outline: none;
                }

                .tab-btn:hover {
                    opacity: 1;
                    color: var(--accent-red);
                }

                .tab-btn.active {
                    opacity: 1;
                    color: var(--accent-red);
                }

                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 2.5px;
                    background-color: var(--accent-red);
                    border-radius: 2px;
                    box-shadow: 0 0 8px var(--accent-red-glow);
                }

                .tab-content {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 8px;
                }

                .tab-content::-webkit-scrollbar {
                    width: 5px;
                }
                .tab-content::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 4px;
                }
                .tab-content::-webkit-scrollbar-thumb {
                    background: var(--glass-border);
                    border-radius: 4px;
                }
                .tab-content::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-red);
                }

                .tab-pane {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    animation: fadeInTab 0.4s ease;
                }

                @keyframes fadeInTab {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .rules-item {
                    display: flex;
                    gap: 20px;
                    padding: 18px 20px;
                    background-color: var(--card-tab-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    align-items: flex-start;
                    transition: all 0.3s ease;
                }

                .rules-item:hover {
                    transform: translateX(5px);
                    border-color: rgba(255, 59, 48, 0.25);
                    box-shadow: 0 6px 15px var(--shadow-color);
                }

                .rules-num-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    background-color: var(--news-date-bg);
                    border: 2px solid var(--news-date-text);
                    color: var(--news-date-text);
                    border-radius: 50%;
                    font-size: 16px;
                    font-weight: 800;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                    transition: background-color 0.5s, border-color 0.5s, color 0.5s;
                }

                .rules-item:hover .rules-num-badge {
                    background-color: var(--accent-red);
                    border-color: var(--accent-red);
                    color: #ffffff;
                    box-shadow: 0 0 10px var(--accent-red-glow);
                }

                .rules-body {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .rules-title {
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.35;
                    margin-bottom: 6px;
                    color: var(--text-color);
                    transition: color 0.3s;
                    text-transform: uppercase;
                }

                .rules-item:hover .rules-title {
                    color: var(--accent-red);
                }

                .rules-desc {
                    font-size: 13.5px;
                    color: var(--subtext-color);
                    line-height: 1.5;
                }

                .btn-more-news {
                    display: inline-flex;
                    align-self: flex-end;
                    margin-top: 10px;
                    color: var(--accent-red);
                    background: none;
                    border: 1px solid var(--accent-red);
                    border-radius: 8px;
                    padding: 8px 20px;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all 0.3s;
                    outline: none;
                }

                .btn-more-news:hover {
                    background-color: var(--accent-red);
                    color: #ffffff;
                    box-shadow: 0 0 10px var(--accent-red-glow);
                }

                /* FORM STYLING (RIGHT SIDE) */
                .login-card {
                    width: 100%;
                    max-width: 380px;
                    display: flex;
                    flex-direction: column;
                    z-index: 2;
                    position: relative;
                    animation: fadeIn 0.8s ease;
                }

                /* Circular Container for Robot Avatar */
                .robot-avatar-circle {
                    width: 132px;
                    height: 132px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.4);
                    border: 3.5px solid rgba(255, 255, 255, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    margin: 0 auto 20px auto;
                    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 10px 25px rgba(0, 0, 0, 0.3);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                }

                .robot-avatar-circle.success {
                    border-color: #30d158;
                    box-shadow: 0 0 25px rgba(48, 209, 88, 0.7), inset 0 0 15px rgba(0, 0, 0, 0.2);
                    background: rgba(48, 209, 88, 0.18);
                }

                .robot-avatar-circle.fail {
                    border-color: #ff453a;
                    box-shadow: 0 0 25px rgba(255, 69, 58, 0.7), inset 0 0 15px rgba(0, 0, 0, 0.2);
                    background: rgba(255, 69, 58, 0.18);
                }

                .robot-svg {
                    overflow: visible;
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .form-header h2 {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    color: #ffffff !important;
                }

                .form-header p {
                    font-size: 13px;
                    color: #ffffff !important;
                }

                .form-group {
                    margin-bottom: 15px;
                    position: relative;
                    text-align: left;
                }

                .form-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #ffffff !important;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: rgba(255, 255, 255, 0.75);
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    transition: color 0.3s;
                }

                .input-icon svg {
                    width: 18px;
                    height: 18px;
                }

                .form-input {
                    width: 100%;
                    background-color: rgba(0, 0, 0, 0.18); /* Darker/contrasted inputs */
                    border: 1px solid rgba(255, 255, 255, 0.35); /* Crisp border on light red */
                    border-radius: 12px;
                    padding: 13px 16px 13px 46px;
                    font-family: inherit;
                    font-size: 14.5px;
                    color: #ffffff !important;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .staff-login-container .form-input,
                .staff-login-container.light-mode .form-input,
                .staff-login-container.light-mode input.form-input,
                .staff-login-container.light-mode input.form-input:focus {
                    color: #ffffff !important;
                }

                .staff-login-container .form-input::placeholder,
                .staff-login-container.light-mode .form-input::placeholder,
                .staff-login-container.light-mode input.form-input::placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                    opacity: 1 !important;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                    opacity: 1 !important;
                }

                .form-input::-webkit-input-placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                .form-input::-moz-placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                .form-input:-ms-input-placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                .form-input:-webkit-autofill,
                .form-input:-webkit-autofill:hover,
                .form-input:-webkit-autofill:focus,
                .form-input:-webkit-autofill:active {
                    -webkit-text-fill-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                .form-input:focus {
                    border-color: #ffffff;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                    background-color: rgba(0, 0, 0, 0.3);
                }

                .form-input:focus ~ .input-icon {
                    color: #ffffff;
                }

                .password-toggle-btn {
                    position: absolute;
                    right: 14px;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.3s;
                    outline: none;
                }

                .password-toggle-btn:hover {
                    color: #ffffff;
                }

                .password-toggle-btn svg {
                    width: 18px;
                    height: 18px;
                }

                /* CAPTCHA WRAPPER */
                .captcha-wrapper {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 12px;
                    margin-bottom: 15px;
                }

                .captcha-box-container {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    padding: 4px 8px;
                }

                .captcha-code-display {
                    font-family: monospace;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    color: #ffcc00;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    background: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 255, 255, 0.08) 5px, rgba(255, 255, 255, 0.08) 10px);
                    padding: 8px 12px;
                    border-radius: 8px;
                    user-select: none;
                    font-style: italic;
                    text-decoration: line-through;
                    flex: 1;
                    text-align: center;
                }

                .btn-refresh-captcha {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border-radius: 4px;
                    transition: color 0.3s;
                    outline: none;
                }

                .btn-refresh-captcha:hover {
                    color: #ffffff;
                }

                .btn-refresh-captcha svg {
                    width: 16px;
                    height: 16px;
                }

                .btn-submit {
                    width: 100%;
                    background-color: #ffffff;
                    color: var(--right-bg);
                    border: none;
                    border-radius: 12px;
                    padding: 14px;
                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    margin-top: 5px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    outline: none;
                }

                .btn-submit:hover {
                    background-color: rgba(255, 255, 255, 0.9);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
                }

                .btn-submit:active {
                    transform: translateY(0);
                }

                /* ALERTS */
                .error-message {
                    background-color: rgba(0, 0, 0, 0.25);
                    border: 1px solid #ff453a;
                    border-radius: 10px;
                    color: #ff9f0a;
                    padding: 10px 14px;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: shakeError 0.4s ease;
                }

                .error-message svg {
                    flex-shrink: 0;
                    width: 16px;
                    height: 16px;
                    color: #ff453a;
                }

                @keyframes shakeError {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }

                .success-message-banner {
                    background-color: rgba(48, 209, 88, 0.15);
                    border: 1px solid #30d158;
                    border-radius: 10px;
                    color: #30d158;
                    padding: 10px 14px;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: pulseGreenBorder 2s infinite;
                }

                @keyframes pulseGreenBorder {
                    0%, 100% { border-color: #30d158; }
                    50% { border-color: #34c759; box-shadow: 0 0 8px rgba(48, 209, 88, 0.3); }
                }

                /* ROBOT HEAD SHAKE */
                .robot-shake {
                    animation: robotHeadShake 0.5s ease-in-out;
                }

                @keyframes robotHeadShake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    15% { transform: translateX(-6px) rotate(-3deg); }
                    30% { transform: translateX(5px) rotate(2deg); }
                    45% { transform: translateX(-4px) rotate(-2deg); }
                    60% { transform: translateX(3px) rotate(1deg); }
                    75% { transform: translateX(-2px) rotate(-1deg); }
                    90% { transform: translateX(1px) rotate(0.5deg); }
                }

                /* Visor laser scan line vertical animation */
                @keyframes scannerSlide {
                    0%, 100% { transform: translateY(-3px); }
                    50% { transform: translateY(7px); }
                }

                /* TRANSITIONS FOR LOGIN SUCCESS */
                .staff-login-container.success-out .left-section {
                    transform: translateX(-100%);
                    transition: transform 0.8s cubic-bezier(0.76, 0, 0.24, 1);
                }

                .staff-login-container.success-out .right-section {
                    transform: translateX(100%);
                    transition: transform 0.8s cubic-bezier(0.76, 0, 0.24, 1);
                }

                /* ANIMATIONS */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(25px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes float {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                    50% { transform: translate(25px, -35px) scale(1.08) rotate(180deg); }
                    100% { transform: translate(-15px, -60px) scale(0.92) rotate(360deg); }
                }

                @keyframes floatRight {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                    50% { transform: translate(-20px, 30px) scale(1.06) rotate(180deg); }
                    100% { transform: translate(15px, -20px) scale(0.94) rotate(360deg); }
                }

                /* INTERACTIVE ROBOT SPEECH BUBBLE */
                .robot-speech-bubble {
                    position: relative;
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 14px;
                    padding: 10px 14px;
                    margin: 0 auto 15px auto;
                    max-width: 280px;
                    text-align: center;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                    animation: bubbleFloat 3s ease-in-out infinite, bubblePopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 10;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .staff-login-container.light-mode .robot-speech-bubble {
                    background: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(255, 0, 0, 0.15);
                    box-shadow: 0 8px 32px 0 rgba(255, 0, 0, 0.05);
                }

                .bubble-text {
                    font-size: 13px;
                    font-weight: 600;
                    line-height: 1.4;
                    color: #ffffff;
                    transition: color 0.3s;
                }

                .staff-login-container.light-mode .bubble-text {
                    color: #111111;
                }

                .bubble-arrow {
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%) rotate(45deg);
                    width: 12px;
                    height: 12px;
                    background: inherit;
                    border-right: 1px solid rgba(255, 255, 255, 0.2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .staff-login-container.light-mode .bubble-arrow {
                    border-right: 1px solid rgba(255, 0, 0, 0.15);
                    border-bottom: 1px solid rgba(255, 0, 0, 0.15);
                }

                .robot-speech-bubble.hovered {
                    transform: scale(1.05);
                    border-color: rgba(255, 255, 255, 0.45);
                    box-shadow: 0 12px 35px 0 rgba(0, 0, 0, 0.35);
                }

                .staff-login-container.light-mode .robot-speech-bubble.hovered {
                    border-color: rgba(255, 0, 0, 0.35);
                    box-shadow: 0 12px 35px 0 rgba(255, 0, 0, 0.12);
                }

                .torso-core-pulse {
                    animation: corePulse 2s infinite ease-in-out;
                }

                @keyframes corePulse {
                    0%, 100% { opacity: 0.55; }
                    50% { opacity: 0.95; }
                }

                @keyframes bubbleFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }

                @keyframes bubblePopIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }

                /* RESPONSIVE DESIGN */
                @media (max-width: 1024px) {
                    .staff-login-container {
                        overflow-y: auto;
                        height: auto;
                        min-height: 100vh;
                    }
                    .app-header {
                        padding: 0 20px;
                        height: 70px;
                    }
                    .header-separator {
                        margin: 0 10px;
                    }
                    .header-title-block {
                        display: none; /* Hide subtitle details to fit space */
                    }
                    .page-container {
                        flex-direction: column;
                        height: auto;
                        min-height: calc(100vh - 70px);
                    }
                    .left-section {
                        width: 100%;
                        height: auto;
                        min-height: 50vh;
                        padding: 20px;
                    }
                    .staff-board {
                        height: auto;
                        min-height: 380px;
                        padding: 20px;
                    }
                    .tab-btn {
                        padding: 10px 12px;
                        font-size: 13px;
                    }
                    .right-section {
                        width: 100%;
                        height: auto;
                        min-height: 50vh;
                        border-left: none;
                        box-shadow: 0 -10px 30px var(--shadow-color);
                        padding: 40px 20px;
                    }
                    .staff-login-container.success-out .left-section {
                        transform: translateY(-100%);
                    }
                    .staff-login-container.success-out .right-section {
                        transform: translateY(100%);
                    }
                }
            `}} />

            {/* TOP HEADER BANNER */}
            <header className="app-header">
                <div className="header-left">
                    <div className="header-brand">
                        <img
                            src="/assets/img/logoMyTube.png"
                            alt="MyTube Logo"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="header-logo-text">My<span>Tube</span></span>
                    </div>
                    <div className="header-separator"></div>
                    <div className="header-title-block">
                        <span className="header-title">Cổng thông tin Nhân viên</span>
                        <span className="header-subtitle">MyTube Media Inc. • Hệ thống vận hành nội bộ</span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="header-clock">{clockStr}</div>
                </div>
            </header>

            {/* MAIN CONTENT SPLIT 7.5 / 2.5 */}
            <div className="page-container">

                {/* 15 DECORATIVE FLOATING BUBBLES IN LEFT BACKGROUND */}
                <div className="left-blobs-container">
                    <div className="bubble bubble-1"></div>
                    <div className="bubble bubble-2"></div>
                    <div className="bubble bubble-3"></div>
                    <div className="bubble bubble-4"></div>
                    <div className="bubble bubble-5"></div>
                    <div className="bubble bubble-6"></div>
                    <div className="bubble bubble-7"></div>
                    <div className="bubble bubble-8"></div>
                    <div className="bubble bubble-9"></div>
                    <div className="bubble bubble-10"></div>
                    <div className="bubble bubble-11"></div>
                    <div className="bubble bubble-12"></div>
                    <div className="bubble bubble-13"></div>
                    <div className="bubble bubble-14"></div>
                    <div className="bubble bubble-15"></div>
                </div>

                {/* LEFT PANEL (75%) */}
                <section className="left-section">
                    <div className="staff-board">
                        <div className="tab-bar">
                            <button className={`tab-btn ${activeTab === 'labor' ? 'active' : ''}`} onClick={() => setActiveTab('labor')}>Nội quy lao động</button>
                            <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Bảo mật nội dung</button>
                            <button className={`tab-btn ${activeTab === 'procedures' ? 'active' : ''}`} onClick={() => setActiveTab('procedures')}>Quy chế bản quyền</button>
                            <button className={`tab-btn ${activeTab === 'operations' ? 'active' : ''}`} onClick={() => setActiveTab('operations')}>Vận hành hệ thống</button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'labor' && (
                                <div className="tab-pane">
                                    <div className="rules-item">
                                        <div className="rules-num-badge">1</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Thời gian làm việc và chấm công hàng ngày</h3>
                                            <p className="rules-desc">Giờ làm việc cố định áp dụng từ Thứ Hai đến Thứ Sáu (8:30 - 17:30, nghỉ trưa từ 12:00 đến 13:00). Nhân viên bắt buộc thực hiện quét chấm công nhận diện FaceID tại cửa ra vào khi đến văn phòng và khi ra về.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">2</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Trang phục và tác phong công sở</h3>
                                            <p className="rules-desc">Nhân viên ăn mặc lịch sự, nhã nhặn (khuyến khích mặc áo thun đồng phục MyTube có cổ vào Thứ Sáu). Bắt buộc đeo thẻ nhân viên MyTube ở vị trí dễ quan sát trong suốt thời gian có mặt tại khu vực công ty.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">3</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Giữ gìn an ninh văn phòng</h3>
                                            <p className="rules-desc">Tuyệt đối không dẫn người lạ hoặc người không có nhiệm vụ vào khu vực phòng máy chủ, phòng lưu trữ dữ liệu hoặc phòng xử lý hậu kỳ của kiểm duyệt viên mà không có sự phê duyệt trước từ cấp Quản lý.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="tab-pane">
                                    <div className="rules-item">
                                        <div className="rules-num-badge">1</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Bảo mật dữ liệu video và thông tin nhà sáng tạo</h3>
                                            <p className="rules-desc">Tuyệt đối nghiêm cấm hành vi tải xuống, sao chép, chụp màn hình hoặc phát tán các tệp tin video nội bộ, video đang trong quá trình kiểm duyệt hoặc thông tin cá nhân của các nhà sáng tạo (Creators) ra ngoài hệ thống.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">2</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Khóa màn hình máy tính khi rời vị trí làm việc</h3>
                                            <p className="rules-desc">Để ngăn chặn việc rò rỉ dữ liệu hoặc thao tác ngoài ý muốn trên các video kiểm duyệt, nhân viên bắt buộc phải khóa màn hình máy tính trạm (phím tắt Windows + L hoặc Ctrl + Cmd + Q) ngay cả khi rời bàn làm việc dưới 1 phút.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">3</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Nguyên tắc xử lý các nội dung vi phạm pháp luật khẩn cấp</h3>
                                            <p className="rules-desc">Khi phát hiện các luồng phát trực tiếp (Live Stream) có chứa nội dung vi phạm pháp luật hoặc thuần phong mỹ tục, kiểm duyệt viên trực ca phải lập tức thực hiện khóa luồng (block stream) và báo cáo khẩn cấp trong vòng 5 phút.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'procedures' && (
                                <div className="tab-pane">
                                    <div className="rules-item">
                                        <div className="rules-num-badge">1</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Quy trình xác minh bản quyền hình ảnh và âm thanh</h3>
                                            <p className="rules-desc">Nhân viên pháp lý bản quyền phải đối chiếu kỹ lưỡng tệp tin gốc của đối tác sở hữu với nội dung bị báo cáo vi phạm bản quyền trước khi đưa ra quyết định gỡ bỏ (Take down) video của nhà sáng tạo trên MyTube.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">2</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Thời hạn phản hồi kháng nghị bản quyền</h3>
                                            <p className="rules-desc">Mọi khiếu nại hoặc kháng nghị bản quyền từ phía nhà sáng tạo nội dung phải được nhân viên tiếp nhận, phân tích hồ sơ pháp lý đối chứng và phản hồi kết quả giải quyết trung thực trong vòng tối đa 48 giờ làm việc.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">3</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Bảo mật thuật toán đề xuất và phân phối nội dung</h3>
                                            <p className="rules-desc">Nghiêm cấm thảo luận, tiết lộ hoặc cung cấp tài liệu chi tiết liên quan đến cơ chế hoạt động của thuật toán đề xuất video (Recommendation Algorithm) của MyTube trên các phương tiện truyền thông công cộng.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'operations' && (
                                <div className="tab-pane">
                                    <div className="rules-item">
                                        <div className="rules-num-badge">1</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Quy trình deploy mã nguồn lên môi trường Production</h3>
                                            <p className="rules-desc">Mọi bản cập nhật mã nguồn (Frontend/Backend) của hệ thống MyTube bắt buộc phải trải qua quy trình kiểm thử tự động đạt tỷ lệ phủ 100% và nhận được sự phê duyệt (Approve) từ Tech Lead trước khi triển khai thực tế.</p>
                                        </div>
                                    </div>
                                    <div className="rules-item">
                                        <div className="rules-num-badge">2</div>
                                        <div className="rules-body">
                                            <h3 className="rules-title">Theo dõi và báo cáo hiệu năng cụm máy chủ Transcoding</h3>
                                            <p className="rules-desc">Kỹ sư hệ thống chịu trách nhiệm giám sát tài nguyên của các cụm máy chủ xử lý định dạng video (Transcoding clusters) hàng giờ, thực hiện cơ chế scale-up tự động nếu phát hiện mức sử dụng CPU trung bình vượt quá ngưỡng 85%.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn-more-news">Xem thêm</button>
                    </div>
                </section>

                {/* RIGHT PANEL (25%): Secure Login Form */}
                <section 
                    className="right-section"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >

                    {/* 10 DECORATIVE WHITE BUBBLES IN RIGHT BACKGROUND */}
                    <div className="right-blobs-container">
                        <div className="bubble-right bubble-r1"></div>
                        <div className="bubble-right bubble-r2"></div>
                        <div className="bubble-right bubble-r3"></div>
                        <div className="bubble-right bubble-r4"></div>
                        <div className="bubble-right bubble-r5"></div>
                        <div className="bubble-right bubble-r6"></div>
                        <div className="bubble-right bubble-r7"></div>
                        <div className="bubble-right bubble-r8"></div>
                        <div className="bubble-right bubble-r9"></div>
                        <div className="bubble-right bubble-r10"></div>
                    </div>

                    <div className="login-card">

                        {/* Interactive Speech Bubble */}
                        <div className={`robot-speech-bubble ${isHovered ? 'hovered' : ''}`}>
                            <div className="bubble-text">{speechText}</div>
                            <div className="bubble-arrow"></div>
                        </div>

                        {/* Circular Frame containing 3D Interactive SVG Robot */}
                        <div
                            ref={robotCircleRef}
                            className={robotCircleClass}
                            id="robot-circle"
                            style={{
                                ['--robot-glow-cyan' as any]: robotGlowColor,
                                ['--robot-eye-color' as any]: robotGlowColor,
                                cursor: 'pointer'
                            }}
                            onClick={handleRobotClick}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <svg id="robot-svg" className="robot-svg" viewBox="10 5 100 100" width="125" height="125" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    {/* 3D Glossy Spherical White Helmet Gradient */}
                                    <radialGradient id="eve-head-grad" cx="35%" cy="30%" r="65%" fx="30%" fy="25%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="60%" stopColor="#f4f4f7" />
                                        <stop offset="85%" stopColor="#e5e5ea" />
                                        <stop offset="100%" stopColor="#c7c7cc" />
                                    </radialGradient>

                                    {/* Chrome/Silver Metal Gradient for joints */}
                                    <linearGradient id="eve-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="40%" stopColor="#d1d1d6" />
                                        <stop offset="85%" stopColor="#8e8e93" />
                                        <stop offset="100%" stopColor="#545456" />
                                    </linearGradient>

                                    {/* Torso White Glossy Gradient */}
                                    <linearGradient id="eve-body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#e5e5ea" />
                                        <stop offset="30%" stopColor="#ffffff" />
                                        <stop offset="70%" stopColor="#f4f4f7" />
                                        <stop offset="100%" stopColor="#c7c7cc" />
                                    </linearGradient>

                                    {/* Deep Glossy Visor Screen Gradient */}
                                    <linearGradient id="eve-visor-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0b0c10" />
                                        <stop offset="60%" stopColor="#151722" />
                                        <stop offset="100%" stopColor="#1f2233" />
                                    </linearGradient>

                                    {/* Glowing LED Radial Gradients for Eyes */}
                                    <radialGradient id="eye-cyan-grad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="25%" stopColor="#a3f5ff" />
                                        <stop offset="70%" stopColor="#00d2ff" />
                                        <stop offset="100%" stopColor="rgba(0, 210, 255, 0)" />
                                    </radialGradient>
                                    <radialGradient id="eye-green-grad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="25%" stopColor="#baffdb" />
                                        <stop offset="70%" stopColor="#30d158" />
                                        <stop offset="100%" stopColor="rgba(48, 209, 88, 0)" />
                                    </radialGradient>
                                    <radialGradient id="eye-red-grad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="25%" stopColor="#ffb8be" />
                                        <stop offset="70%" stopColor="#ff453a" />
                                        <stop offset="100%" stopColor="rgba(255, 69, 58, 0)" />
                                    </radialGradient>

                                    {/* Glow Filter for Visor/LED */}
                                    <filter id="svg-glow" x="-25%" y="-25%" width="150%" height="150%">
                                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                    {/* Drop Shadow for Volumetric Depth */}
                                    <filter id="subtle-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity={0.25} />
                                    </filter>
                                    <filter id="visor-inset-shadow" x="-10%" y="-10%" width="120%" height="120%">
                                        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity={0.6} />
                                    </filter>
                                </defs>

                                {/* High-tech 3D Ribbed Neck Connector */}
                                <g filter="url(#subtle-shadow)">
                                    <rect x="48" y="74" width="24" height="6" rx="2" fill="url(#eve-metal-grad)" stroke="#c7c7cc" strokeWidth={0.8} />
                                    <rect x="46" y="80" width="28" height="6" rx="2" fill="url(#eve-metal-grad)" stroke="#c7c7cc" strokeWidth={0.8} />
                                </g>

                                {/* Broad High-Tech Torso & Shoulder Armor */}
                                <g id="robot-shoulders-torso">
                                    {/* Left Shoulder Joint */}
                                    <rect x="28" y="86" width="10" height="8" rx="2" fill="url(#eve-metal-grad)" />
                                    
                                    {/* Right Shoulder Joint */}
                                    <rect x="82" y="86" width="10" height="8" rx="2" fill="url(#eve-metal-grad)" />

                                    {/* Left Shoulder Armor Pad (Broad) */}
                                    <rect x="8" y="82" width="24" height="18" rx="5" fill="url(#eve-head-grad)" stroke="#c7c7cc" strokeWidth={1.2} filter="url(#subtle-shadow)" />
                                    <rect x="12" y="86" width="16" height="3" rx="1" fill="url(#eve-metal-grad)" />
                                    <circle cx="15" cy="94" r="1.5" fill="#a2a2a6" />

                                    {/* Right Shoulder Armor Pad (Broad) */}
                                    <rect x="88" y="82" width="24" height="18" rx="5" fill="url(#eve-head-grad)" stroke="#c7c7cc" strokeWidth={1.2} filter="url(#subtle-shadow)" />
                                    <rect x="92" y="86" width="16" height="3" rx="1" fill="url(#eve-metal-grad)" />
                                    <circle cx="105" cy="94" r="1.5" fill="#a2a2a6" />

                                    {/* Broad Armor Chest Plate */}
                                    <path d="M 34 84 L 86 84 C 92 84, 94 92, 94 100 L 92 120 L 28 120 L 26 100 C 26 92, 28 84, 34 84 Z" fill="url(#eve-body-grad)" stroke="#c7c7cc" strokeWidth={1.5} filter="url(#subtle-shadow)" />
                                    
                                    {/* Layered Inner Shield */}
                                    <path d="M 42 88 L 78 88 L 82 116 L 38 116 Z" fill="url(#eve-metal-grad)" opacity={0.6} stroke="#a2a2a6" strokeWidth={1} />
                                </g>
                                
                                {/* Torso Glowing Status Core */}
                                <circle cx="60" cy="102" r="7" fill="var(--robot-glow-cyan)" filter="url(#svg-glow)" className="torso-core-pulse" style={{ opacity: 0.8 }} />
                                <circle cx="60" cy="102" r="3.5" fill="#ffffff" />

                                {/* Interactive Head Group */}
                                <g 
                                    id="robot-head-group" 
                                    style={{ 
                                        transform: `translate(${headX}px, ${headY}px) rotate(${headRotate}deg)`,
                                        transformOrigin: '60px 53px',
                                        transition: isTickled ? 'transform 0.08s ease-in-out' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                    }}
                                >
                                    
                                    {/* Left Ear Connector Node (Sleek Circular Audio Receptor) */}
                                    <g filter="url(#subtle-shadow)">
                                        <circle cx="26" cy="55" r="5" fill="url(#eve-metal-grad)" stroke="#c7c7cc" strokeWidth={1} />
                                        <circle cx="26" cy="55" r="2.5" fill="var(--robot-glow-cyan)" filter="url(#svg-glow)" opacity={0.8} />
                                    </g>
                                    
                                    {/* Right Ear Connector Node (Sleek Circular Audio Receptor) */}
                                    <g filter="url(#subtle-shadow)">
                                        <circle cx="94" cy="55" r="5" fill="url(#eve-metal-grad)" stroke="#c7c7cc" strokeWidth={1} />
                                        <circle cx="94" cy="55" r="2.5" fill="var(--robot-glow-cyan)" filter="url(#svg-glow)" opacity={0.8} />
                                    </g>

                                    {/* Dual Symmetrical Angled Antennas (Futuristic Cyber Mech style) */}
                                    <g id="robot-antennas">
                                        {/* Left Antenna */}
                                        <line x1="42" y1="33" x2="34" y2="18" stroke="#a2a2a6" strokeWidth={2} strokeLinecap="round" />
                                        <circle cx="34" cy="18" r="3.5" fill="var(--robot-glow-cyan)" className="torso-core-pulse" style={{ transition: 'fill 0.3s', filter: 'url(#svg-glow)' }} />
                                        <circle cx="34" cy="18" r="1.2" fill="#ffffff" />

                                        {/* Right Antenna */}
                                        <line x1="78" y1="33" x2="86" y2="18" stroke="#a2a2a6" strokeWidth={2} strokeLinecap="round" />
                                        <circle cx="86" cy="18" r="3.5" fill="var(--robot-glow-cyan)" className="torso-core-pulse" style={{ transition: 'fill 0.3s', filter: 'url(#svg-glow)' }} />
                                        <circle cx="86" cy="18" r="1.2" fill="#ffffff" />
                                    </g>

                                    {/* Solid Rounded Squircle Helmet Shell */}
                                    <rect x="30" y="32" width="60" height="46" rx="15" fill="url(#eve-head-grad)" stroke="#c7c7cc" strokeWidth={1.2} filter="url(#subtle-shadow)" />

                                    {/* Visor Screen Glass Container */}
                                    <rect x="35" y="38" width="50" height="24" rx="9" fill="url(#eve-visor-grad)" stroke="#3a3a3c" strokeWidth={0.5} filter="url(#visor-inset-shadow)" />
                                    
                                    {/*Visor Gloss Reflection overlay */}
                                    <path d="M 37 40 Q 60 35 83 40 Q 60 52 37 40" fill="#ffffff" opacity={0.06} pointerEvents="none" />
                                    <path d="M 37 40 L 53 40 L 43 56 L 37 56 Z" fill="#ffffff" opacity={0.04} pointerEvents="none" />

                                    {/* Eyes (Normal State) */}
                                    {robotEyeState === 'normal' && (
                                        <g 
                                            id="robot-eyes-normal"
                                            style={{
                                                transform: isBlinking ? 'scaleY(0.1)' : 'none',
                                                transformOrigin: '60px 48px',
                                                transition: 'transform 0.08s ease-in-out'
                                            }}
                                        >
                                            <g id="robot-eye-left" style={{ transition: 'transform 0.1s ease-out', transform: `translate(${eyeX}px, ${eyeY}px)` }}>
                                                <circle cx={49} cy={48} r={5.5} fill="url(#eye-cyan-grad)" opacity={0.8} />
                                                <circle cx={49} cy={48} r={2.2} fill="var(--robot-eye-color)" />
                                                <circle cx={47.8} cy={46.8} r={0.7} fill="#ffffff" />
                                            </g>
                                            <g id="robot-eye-right" style={{ transition: 'transform 0.1s ease-out', transform: `translate(${eyeX}px, ${eyeY}px)` }}>
                                                <circle cx={71} cy={48} r={5.5} fill="url(#eye-cyan-grad)" opacity={0.8} />
                                                <circle cx={71} cy={48} r={2.2} fill="var(--robot-eye-color)" />
                                                <circle cx={69.8} cy={46.8} r={0.7} fill="#ffffff" />
                                            </g>
                                        </g>
                                    )}

                                    {/* Scanning Laser Visor Bar (Password Mode) */}
                                    {robotEyeState === 'scanning' && (
                                        <g id="robot-eyes-scanning">
                                            <rect id="robot-scanner-glow" x="39" y={46} width={42} height={3.5} rx={1.5} fill="var(--robot-eye-color)" filter="url(#svg-glow)" style={{ animation: 'scannerSlide 1.3s infinite ease-in-out' }} />
                                            <rect id="robot-scanner-bar" x="39" y={46} width={42} height={1.5} rx={0.7} fill="#ffffff" style={{ animation: 'scannerSlide 1.3s infinite ease-in-out' }} />
                                        </g>
                                    )}

                                    {/* Happy Eyes */}
                                    {robotEyeState === 'happy' && (
                                        <g id="robot-eyes-happy">
                                            <path d="M 44 50 Q 49 42 54 50" stroke="#30d158" strokeWidth={2.5} strokeLinecap="round" fill="none" filter="url(#svg-glow)" />
                                            <path d="M 44 50 Q 49 42 54 50" stroke="#ffffff" strokeWidth={1} strokeLinecap="round" fill="none" />
                                            <path d="M 66 50 Q 71 42 76 50" stroke="#30d158" strokeWidth={2.5} strokeLinecap="round" fill="none" filter="url(#svg-glow)" />
                                            <path d="M 66 50 Q 71 42 76 50" stroke="#ffffff" strokeWidth={1} strokeLinecap="round" fill="none" />
                                        </g>
                                    )}

                                    {/* Error Eyes (Red X X) */}
                                    {robotEyeState === 'error' && (
                                        <g id="robot-eyes-error">
                                            <path d="M 45 44 L 53 52 M 53 44 L 45 52" stroke="#ff453a" strokeWidth={2.5} strokeLinecap="round" filter="url(#svg-glow)" />
                                            <path d="M 45 44 L 53 52 M 53 44 L 45 52" stroke="#ffffff" strokeWidth={1} strokeLinecap="round" />
                                            <path d="M 67 44 L 75 52 M 75 44 L 67 52" stroke="#ff453a" strokeWidth={2.5} strokeLinecap="round" filter="url(#svg-glow)" />
                                            <path d="M 67 44 L 75 52 M 75 44 L 67 52" stroke="#ffffff" strokeWidth={1} strokeLinecap="round" />
                                        </g>
                                    )}

                                    {/* Dynamic LED Mouth */}
                                    <path id="robot-mouth" d={mouthD} stroke={mouthStroke} strokeWidth={2.5} strokeLinecap="round" fill="none" style={{ transition: 'stroke 0.3s, transform 0.1s ease-out' }} />
                                </g>
                            </svg>
                        </div>

                        {step !== 3 ? (
                            <>
                                <div className="form-header">
                                    <h2>Đăng nhập Staff</h2>
                                    <p>Cổng kiểm duyệt và vận hành hệ thống</p>
                                </div>

                                {/* Display Alert Messages */}
                                {error && (
                                    <div className="error-message">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="success-message-banner">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span>{success}</span>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={handleLogin}>
                                    {/* Email Input */}
                                    <div className="form-group">
                                        <label htmlFor="email">ID Nhân viên</label>
                                        <div className="input-wrapper">
                                            <input
                                                style={{ color: '#ffffff' }}
                                                type="text"
                                                id="email"
                                                placeholder="Nhập ID nhân viên..."
                                                className="form-input"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    handleInputChange(e.target.value);
                                                }}
                                                onFocus={(e) => {
                                                    handleEmailFocus(e.target.value);
                                                }}
                                                onBlur={handleInputBlur}
                                                autoComplete="off"
                                                required
                                            />
                                            <span className="input-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="form-group">
                                        <label htmlFor="password">Mật khẩu bảo mật</label>
                                        <div className="input-wrapper">
                                            <input
                                                style={{ color: '#ffffff' }}
                                                type={isPasswordVisible ? "text" : "password"}
                                                id="password"
                                                placeholder="Nhập mật khẩu truy cập..."
                                                className="form-input"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (isPasswordVisible) handleInputChange(e.target.value);
                                                }}
                                                onFocus={handlePasswordFocus}
                                                onBlur={handleInputBlur}
                                                required
                                            />
                                            <span className="input-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </span>
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={togglePasswordVisibility}
                                                title="Ẩn/Hiện mật khẩu"
                                            >
                                                {isPasswordVisible ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Captcha Input */}
                                    <div className="form-group">
                                        <label htmlFor="captcha-input">Mã xác thực</label>
                                        <div className="captcha-wrapper">
                                            <input
                                                style={{ color: '#ffffff' }}
                                                type="text"
                                                id="captcha-input"
                                                placeholder="Mã..."
                                                className="form-input"
                                                value={captchaInput}
                                                onChange={(e) => {
                                                    setCaptchaInput(e.target.value);
                                                    handleInputChange(e.target.value);
                                                }}
                                                onFocus={(e) => {
                                                    handleCaptchaFocus(e.target.value);
                                                }}
                                                onBlur={handleInputBlur}
                                                autoComplete="off"
                                                required
                                            />
                                            <div className="captcha-box-container">
                                                <div className="captcha-code-display">{generatedCaptcha}</div>
                                                <button
                                                    type="button"
                                                    className="btn-refresh-captcha"
                                                    onClick={generateNewCaptcha}
                                                    title="Đổi mã khác"
                                                    onMouseEnter={() => setSpeechText("Mã khó đọc quá hả? Để tôi đổi mã mới cho nha!")}
                                                    onMouseLeave={() => {
                                                        const activeEl = document.activeElement;
                                                        if (activeEl?.id === 'captcha-input') {
                                                            setSpeechText("Nhập mã xác thực captcha ở kế bên nha.");
                                                        } else {
                                                            setSpeechText("Tôi vẫn đang canh gác hệ thống!");
                                                        }
                                                    }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button type="submit" disabled={loading} className="btn-submit">
                                        {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center py-10 transition-all duration-700 animate-in fade-in duration-500">
                                <span className="font-bold text-sm tracking-[0.2em] text-white flex items-center gap-3 mb-4">
                                    <span className="w-2.5 h-2.5 bg-white inline-block animate-pulse rounded-full"></span>
                                    GIẢI MÃ KHÓA TRUY CẬP...
                                </span>
                                <span className="text-[10px] text-white/50 tracking-widest uppercase font-mono">
                                    ESTABLISHING SECURE HANDSHAKE
                                </span>
                            </div>
                        )}

                    </div>
                </section>
            </div>
        </div>
    );
}
