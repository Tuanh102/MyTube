"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Radio, Users, DollarSign, MessageSquare, Send, AlertTriangle, Star, Gift, X, Sparkles, ShieldAlert, Pin, Flag } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { toggleFollow } from '@/lib/actions';

// Định nghĩa cấu trúc hạt xu vàng cho hoạt ảnh Canvas
class Coin {
  x: number;
  y: number;
  radius: number;
  speed: number;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;

  constructor(width: number) {
    this.x = Math.random() * width;
    this.y = -20 - Math.random() * 50;
    this.radius = 8 + Math.random() * 8;
    this.speed = 2 + Math.random() * 5;
    this.gravity = 0.15 + Math.random() * 0.15;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = -5 + Math.random() * 10;
    this.opacity = 1;
  }

  update() {
    this.y += this.speed;
    this.speed += this.gravity;
    this.rotation += this.rotationSpeed;
    if (this.y > 600) {
      this.opacity -= 0.02;
    }
  }
}

export default function LiveViewerPage() {
  const { id: streamId } = useParams();
  const router = useRouter();
  const { data: session, update } = useSession();
  const user = session?.user as any;

  const { theme } = useUI();
  const [isLightMode, setIsLightMode] = useState(false);

  const [viewerId] = useState(() => {
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem('live_viewer_id');
      if (existing) return existing;
      const generated = 'viewer_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('live_viewer_id', generated);
      return generated;
    }
    return '';
  });

  const [stream, setStream] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('20000');
  const [customDonateAmount, setCustomDonateAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationAlert, setDonationAlert] = useState<{ senderName: string; amount: number } | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam hoặc Lừa đảo');
  const [reportContent, setReportContent] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [liked, setLiked] = useState(false);

  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const coinsRef = useRef<Coin[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const viewerVideoRef = useRef<HTMLVideoElement>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isFollowed, setIsFollowed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const determineIsLight = () => {
        if (theme === 'light') return true;
        if (theme === 'dark') return false;
        if (theme === 'system') {
          return !window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        if (theme === 'schedule') {
          const hour = new Date().getHours();
          return hour >= 6 && hour < 18;
        }
        return false;
      };
      setIsLightMode(determineIsLight());
    }
  }, [theme]);

  const AUDIO_EFFECTS = [
    { file: 'vine-boom-sound.mp3', name: 'Vine Boom 💥' },
    { file: 'fart.mp3', name: 'Xì hơi 💨' },
    { file: 'bruh.mp3', name: 'Bruh 🤨' },
    { file: 'baby-laughing-meme.mp3', name: 'Em bé cười 👶' },
    { file: 'cat-laugh-meme-1.mp3', name: 'Mèo cười 🐱' },
    { file: 'metal-pipe-clang.mp3', name: 'Ống sắt rơi 🔩' },
    { file: 'sad-violin-the-meme-one.mp3', name: 'Violin buồn 🎻' },
    { file: 'the-price-is-right-losing-horn.mp3', name: 'Kèn thất bại 🎺' },
    { file: 'troi-oi-cuu-tui-troi-oi.mp3', name: 'Trời ơi cứu tui 😱' },
    { file: 'chac-la-cau-met-moi-lam.mp3', name: 'Cậu mệt mỏi 🥺' }
  ];

  const playedSoundIdsRef = useRef<Set<string>>(new Set());
  const joinTimeRef = useRef<number>(Date.now());

  // Bắt tin nhắn chat để tự động phát âm thanh
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.content && msg.content.startsWith('🔊 [SOUND_EFFECT]:')) {
        const messageId = msg._id || msg.id || `${msg.senderId}-${msg.created_at || msg.createdAt}`;
        const msgTime = new Date(msg.createdAt || msg.created_at || Date.now()).getTime();

        // Chỉ phát nếu tin nhắn này được gửi sau khi người dùng vào xem live (lệch tối đa 2 giây)
        if (msgTime >= joinTimeRef.current - 2000) {
          if (!playedSoundIdsRef.current.has(messageId)) {
            playedSoundIdsRef.current.add(messageId);
            const filename = msg.content.replace('🔊 [SOUND_EFFECT]:', '').trim();
            try {
              const audio = new Audio(`/assets/audio/${filename}`);
              audio.play();
            } catch (err) {
              console.error('Không thể phát âm thanh đồng bộ:', err);
            }
          }
        } else {
          // Đánh dấu các tin nhắn cũ là đã phát để tránh quét lại
          playedSoundIdsRef.current.add(messageId);
        }
      }
    });
  }, [messages]);

  useEffect(() => {
    if (stream?.identityType === 'channel' && stream?.identityId) {
      fetch(`/api/channels/${stream.identityId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Không thể tải thông tin kênh');
        })
        .then((channelData) => {
          if (channelData) {
            setSubscribersCount(channelData.subscribers?.length || 0);
            if (user?.id) {
              const subs = (channelData.subscribers || []).map((s: any) => s.toString());
              setIsFollowed(subs.includes(user.id.toString()));
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [stream?.identityId, stream?.identityType, user?.id]);

  const handleFollowChannel = async () => {
    if (!user?.id) {
      alert('Bạn cần đăng nhập để đăng ký kênh!');
      return;
    }
    if (!stream?.identityId) return;

    try {
      const res = await toggleFollow(stream.identityId, user.id.toString());
      if (res && res.success) {
        setIsFollowed(res.isFollowed);
        setSubscribersCount(res.subCount);
      } else {
        alert(res?.message || 'Có lỗi xảy ra khi thực hiện đăng ký.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra.');
    }
  };

  // Binding luồng video/audio thực tế vào thẻ video ngay khi DOM được render xong và nhận được Stream
  useEffect(() => {
    if (viewerVideoRef.current && remoteStream) {
      console.log('Gán luồng media thực tế vào thẻ Video thành công!');
      viewerVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, useCamera]);

  useEffect(() => {
    if (!stream?.isActive || !streamId || !viewerId) return;

    let active = true;
    let pc: RTCPeerConnection | null = null;
    let interval: NodeJS.Timeout | null = null;

    async function initWebRTC() {
      try {
        console.log('Khởi tạo kết nối WebRTC Viewer...');
        pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        pcRef.current = pc;

        // Thiết lập sự kiện nhận track từ Host
        pc.ontrack = (event) => {
          console.log('Nhận được track video/audio từ Host!', event.streams);
          if (event.streams[0]) {
            setRemoteStream(event.streams[0]);
            setUseCamera(true);
          }
        };

        // Chỉ định chiều nhận: Viewer chỉ nhận Video và Audio
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        // Tạo Offer
        const sdpOffer = await pc.createOffer();
        await pc.setLocalDescription(sdpOffer);

        // Gửi Offer SDP (hỗ trợ Timeout 400ms phòng trường hợp ICE gathering bị chậm do VPN/WSL...)
        let sdpSent = false;
        const sendSDPOffer = () => {
          if (sdpSent || !active) return;
          sdpSent = true;
          console.log('Gửi Offer SDP lên server báo hiệu...');
          fetch(`/api/live/${streamId}/signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              viewerId,
              type: 'offer',
              sdp: pc!.localDescription!.sdp
            })
          }).catch(err => console.error('Lỗi khi gửi Offer SDP:', err));
        };

        // ICE gathering (Non-Trickle WebRTC)
        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            console.log('ICE gathering hoàn tất cho Viewer.');
            sendSDPOffer();
          }
        };

        // Fallback gửi ngay sau 400ms
        setTimeout(() => {
          if (!sdpSent) {
            console.log('ICE gathering lâu, tự động gửi Offer SDP sau 400ms...');
            sendSDPOffer();
          }
        }, 400);

        // Polling để nhận Answer từ Host
        const checkAnswer = async () => {
          if (!active || !pc) return;
          try {
            const res = await fetch(`/api/live/${streamId}/signal/${viewerId}`);
            if (!res.ok) return;

            const signalData = await res.json();
            if (signalData && signalData.answer && !pc.remoteDescription) {
              console.log('Nhận được Answer SDP từ Host, bắt đầu kết nối...');
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signalData.answer }));
              if (interval) clearInterval(interval);
            }
          } catch (err) {
            console.error('Lỗi khi check Answer SDP:', err);
          }
        };

        interval = setInterval(checkAnswer, 2000);
      } catch (err) {
        console.error('Lỗi khi khởi tạo kết nối WebRTC phía Viewer:', err);
        setUseCamera(false);
      }
    }

    initWebRTC();

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      if (pc) {
        pc.close();
      }
      pcRef.current = null;
    };
  }, [stream?.isActive, streamId, viewerId]);

  // 1. Fetch live stream details and messages polling
  useEffect(() => {
    if (!streamId) return;

    const fetchStreamData = async () => {
      try {
        const streamRes = await fetch(`/api/live/${streamId}?viewerId=${viewerId}`);
        if (streamRes.ok) {
          const data = await streamRes.json();
          setStream(data);
        } else if (streamRes.status === 404) {
          setStream((prev: any) => prev ? { ...prev, isActive: false } : { isActive: false });
        }

        const messagesRes = await fetch(`/api/live/${streamId}/messages`);
        if (messagesRes.ok) {
          const msgData = await messagesRes.json();
          setMessages(msgData);
        }
      } catch (err) {
        console.error('Lỗi khi fetch thông tin stream:', err);
      }
    };

    fetchStreamData();
    const interval = setInterval(fetchStreamData, 2000);

    return () => clearInterval(interval);
  }, [streamId]);

  // Cuộn chat xuống dưới cùng (chỉ cuộn khung chat, tránh giật màn hình toàn trang)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 2. Vòng lặp vẽ Gold Coin Rain lên HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Đặt chiều rộng và cao chuẩn cho canvas
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 450;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const coins = coinsRef.current;
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.update();

        if (coin.opacity <= 0) {
          coins.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = coin.opacity;
        ctx.translate(coin.x, coin.y);
        ctx.rotate((coin.rotation * Math.PI) / 180);

        // Vẽ đồng tiền xu vàng 3D lộng lẫy
        const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, coin.radius);
        gradient.addColorStop(0, '#ffe57f'); // Vàng sáng
        gradient.addColorStop(0.4, '#ffd54f');
        gradient.addColorStop(0.8, '#ffb300'); // Vàng đậm
        gradient.addColorStop(1, '#ff6f00'); // Viền cam bóng bẩy

        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Đường vân nổi tròn ở giữa đồng tiền
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffe082';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ký hiệu đô la hoặc ngôi sao lấp lánh ở trung tâm xu
        ctx.font = `bold ${coin.radius * 0.8}px Arial`;
        ctx.fillStyle = '#ff8f00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 3. Trigger hiệu ứng mưa xu vàng
  const triggerCoinRain = (amount: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Số xu rơi tỉ lệ thuận với số tiền donate (tối đa 150 xu để giữ hiệu năng)
    const coinCount = Math.min(150, Math.floor(amount / 500) + 15);
    const newCoins = Array.from({ length: coinCount }, () => new Coin(canvas.width));
    
    coinsRef.current = [...coinsRef.current, ...newCoins];
  };

  // 4. Gửi tin nhắn chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamId || !inputText.trim()) return;

    if (!user?.id) {
      alert('Bạn cần đăng nhập để tham gia trò chuyện trực tiếp!');
      return;
    }

    try {
      const res = await fetch(`/api/live/${streamId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          content: inputText.trim(),
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Gửi quyên góp (Donate)
  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamId || !user?.id) return;

    const finalAmount = Number(customDonateAmount) || Number(donateAmount);
    if (!finalAmount || finalAmount <= 0) {
      alert('Số tiền quyên góp không hợp lệ!');
      return;
    }

    if (user.balance < finalAmount / 1000) {
      const confirmDeposit = window.confirm(`Số dư ví của bạn (${(user.balance * 1000)?.toLocaleString('vi-VN')} VNĐ) không đủ để donate ${finalAmount.toLocaleString('vi-VN')} VNĐ.\n\nBạn có muốn đi đến trang Nạp tiền ví số dư ảo ngay lập tức không?`);
      if (confirmDeposit) {
        router.push('/studio?tab=revenue');
      }
      return;
    }

    setIsDonating(true);
    try {
      const res = await fetch(`/api/live/${streamId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerId: user.id,
          amount: finalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi gửi quyên góp');
      }

      // Đóng modal, reset
      setShowDonateModal(false);
      setCustomDonateAmount('');

      // Cập nhật session user balance ở client
      await update({
        ...session,
        user: {
          ...session?.user,
          balance: data.viewerBalance,
        },
      });

      // Hiển thị thông báo trên màn hình
      setDonationAlert({ senderName: user.name || user.username || 'Khán giả', amount: finalAmount });
      setTimeout(() => setDonationAlert(null), 5000);

      // Kích hoạt mưa xu vàng lộng lẫy
      triggerCoinRain(finalAmount);

      // Thêm ngay tin nhắn donate vào danh sách cục bộ
      if (data.donateMessage) {
        setMessages((prev) => [...prev, data.donateMessage]);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi hệ thống khi thực hiện quyên góp');
    } finally {
      setIsDonating(false);
    }
  };

  // 6. Gửi thích (Like) phòng Live (Spam tim thoải mái và hoạt ảnh bay bổng)
  const handleLikeStream = async () => {
    if (!streamId) return;

    // 1. Tạo hiệu ứng trái tim bay bổng
    const container = document.getElementById('hearts-container');
    if (container) {
      const heart = document.createElement('div');
      const colors = ['#ef4444', '#ec4899', '#f43f5e', '#d946ef', '#a855f7', '#ff2e93', '#ff8a00'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const icons = ['❤️', '⭐', '💖', '💕', '💘'];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      
      heart.innerText = randomIcon;
      heart.style.position = 'absolute';
      heart.style.bottom = '0';
      heart.style.left = `${Math.random() * 60 + 20}%`;
      heart.style.fontSize = `${Math.random() * 12 + 16}px`;
      heart.style.color = randomColor;
      heart.style.userSelect = 'none';
      heart.style.pointerEvents = 'none';
      heart.style.animation = 'floatUp 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards';
      
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    }

    setStream((prev: any) => prev ? { ...prev, likeCount: (prev.likeCount || 0) + 1 } : null);
    setLiked(true);
    setTimeout(() => setLiked(false), 300);
    try {
      await fetch(`/api/live/${streamId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Lỗi thích live stream:', err);
    }
  };

  // 7. Gửi báo cáo vi phạm Live Stream
  const handleReportStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamId) return;
    if (!user?.id) {
      alert('Bạn cần đăng nhập để thực hiện báo cáo vi phạm!');
      return;
    }

    setIsReporting(true);
    try {
      const res = await fetch(`/api/live/${streamId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          reason: reportReason,
          content: reportContent
        })
      });
      if (res.ok) {
        alert('Báo cáo vi phạm của bạn đã được gửi thành công! Ban kiểm duyệt sẽ tiến hành đánh giá phòng live này.');
        setShowReportModal(false);
        setReportContent('');
      } else {
        alert('Gửi báo cáo không thành công. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi báo cáo:', err);
      alert('Lỗi hệ thống khi gửi báo cáo');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-[#f4f4f5] text-zinc-900' : 'bg-[#0d0d0d] text-white'} pt-20 px-4 md:px-8 pb-8 relative overflow-hidden transition-colors duration-300`}>
      {/* Dynamic Keyframes for floating hearts */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
            transform: translateY(-60px) scale(1.1) rotate(10deg) translateX(10px);
          }
          100% {
            transform: translateY(-180px) scale(1.4) rotate(-15deg) translateX(-15px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Background neon glows */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none ${isLightMode ? 'bg-red-500/[0.03]' : 'bg-red-600/5'}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none ${isLightMode ? 'bg-blue-500/[0.03]' : 'bg-blue-600/5'}`} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-4">
        {/* Left Column: simulated video player + Stream info */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div ref={videoRef} className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl flex flex-col justify-end">
            
            {/* HTML5 Canvas overlay for Gold Coin Rain */}
            <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none w-full h-full" />

            {/* Donation Alert Screen Overlay */}
            {donationAlert && (
              <div className="absolute inset-x-4 top-1/3 z-30 flex justify-center animate-in zoom-in-95 duration-500">
                <div className="bg-black/85 border-2 border-amber-400 p-6 rounded-3xl text-center max-w-sm backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                  <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce shadow-lg">
                    <Sparkles size={26} className="text-zinc-950 fill-zinc-950" />
                  </div>
                  <h4 className="text-lg font-black text-amber-300 uppercase tracking-wider mb-1">{donationAlert.senderName}</h4>
                  <p className="text-white/80 text-sm">Vừa gửi tặng <span className="text-green-400 font-extrabold text-base">{donationAlert.amount.toLocaleString('vi-VN')} VNĐ</span></p>
                  <p className="text-[10px] text-amber-400/60 uppercase tracking-widest mt-2 animate-pulse">★ Gold Coin Rain activated ★</p>
                </div>
              </div>
            )}

            {/* Simulated Live Stream Feed - Dynamic audio visualizer & animations */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-[#18181b] to-black z-0">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              {stream?.isActive ? (
                useCamera ? (
                  <video 
                    ref={viewerVideoRef}
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                ) : (
                  <>
                    {/* Flashing neon graphics to represent simulated webcam/broadcaster space */}
                    <div className="w-28 h-28 bg-red-600/10 border-2 border-red-500/30 rounded-full flex items-center justify-center animate-pulse relative">
                      <div className="w-20 h-20 bg-blue-600/10 border-2 border-blue-500/20 rounded-full flex items-center justify-center">
                        <Radio size={36} className="text-red-500 animate-pulse" />
                      </div>
                      {/* Ring layers */}
                      <div className="absolute -inset-4 border border-dashed border-red-500/20 rounded-full animate-spin-slow" />
                    </div>

                    {/* Pulsing visualizer bars */}
                    <div className="flex gap-1.5 items-end justify-center h-12 mt-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-gradient-to-t from-red-600 to-blue-500 rounded-full animate-pulse"
                          style={{
                            height: `${15 + Math.random() * 35}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${0.6 + Math.random() * 0.8}s`
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-white/40 text-xs mt-4 tracking-widest uppercase flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> Camera feed active & secure
                    </p>
                  </>
                )
              ) : (
                <div className="text-center space-y-4">
                  <ShieldAlert className="w-16 h-16 text-white/20 mx-auto animate-pulse" />
                  <h3 className="text-lg font-bold text-white/50">Phiên Live Stream đã kết thúc</h3>
                  <p className="text-white/30 text-xs">Cảm ơn bạn đã theo dõi và ủng hộ Host.</p>
                </div>
              )}
            </div>

            {/* Overlays */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2.5">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                <Radio size={12} className="animate-pulse" /> • TRỰC TIẾP
              </span>
              <span className="bg-black/60 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                <Users size={12} className="text-blue-400" /> {stream?.viewerCount || 0} người xem
              </span>
            </div>

          </div>

          {/* Tách biệt nút Donate & Metadata ngoài khung video phát trực tiếp */}
          <div className={`border rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 ${
            isLightMode
              ? 'bg-white border-zinc-200 shadow-zinc-200/50'
              : 'bg-[#141414]/90 border-white/5 shadow-black/40'
          }`}>
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl font-bold tracking-tight mb-2 ${isLightMode ? 'text-zinc-900' : 'text-white'}`}>{stream?.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border ${isLightMode ? 'border-zinc-200' : 'border-white/10'}`}>
                    <img src={stream?.streamerAvatar || '/assets/img/avata.jpg'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm block ${isLightMode ? 'text-zinc-950' : 'text-white'}`}>{stream?.streamerName}</span>
                      {stream?.identityType === 'channel' && (
                        <button
                          onClick={handleFollowChannel}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer ${
                            isFollowed
                              ? 'bg-zinc-500/20 text-zinc-500 border border-zinc-500/30'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {isFollowed ? 'Đã đăng ký' : 'Đăng ký'}
                        </button>
                      )}
                    </div>
                    <span className={`text-xs block ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>
                      {stream?.identityType === 'channel' 
                        ? `${subscribersCount.toLocaleString('vi-VN')} người đăng ký`
                        : 'Đang Live'
                      }
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className={`flex items-center gap-3 border px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                  isLightMode
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    : 'bg-white/5 border-white/5 text-white/60'
                }`}>
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-blue-400" /> {stream?.viewerCount || 0} đang xem</span>
                  <span className={`w-px h-3 ${isLightMode ? 'bg-zinc-200' : 'bg-white/10'}`} />
                  <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-amber-500" /> {stream?.likeCount || 0} lượt thích</span>
                </div>
              </div>
            </div>

            {stream?.isActive && (
              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
                {/* Nút Like (Spam tim liên tục) */}
                <div className="relative">
                  {/* Hearts Floating Container */}
                  <div id="hearts-container" className="absolute bottom-full left-1/2 -translate-x-1/2 pointer-events-none z-50 w-24 h-48 overflow-hidden" />
                  
                  <button 
                    onClick={handleLikeStream}
                    className={`border p-4 rounded-2xl transition active:scale-90 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all duration-300 ${
                      isLightMode
                        ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'
                    }`}
                  >
                    <Star size={16} className={`transition-all ${liked ? 'scale-125 text-red-500 fill-red-500' : ''}`} />
                    Thích
                  </button>
                </div>

                {/* Nút Báo cáo */}
                <button 
                  onClick={() => setShowReportModal(true)}
                  className={`border p-4 rounded-2xl transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all duration-300 ${
                    isLightMode
                      ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600 hover:text-red-600'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/60 hover:text-red-500'
                  }`}
                >
                  Báo cáo
                </button>

                {/* Nút Donate cực đẹp */}
                <button 
                  onClick={() => setShowDonateModal(true)}
                  className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:scale-[1.03] active:scale-95 text-zinc-950 font-black px-6 py-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 text-xs uppercase tracking-wider cursor-pointer w-full md:w-auto"
                >
                  <Gift size={16} className="fill-zinc-950" /> Donate Quyên góp
                </button>
              </div>
            )}
          </div>

          {/* Wallet Balance Info */}
          <div className={`border rounded-3xl p-6 backdrop-blur-md flex items-center justify-between transition-all duration-300 ${
            isLightMode
              ? 'bg-white border-zinc-200 shadow-md shadow-zinc-100'
              : 'bg-[#181818]/60 border-white/5'
          }`}>
            <div className="space-y-1">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isLightMode ? 'text-zinc-400' : 'text-white/40'}`}>Số dư ví của bạn</p>
              <h3 className={`text-2xl font-black ${isLightMode ? 'text-zinc-950' : 'text-white'}`}>{((user?.balance || 0) * 1000).toLocaleString('vi-VN')} <span className={`text-sm font-normal ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>VNĐ</span></h3>
            </div>
            <button 
              onClick={() => router.push('/studio?tab=revenue')}
              className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/25 px-5 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
            >
              Nạp thêm tiền
            </button>
          </div>
        </div>

        {/* Right Column: Live Chat Panel (4/12) */}
        <div className={`lg:col-span-4 border rounded-3xl flex flex-col h-[600px] shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
          isLightMode
            ? 'bg-white border-zinc-200/80 shadow-zinc-200/30'
            : 'bg-[#141414]/90 border-white/10'
        }`}>
          {/* Header */}
          <div className={`p-5 border-b flex items-center justify-between transition-all duration-300 ${
            isLightMode ? 'border-zinc-100 bg-zinc-50/50' : 'border-white/5 bg-black/20'
          }`}>
            <span className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isLightMode ? 'text-zinc-800' : 'text-white'}`}>
              <MessageSquare size={16} className="text-red-500" /> Trò chuyện trực tiếp
            </span>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          </div>

          {/* Danh sách bình luận ghim đồng bộ từ Host (Tối đa 3 bình luận) */}
          {stream?.pinnedMessages && stream.pinnedMessages.length > 0 && (
            <div className={`px-5 py-3 border-b space-y-2 max-h-40 overflow-y-auto custom-scrollbar transition-all duration-300 ${
              isLightMode ? 'border-zinc-100 bg-zinc-50/30' : 'border-white/5 bg-white/[0.02]'
            }`}>
              {stream.pinnedMessages.map((pMsg: any) => (
                <div key={pMsg._id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs animate-in slide-in-from-top-1 duration-200 ${
                  isLightMode
                    ? 'bg-red-50 border-red-200/60 text-zinc-800'
                    : 'bg-red-600/5 border-red-500/10 text-white'
                }`}>
                  <Pin size={10} className="text-red-500 mt-1 fill-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className={`font-extrabold mr-1.5 ${isLightMode ? 'text-red-700' : 'text-white'}`}>{pMsg.senderName}:</span>
                    <span className={`break-words ${isLightMode ? 'text-zinc-700' : 'text-white/80'}`}>{pMsg.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages Log */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                const isDonate = msg.type === 'donation';
                if (isDonate) {
                  return (
                    <div key={msg._id || index} className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-400/30 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-amber-400 text-zinc-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                            <Star size={8} className="fill-zinc-950" /> DONATE
                          </span>
                          <span className="text-amber-300 font-extrabold text-xs">{msg.senderName}</span>
                        </div>
                        <p className="text-white text-sm font-bold">{msg.content}</p>
                      </div>
                    </div>
                  );
                }

                // Nhận diện và che mặt tin nhắn Soundboard đặc biệt
                const isSoundEffect = msg.content?.startsWith('🔊 [SOUND_EFFECT]:');
                if (isSoundEffect) {
                  return null; // Don't render sound triggers in chat list!
                }

                const isHostMsg = msg.senderId === stream?.streamerId;
                return (
                  <div key={msg._id || index} className="flex gap-3 text-sm animate-in slide-in-from-bottom-1 duration-200">
                    <div className={`w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border ${isLightMode ? 'border-zinc-100' : 'border-white/5'}`}>
                      <img src={msg.senderAvatar || '/assets/img/avata.jpg'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs mb-0.5 flex items-center gap-1 font-bold ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>
                        {msg.senderName}
                        {isHostMsg && <span className="bg-red-600/20 border border-red-500/30 text-red-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">STREAMER</span>}
                      </p>
                      <p className={`leading-relaxed break-words ${isLightMode ? 'text-zinc-800' : 'text-white/80'}`}>{msg.content}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6">
                <p className={`text-xs italic ${isLightMode ? 'text-zinc-400' : 'text-white/20'}`}>Chưa có bình luận nào. Hãy gửi lời chào đầu tiên!</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className={`p-4 border-t flex items-center gap-2.5 transition-all duration-300 ${
            isLightMode ? 'border-zinc-100 bg-zinc-50/50' : 'border-white/5 bg-black/10'
          }`}>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={user?.id ? "Tham gia thảo luận..." : "Đăng nhập để chat..."}
              className={`flex-1 border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition disabled:opacity-50 transition-all duration-300 ${
                isLightMode
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:bg-white'
                  : 'bg-black/40 border-white/10 text-white'
              }`}
              disabled={!user?.id}
              required
            />
            <button 
              type="submit"
              disabled={!user?.id}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-950 text-white p-3 rounded-2xl transition active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Donate Gift Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 text-left">
            <button 
              onClick={() => setShowDonateModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-sm font-bold cursor-pointer"
            >
              Đóng
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Gift size={20} className="text-amber-400" /> Quyên góp cho Streamer
            </h3>
            <p className="text-white/40 text-xs mb-6">Chọn gói quà tặng hoặc điền số tiền tùy chỉnh. 100% số tiền sẽ được chuyển trực tiếp vào ví của Streamer.</p>

            <form onSubmit={handleDonateSubmit} className="space-y-6">
              {/* Grid các gói quà tặng */}
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase mb-3 block tracking-wider">Quà tặng nhanh</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '🌹 Hoa hồng', val: '10000', desc: 'Gửi ngàn lời chúc' },
                    { label: '🏆 Cúp vàng', val: '50000', desc: 'Vinh danh streamer' },
                    { label: '👑 Vương miện', val: '100000', desc: 'Đẳng cấp người xem' },
                    { label: '🏎️ Siêu xe', val: '500000', desc: 'Đỉnh cao donate' },
                  ].map((pkg) => (
                    <div
                      key={pkg.val}
                      onClick={() => {
                        setDonateAmount(pkg.val);
                        setCustomDonateAmount('');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        donateAmount === pkg.val && !customDonateAmount
                          ? 'bg-amber-400/10 border-amber-400/50 shadow-md shadow-amber-400/5'
                          : 'bg-white/5 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <h4 className="font-extrabold text-sm text-white mb-0.5">{pkg.label}</h4>
                      <p className="text-amber-400 font-black font-mono text-xs">{Number(pkg.val).toLocaleString('vi-VN')} đ</p>
                      <p className="text-[9px] text-white/30 mt-1">{pkg.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Số tiền tùy chọn */}
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase mb-2 block tracking-wider">Hoặc nhập số tiền tùy chọn (VNĐ)</label>
                <input 
                  type="number" 
                  value={customDonateAmount}
                  onChange={(e) => {
                    setCustomDonateAmount(e.target.value);
                    setDonateAmount('');
                  }}
                  placeholder="Nhập số tiền VNĐ..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amber-400 transition text-base"
                  min={1000}
                />
              </div>

              {/* Thông tin ví hiện tại */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-xs">
                <span className="text-white/40">Số dư ví của bạn:</span>
                <span className="text-white font-extrabold">{((user?.balance || 0) * 1000).toLocaleString('vi-VN')} VNĐ</span>
              </div>

              <button 
                type="submit" 
                disabled={isDonating}
                className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 text-zinc-950 font-black py-4 rounded-2xl transition shadow-xl shadow-amber-500/15 flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4 cursor-pointer"
              >
                {isDonating ? 'Đang thực hiện giao dịch...' : 'Gửi Quyên Góp Ngay 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl max-w-md w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 text-left">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-sm font-bold cursor-pointer"
            >
              Đóng
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Flag size={20} className="text-red-500" /> Báo cáo Live Stream
            </h3>
            <p className="text-white/40 text-xs mb-6">Báo cáo của bạn sẽ được gửi ẩn danh và Ban kiểm duyệt MyTube sẽ xử lý phiên live này lập tức nếu vi phạm.</p>

            <form onSubmit={handleReportStream} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase mb-2.5 block tracking-wider">Lý do báo cáo</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-500 transition text-sm cursor-pointer"
                >
                  <option value="Bạo lực hoặc Quấy rối">Bạo lực hoặc Quấy rối</option>
                  <option value="Nội dung khiêu dâm">Nội dung khiêu dâm</option>
                  <option value="Spam hoặc Lừa đảo">Spam hoặc Lừa đảo</option>
                  <option value="Thông tin sai lệch">Thông tin sai lệch</option>
                  <option value="Khác">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase mb-2 block tracking-wider">Mô tả chi tiết</label>
                <textarea 
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Mô tả hành vi vi phạm cụ thể để ban kiểm duyệt dễ xử lý..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-500 transition text-sm h-28 resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isReporting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-red-600/15 flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4 cursor-pointer"
              >
                {isReporting ? 'Đang gửi báo cáo...' : 'Gửi Báo Cáo Vi Phạm 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
