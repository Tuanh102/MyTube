"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Radio, Users, DollarSign, MessageSquare, Power, Send, AlertTriangle, ShieldCheck, Star, Pin, Maximize2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function LiveHostPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const streamId = searchParams.get('id');

  const { theme } = useUI();
  const [isLightMode, setIsLightMode] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);

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

  const playSoundEffect = async (filename: string, name: string) => {
    // 1. Phát âm thanh tại máy Host
    try {
      const audio = new Audio(`/assets/audio/${filename}`);
      audio.play();
    } catch (err) {
      console.error('Không thể phát âm thanh:', err);
    }

    // 2. Gửi tin nhắn chat đặc biệt để đồng bộ cho các Viewer
    if (!streamId || !session?.user?.id) return;
    try {
      await fetch(`/api/live/${streamId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session.user.id,
          content: `🔊 [SOUND_EFFECT]: ${filename}`,
        }),
      });
    } catch (err) {
      console.error('Lỗi khi gửi hiệu ứng âm thanh:', err);
    }
  };

  const [stream, setStream] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeStreamRef = useRef<any>(null);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 1. Khởi chạy webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: true,
        });
        localStreamRef.current = streamData;
        if (videoRef.current) {
          videoRef.current.srcObject = streamData;
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Không thể mở Camera:', err);
        setPermissionError(true);
      }
    }

    if (streamId) {
      startCamera();
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, [streamId]);

  // Polling các tín hiệu từ các Viewer để thiết lập WebRTC connection
  useEffect(() => {
    if (!streamId || !cameraActive) return;

    const handleSignaling = async () => {
      try {
        const res = await fetch(`/api/live/${streamId}/signals`);
        if (!res.ok) return;

        const signalsList = await res.json();
        if (!Array.isArray(signalsList)) return;

        for (const sig of signalsList) {
          const { viewerId, offer } = sig;
          if (!viewerId || !offer) continue;

          // Nếu viewerId này chưa có PeerConnection thì thiết lập mới
          if (!peerConnectionsRef.current.has(viewerId)) {
            console.log('Phát hiện Viewer mới yêu cầu kết nối:', viewerId);
            
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerConnectionsRef.current.set(viewerId, pc);

            // Thêm tracks từ local camera vào peer connection
            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
              });
            }

            // Ghi nhận remote description (SDP Offer từ Viewer)
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));

            // Tạo SDP Answer
            const sdpAnswer = await pc.createAnswer();
            await pc.setLocalDescription(sdpAnswer);

            // Lắng nghe tập hợp ICE candidates (Non-Trickle) với Timeout 400ms phòng trường hợp ICE gathering chậm
            let answerSent = false;
            const sendSDPAnswer = () => {
              if (answerSent) return;
              answerSent = true;
              console.log('Gửi Answer SDP cho Viewer:', viewerId);
              fetch(`/api/live/${streamId}/signal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  viewerId,
                  type: 'answer',
                  sdp: pc.localDescription!.sdp
                })
              }).catch(err => console.error('Lỗi khi gửi Answer SDP:', err));
            };

            pc.onicecandidate = (event) => {
              if (!event.candidate) {
                console.log('ICE gathering hoàn tất cho Viewer:', viewerId);
                sendSDPAnswer();
              }
            };

            setTimeout(() => {
              if (!answerSent) {
                console.log('ICE gathering lâu, tự động gửi Answer SDP sau 400ms cho Viewer:', viewerId);
                sendSDPAnswer();
              }
            }, 400);
          }
        }
      } catch (err) {
        console.error('Lỗi khi xử lý báo hiệu phía Host:', err);
      }
    };

    const interval = setInterval(handleSignaling, 2000);
    return () => clearInterval(interval);
  }, [streamId, cameraActive]);

  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [hostBalance, setHostBalance] = useState<number>(0);

  // 2. Fetch thông tin phiên stream & chat messages
  useEffect(() => {
    if (!streamId) return;

    const fetchStreamData = async () => {
      try {
        const streamRes = await fetch(`/api/live/${streamId}?isHost=true`);
        if (streamRes.ok) {
          const data = await streamRes.json();
          setStream(data);
          activeStreamRef.current = data;

          // Nếu stream đã bị kết thúc từ trước, tự chuyển hướng
          if (!data.isActive) {
            router.push('/studio?tab=revenue');
          }
        }

        // Fetch số dư thật của Host trực tiếp từ DB
        if (session?.user?.id) {
          const userRes = await fetch(`/api/users/profile/${session.user.id}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setHostBalance((userData.balance || 0) * 1000);
          }
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
  }, [streamId, router, session?.user?.id]);

  // Đồng hồ đếm giờ Live thực tế
  useEffect(() => {
    if (!stream?.createdAt) return;

    const updateTimer = () => {
      const diff = Date.now() - new Date(stream.createdAt).getTime();
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

      const pad = (num: number) => String(num).padStart(2, '0');
      setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [stream?.createdAt]);

  // Ghim và bỏ ghim bình luận
  const handlePinMessage = async (messageId: string) => {
    if (!streamId || !messageId) return;
    try {
      const res = await fetch(`/api/live/${streamId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Lỗi khi ghim bình luận');
      } else {
        setStream(data);
      }
    } catch (err) {
      console.error('Lỗi ghim bình luận:', err);
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    if (!streamId || !messageId) return;
    try {
      const res = await fetch(`/api/live/${streamId}/unpin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      const data = await res.json();
      if (res.ok) {
        setStream(data);
      }
    } catch (err) {
      console.error('Lỗi bỏ ghim bình luận:', err);
    }
  };

  // Tự động cuộn chat xuống dưới (chỉ cuộn khung chat, tránh giật màn hình toàn trang)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. Gửi tin nhắn chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamId || !inputText.trim() || !session?.user?.id) return;

    try {
      const res = await fetch(`/api/live/${streamId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session.user.id,
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

  // 4. Kết thúc phiên live
  const handleEndStream = async () => {
    if (!streamId) return;
    const confirmClose = window.confirm("Bạn có chắc chắn muốn kết thúc phiên Live Stream này?");
    if (!confirmClose) return;

    setIsEnding(true);
    try {
      await fetch(`/api/live/${streamId}/end`, { method: 'POST' });
      alert('Đã kết thúc phiên Live Stream thành công!');
      router.push('/studio?tab=revenue');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi kết thúc live stream');
    } finally {
      setIsEnding(false);
    }
  };

  if (!streamId) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold">Không tìm thấy ID phiên Live!</h2>
          <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">Quay lại trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 px-4 md:px-8 pb-8 relative overflow-hidden transition-all duration-300 ${
      isLightMode ? 'bg-[#f4f5f7] text-zinc-800' : 'bg-[#0d0d0d] text-white'
    }`}>
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-4">
        {/* Left Column: Cam Viewport (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className={`relative aspect-video rounded-3xl overflow-hidden border bg-black shadow-2xl flex items-center justify-center ${
            isLightMode ? 'border-zinc-200' : 'border-white/10'
          }`}>
            {permissionError ? (
              <div className="text-center p-6 space-y-4">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold">Lỗi Quyền Truy Cập Camera!</h3>
                <p className="text-white/40 text-xs max-w-sm">Vui lòng kiểm tra cài đặt trình duyệt và cấp quyền truy cập Camera/Micro cho MyTube.</p>
              </div>
            ) : !cameraActive ? (
              <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white/40 text-xs">Đang mở Camera thiết bị...</p>
              </div>
            ) : null}

            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Overlays */}
            <div className="absolute top-6 left-6 flex items-center gap-2.5 z-10">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                <Radio size={12} className="animate-pulse" /> LIVE STREAM HOST
              </span>
              <span className="bg-black/60 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                <Users size={12} className="text-blue-400" /> {stream?.viewerCount || 0} người xem
              </span>
            </div>
          </div>

          {/* Metadata & Bảng chèn âm thanh meme (Soundboard) */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col gap-6 backdrop-blur-md transition-all ${
            isLightMode 
              ? 'bg-white border-zinc-200 text-zinc-800 shadow-zinc-200/50' 
              : 'bg-[#141414]/90 border-white/5 text-white shadow-black/40'
          }`}>
             {/* Metadata, "Dừng Phát Live" & Soundboard Grouped Button */}
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-zinc-200/60 dark:border-white/5 relative">
               <div className="min-w-0">
                 <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /> Đang phát sóng trực tiếp
                 </p>
                 <h1 className="text-xl font-extrabold tracking-tight truncate">{stream?.title}</h1>
                 <p className={`text-xs mt-1 ${isLightMode ? 'text-zinc-500' : 'text-white/60'}`}>
                   Phát dưới tư cách: <span className="font-extrabold text-red-500">{stream?.streamerName}</span>
                 </p>
               </div>

               <div className="flex items-center gap-3 flex-wrap md:flex-nowrap w-full md:w-auto relative">
                 {/* Grouped Soundboard Button Popover */}
                 <div className="relative">
                   <button
                     onClick={() => setIsSoundboardOpen(!isSoundboardOpen)}
                     className={`px-5 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer ${
                       isLightMode
                         ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800 shadow-sm'
                         : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'
                     }`}
                   >
                     🔊 Chèn âm thanh
                   </button>

                   {isSoundboardOpen && (
                     <div className={`absolute bottom-full right-0 mb-3 w-80 p-5 rounded-3xl border shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                       isLightMode
                         ? 'bg-white border-zinc-200 shadow-zinc-200/40 text-zinc-800'
                         : 'bg-[#1e1e1e] border-white/10 shadow-black/80 text-white'
                     }`}>
                       <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-white/5">
                         <h4 className="text-[10px] font-black uppercase tracking-wider">Hiệu ứng âm thanh meme</h4>
                         <button onClick={() => setIsSoundboardOpen(false)} className="text-[10px] opacity-40 hover:opacity-100 uppercase font-bold cursor-pointer">Đóng</button>
                       </div>
                       <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                         {AUDIO_EFFECTS.map((effect) => (
                           <button
                             key={effect.file}
                             onClick={() => {
                               playSoundEffect(effect.file, effect.name);
                               setIsSoundboardOpen(false);
                             }}
                             className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer flex items-center gap-2 ${
                               isLightMode
                                 ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                                 : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'
                             }`}
                           >
                             <span className="text-sm">{effect.name.split(' ').pop()}</span>
                             <span className="truncate">{effect.name.split(' ').slice(0, -1).join(' ')}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Dừng phát live button */}
                 <button 
                   onClick={handleEndStream}
                   disabled={isEnding}
                   className="bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 disabled:from-red-950 px-6 py-3.5 rounded-2xl transition text-white font-extrabold flex items-center gap-2 active:scale-95 shadow-lg shadow-red-600/20 text-xs uppercase tracking-wider cursor-pointer w-full md:w-auto"
                 >
                   <Power size={14} /> Dừng Phát Live
                 </button>
               </div>
             </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`border rounded-2xl p-5 backdrop-blur-md flex items-center justify-between transition-all ${
              isLightMode 
                ? 'bg-white border-zinc-200 text-zinc-800' 
                : 'bg-[#181818]/60 border-white/5 text-white'
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>Thời gian phát</p>
                <p className="text-lg font-black font-mono">{elapsedTime}</p>
              </div>
              <Radio size={24} className="text-red-500 animate-pulse" />
            </div>

            <div className={`border rounded-2xl p-5 backdrop-blur-md flex items-center justify-between transition-all ${
              isLightMode 
                ? 'bg-white border-zinc-200 text-zinc-800' 
                : 'bg-[#181818]/60 border-white/5 text-white'
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>Doanh thu Live</p>
                <p className="text-lg font-black text-green-500 font-mono">{(stream?.earnings || 0).toLocaleString('vi-VN')} đ</p>
              </div>
              <DollarSign size={24} className="text-green-500" />
            </div>

            <div className={`border rounded-2xl p-5 backdrop-blur-md flex items-center justify-between transition-all ${
              isLightMode 
                ? 'bg-white border-zinc-200 text-zinc-800' 
                : 'bg-[#181818]/60 border-white/5 text-white'
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>Số dư tài khoản</p>
                <p className="text-lg font-black text-blue-400 font-mono">{hostBalance.toLocaleString('vi-VN')} đ</p>
              </div>
              <DollarSign size={24} className="text-blue-400" />
            </div>

            <div className={`border rounded-2xl p-5 backdrop-blur-md flex items-center justify-between transition-all ${
              isLightMode 
                ? 'bg-white border-zinc-200 text-zinc-800' 
                : 'bg-[#181818]/60 border-white/5 text-white'
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>Lượt thích</p>
                <p className="text-lg font-black text-amber-500 font-mono">{stream?.likeCount || 0}</p>
              </div>
              <Star size={24} className="text-amber-500 fill-amber-500" />
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat Panel (4/12) */}
        <div className={`lg:col-span-4 border rounded-3xl flex flex-col h-[600px] shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
          isLightMode
            ? 'bg-white border-zinc-200 shadow-zinc-200/30 text-zinc-800'
            : 'bg-[#141414]/90 border-white/10 text-white'
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

          {/* Danh sách bình luận ghim (Tối đa 3 bình luận) */}
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
                  <div className="flex-1 min-w-0 font-medium text-left">
                    <span className={`font-extrabold mr-1.5 ${isLightMode ? 'text-red-700' : 'text-white'}`}>{pMsg.senderName}:</span>
                    <span className={`break-words ${isLightMode ? 'text-zinc-700' : 'text-white/80'}`}>{pMsg.content}</span>
                  </div>
                  <button 
                    onClick={() => handleUnpinMessage(pMsg._id)} 
                    className="text-[9px] font-bold text-red-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-500/10 transition uppercase tracking-wider flex-shrink-0 cursor-pointer"
                  >
                    Bỏ ghim
                  </button>
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
                        <p className="text-white text-sm font-bold text-left">{msg.content}</p>
                      </div>
                    </div>
                  );
                }

                // Nhận diện và che mặt tin nhắn Soundboard đặc biệt
                const isSoundEffect = msg.content?.startsWith('🔊 [SOUND_EFFECT]:');
                if (isSoundEffect) {
                  return null; // Don't render sound triggers in host chat list!
                }

                const isHostMsg = msg.senderId === stream?.streamerId;
                const isAlreadyPinned = stream?.pinnedMessages?.some((pMsg: any) => pMsg._id === msg._id);
                return (
                  <div key={msg._id || index} className="flex gap-3 text-sm animate-in slide-in-from-bottom-1 duration-200 group">
                    <div className={`w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border ${isLightMode ? 'border-zinc-100' : 'border-white/5'}`}>
                      <img src={msg.senderAvatar || '/assets/img/avata.jpg'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-xs flex items-center gap-1 font-bold ${isLightMode ? 'text-zinc-500' : 'text-white/40'}`}>
                          {msg.senderName}
                          {isHostMsg && <span className="bg-red-600/20 border border-red-500/30 text-red-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">STREAMER</span>}
                        </p>
                        {!isAlreadyPinned && (
                          <button 
                            onClick={() => handlePinMessage(msg._id)} 
                            title="Ghim bình luận này" 
                            className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                          >
                            <Pin size={10} />
                          </button>
                        )}
                      </div>
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
              placeholder="Gửi tin nhắn phản hồi..."
              className={`flex-1 border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition transition-all duration-300 ${
                isLightMode
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:bg-white'
                  : 'bg-black/40 border-white/10 text-white'
              }`}
              required
            />
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl transition active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
