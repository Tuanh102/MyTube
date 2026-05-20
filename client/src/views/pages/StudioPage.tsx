"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Video, Tv, Layout, Settings, Trash2, Edit2, PlayCircle, BarChart2, Users, MessageSquare, Eye, Search, ThumbsUp, ThumbsDown, Calendar, HelpCircle, Send, Zap, ShieldCheck } from 'lucide-react';
import { toggleCommentInteraction } from '@/lib/actions';

import CreateChannelModal from '../components/modals/CreateChannelModal';
import UploadVideoModal from '../components/modals/UploadVideoModal';
import EditVideoModal from '../components/modals/EditVideoModal';
import EditChannelModal from '../components/modals/EditChannelModal';
import { formatDuration, getUploadUrl } from '@/lib/utils';

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [channels, setChannels] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedChannelForEdit, setSelectedChannelForEdit] = useState<any>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [debouncedCommentSearch, setDebouncedCommentSearch] = useState('');
  const [unrepliedOnly, setUnrepliedOnly] = useState(false);
  const [commentChannelId, setCommentChannelId] = useState('all');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<any>(null);
  const [videoSearchForComments, setVideoSearchForComments] = useState('');
  
  // Support Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCommentSearch(commentSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [commentSearch]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (!overviewData && !videos.length) {
        fetchData(true);
      } else {
        fetchData(false);
      }
    }
  }, [status, selectedChannelId, debouncedSearch]);

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVideoForComments?._id) {
        params.append('videoId', selectedVideoForComments._id);
      } else {
        // Nếu chưa chọn video, ko fetch bình luận
        return;
      }
      if (debouncedCommentSearch) params.append('search', debouncedCommentSearch);
      if (unrepliedOnly) params.append('unreplied', 'true');

      const res = await fetch(`/api/studio/comments?${params.toString()}`);
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTickets = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/support/my-tickets?userId=${session.user.id}`);
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'comments') {
      fetchComments();
    } else if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, selectedVideoForComments, debouncedCommentSearch, unrepliedOnly, activeTab]);

  const handleTicketClick = async (ticket: any) => {
    setSelectedTicket(ticket);
    // Đánh dấu đã đọc khi click vào
    if (!ticket.isReadByUser) {
      try {
        await fetch(`http://localhost:5000/api/support/mark-read/${ticket._id}`, { method: 'POST' });
        setTickets(prev => prev.map(t => t._id === ticket._id ? { ...t, isReadByUser: true } : t));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchData = async (showFullLoading = false) => {
    if (showFullLoading) setLoading(true);
    
    try {
      const overviewUrl = selectedChannelId === 'all' 
        ? '/api/studio/overview' 
        : `/api/studio/overview?channelId=${selectedChannelId}`;
      
      const videosUrl = `/api/studio/videos?${new URLSearchParams({
        ...(selectedChannelId !== 'all' ? { channelId: selectedChannelId } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {})
      })}`;

      const [channelsRes, videosRes, overviewRes] = await Promise.all([
        fetch('/api/channels'),
        fetch(videosUrl),
        fetch(overviewUrl)
      ]);
       
      if (channelsRes.ok) setChannels(await channelsRes.json());
      if (videosRes.ok) setVideos(await videosRes.json());
      if (overviewRes.ok) setOverviewData(await overviewRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video này? Thao tác này không thể hoàn tác.')) return;
    try {
      const response = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      if (response.ok) {
        setVideos(prev => prev.filter(v => v._id !== videoId));
      } else {
        const data = await response.json();
        alert(data.error || 'Lỗi khi xóa video');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      const response = await fetch(`/api/studio/comments?id=${commentId}`, { method: 'DELETE' });
      if (response.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      } else {
        const data = await response.json();
        alert(data.error || 'Lỗi khi xóa bình luận');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra');
    }
  };

  const handleSendReply = async (comment: any) => {
    if (!replyText.trim()) return;
    try {
      const response = await fetch('/api/studio/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: comment.video?._id || comment.video,
          content: replyText,
          parentCommentId: comment._id,
          channelId: selectedVideoForComments?.channel?._id || selectedVideoForComments?.channel
        }),
      });
      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || 'Lỗi khi gửi phản hồi');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra');
    }
  };

  const handleToggleCommentLike = async (commentId: number, videoId: number, type: 'like' | 'dislike') => {
    if (!session?.user?.id) return;
    try {
      await toggleCommentInteraction(commentId, Number(session.user.id), videoId, type);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      alert("Vui lòng đăng nhập để gửi yêu cầu hỗ trợ!");
      return;
    }
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return;
    
    setIsSubmittingTicket(true);
    try {
      const res = await fetch('http://localhost:5000/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticketForm.subject,
          message: ticketForm.message,
          userId: session?.user?.id
        })
      });
      if (res.ok) {
        setTicketForm({ subject: '', message: '' });
        setShowTicketForm(false);
        fetchTickets();
        alert('Yêu cầu hỗ trợ đã được gửi thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể gửi yêu cầu lúc này.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendTicketMessage = async (ticketId: string) => {
    if (!ticketReplyText.trim() || !session?.user?.id) return;
    setIsSendingMessage(true);
    try {
      const res = await fetch(`http://localhost:5000/api/support/message/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session.user.id,
          role: 'USER',
          message: ticketReplyText
        })
      });
      if (res.ok) {
        setTicketReplyText('');
        const updatedTicket = await res.json();
        setSelectedTicket(updatedTicket);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kênh này? Tất cả video thuộc kênh này cũng sẽ bị ẩn hoặc xóa. Thao tác này không thể hoàn tác.')) return;
    try {
      const response = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Lỗi khi xóa kênh');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra');
    }
  };

  const handleEditClick = (video: any) => {
    setSelectedVideo(video);
    setIsEditModalOpen(true);
  };

  const handleEditChannelClick = (channel: any) => {
    setSelectedChannelForEdit(channel);
    setIsEditChannelModalOpen(true);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-14 flex">
      {/* Sidebar Studio */}
      <aside className="w-64 border-r border-white/10 hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src={getUploadUrl(session?.user?.image, '/assets/img/avata.jpg')} className="w-12 h-12 rounded-full border border-white/10" alt="" />
            <div>
              <p className="text-white font-bold truncate">{session?.user?.name}</p>
              <p className="text-white/40 text-xs">Kênh của bạn</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <Layout size={20} />
              <span className="font-medium">Tổng quan</span>
            </button>
            <button 
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'videos' ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <Video size={20} />
              <span className="font-medium">Nội dung</span>
            </button>
            <button 
              onClick={() => setActiveTab('channels')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'channels' ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <Tv size={20} />
              <span className="font-medium">Kênh</span>
            </button>
            <button 
              onClick={() => setActiveTab('comments')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'comments' ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <MessageSquare size={20} />
              <span className="font-medium">Bình luận</span>
            </button>
            <button 
              onClick={() => setActiveTab('revenue')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'revenue' ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <BarChart2 size={20} />
              <span className="font-medium">Doanh thu</span>
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'support' ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <HelpCircle size={20} />
              <span className="font-medium">Hỗ trợ</span>
            </button>
            <button className="w-full mt-4 flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition">
              <Settings size={20} />
              <span className="font-medium">Cài đặt</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">
            {activeTab === 'overview' && 'Tổng quan kênh'}
            {activeTab === 'videos' && 'Nội dung của kênh'}
            {activeTab === 'channels' && 'Quản lý kênh'}
            {activeTab === 'comments' && 'Bình luận của kênh'}
            {activeTab === 'revenue' && 'Doanh thu & Ví tiền'}
            {activeTab === 'support' && 'Trung tâm Hỗ trợ'}
          </h1>
          <div className="flex items-center gap-4">
            {(activeTab === 'overview' || activeTab === 'videos') && channels.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">Hiển thị cho:</span>
                <select 
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 rounded-lg py-2 px-4 text-white text-sm outline-none focus:border-red-500 transition cursor-pointer"
                >
                  <option value="all">Tất cả kênh</option>
                  {channels.map(ch => (
                    <option key={ch._id} value={ch._id}>{ch.channel_name}</option>
                  ))}
                </select>
              </div>
            )}
            {activeTab === 'channels' && (
              <button 
                onClick={() => setIsChannelModalOpen(true)}
                disabled={channels.length >= 3}
                className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-white/90 transition disabled:bg-white/50"
              >
                <Plus size={20} /> Tạo kênh mới
              </button>
            )}
            {(activeTab === 'overview' || activeTab === 'videos') && (
              <button 
                onClick={() => {
                  if (channels.length === 0) setIsChannelModalOpen(true);
                  else setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Plus size={20} /> Tạo
              </button>
            )}
          </div>
        </div>

        {activeTab === 'overview' && overviewData ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl hover:border-red-500/30 transition">
                <div className="flex items-center gap-3 text-white/60 mb-3">
                  <Eye size={20} />
                  <h3 className="font-medium">Tổng lượt xem</h3>
                </div>
                <p className="text-3xl font-bold text-white">{overviewData.summary.totalViews.toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl hover:border-red-500/30 transition">
                <div className="flex items-center gap-3 text-white/60 mb-3">
                  <Users size={20} />
                  <h3 className="font-medium">Người đăng ký</h3>
                </div>
                <p className="text-3xl font-bold text-white">{overviewData.summary.totalSubscribers.toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl hover:border-red-500/30 transition">
                <div className="flex items-center gap-3 text-white/60 mb-3">
                  <Video size={20} />
                  <h3 className="font-medium">Tổng số video</h3>
                </div>
                <p className="text-3xl font-bold text-white">{overviewData.summary.totalVideos.toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl hover:border-green-500/30 transition group cursor-pointer" onClick={() => setActiveTab('revenue')}>
                <div className="flex items-center gap-3 text-white/60 mb-3 group-hover:text-green-500">
                  <BarChart2 size={20} />
                  <h3 className="font-medium">Số dư (VNĐ)</h3>
                </div>
                <p className="text-3xl font-bold text-green-500">{overviewData.summary.balance?.toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Video hiệu suất cao nhất</h2>
                <div className="space-y-4">
                  {overviewData.topVideos && overviewData.topVideos.length > 0 ? overviewData.topVideos.map((video: any, index: number) => (
                    <div key={video._id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition group cursor-pointer" onClick={() => router.push(`/watch/${video._id}`)}>
                      <div className="text-2xl font-bold text-white/20 w-8 text-center">{index + 1}</div>
                      <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0">
                        <img src={getUploadUrl(video.thumbnail_url)} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="" />
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-bold text-white z-10">{formatDuration(video.duration || 0)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold line-clamp-1 group-hover:text-red-500 transition">{video.title}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-white/60">{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                          <span className="text-xs text-white/60">{video.likes_count?.toLocaleString('vi-VN')} thích</span>
                          <span className="text-xs text-white/60">{new Date(video.uploaded_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-white/40 text-center py-4">Chưa có đủ dữ liệu</p>}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600/20 to-[#1a1a1a] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">Kênh nổi bật</div>
                </div>
                <h2 className="text-lg font-bold text-white mb-8 w-full text-left">Đang thịnh hành</h2>
                {overviewData.topChannel ? (
                  <>
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-tr from-red-600 to-red-400 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-[0_0_50px_rgba(220,38,38,0.4)] group-hover:scale-105 transition duration-500 relative z-10 overflow-hidden">
                        {overviewData.topChannel.avatar_url ? <img src={getUploadUrl(overviewData.topChannel.avatar_url, '/assets/img/avata.jpg')} className="w-full h-full object-cover" alt="" /> : overviewData.topChannel.channel_name.charAt(0)}
                      </div>
                      <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 group-hover:opacity-40 transition"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{overviewData.topChannel.channel_name}</h3>
                    <div className="flex items-center gap-2 mb-8 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                      <Users size={16} className="text-red-500" />
                      <span className="text-white/80 font-medium">{overviewData.topChannel.sub_count?.toLocaleString('vi-VN')} người đăng ký</span>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-4">
                      <button onClick={() => setActiveTab('channels')} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-red-600/20">Quản lý</button>
                      <button onClick={() => router.push(`/channel/${overviewData.topChannel._id}`)} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition text-sm border border-white/10">Xem kênh</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10">
                    <Tv size={48} className="text-white/10 mb-4" />
                    <p className="text-white/40">Chưa có kênh nào hoạt động</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'videos' ? (
          <div className="space-y-6">
            <div className="relative group max-w-md">
              <input type="text" placeholder="Tìm kiếm video..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-red-500 transition" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-500 transition"><Search size={18} /></div>
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                    <th className="px-6 py-4 font-medium">Video</th>
                    <th className="px-6 py-4 font-medium">Kênh</th>
                    <th className="px-6 py-4 font-medium">Ngày đăng</th>
                    <th className="px-6 py-4 font-medium">Số lượt xem</th>
                    <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {videos.length > 0 ? videos.map((video) => (
                    <tr key={video._id} className="hover:bg-white/5 transition group">
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden relative">
                            <img src={getUploadUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-bold text-white z-10">{formatDuration(video.duration || 0)}</div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium line-clamp-2">{video.title}</p>
                            <p className="text-white/40 text-xs mt-1 line-clamp-1">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-white/60 text-sm">{video.channel_name}</span></td>
                      <td className="px-6 py-4"><span className="text-white/60 text-sm">{new Date(video.uploaded_at).toLocaleDateString('vi-VN')}</span></td>
                      <td className="px-6 py-4 text-white/60 text-sm">{video.view_count || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(video)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteVideo(video._id)} className="p-2 hover:bg-white/10 rounded-lg text-red-500/60 hover:text-red-500 transition"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={5} className="px-6 py-20 text-center text-white/40">Bạn chưa có video nào. Hãy tải lên video đầu tiên!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'channels' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => (
              <div key={channel._id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 hover:border-red-500/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white text-2xl font-bold border border-white/5">
                    {channel.avatar_url ? <img src={getUploadUrl(channel.avatar_url, '/assets/img/avata.jpg')} className="w-full h-full object-cover" alt="" /> : channel.channel_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{channel.channel_name}</h3>
                    <p className="text-white/40 text-xs flex items-center gap-1.5"><Calendar size={12} className="text-red-500" />Tham gia: {new Date(channel.createdAt || channel.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm line-clamp-2 mb-6 h-10">{channel.description || 'Chưa có mô tả'}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleEditChannelClick(channel)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"><Edit2 size={16} /> Chỉnh sửa</button>
                  <button onClick={() => handleDeleteChannel(channel._id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-lg transition"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            {channels.length < 3 && (
              <button onClick={() => setIsChannelModalOpen(true)} className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-white/60 hover:border-white/20 transition group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition"><Plus size={24} /></div>
                <span className="font-bold">Thêm kênh mới</span>
              </button>
            )}
          </div>
        ) : activeTab === 'comments' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {!selectedVideoForComments ? (
              /* GIAO DIỆN CHỌN VIDEO */
              <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-10">
                <div className="text-center mb-10">
                  <MessageSquare size={48} className="text-red-500 mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Quản lý bình luận</h3>
                  <p className="text-white/40 max-w-md mx-auto mb-8">Chọn một video bên dưới để bắt đầu xem và trả lời các bình luận từ khán giả của bạn.</p>
                  
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm video theo tiêu đề..." 
                      value={videoSearchForComments} 
                      onChange={(e) => setVideoSearchForComments(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-red-500 transition" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {videos.filter(v => v.title.toLowerCase().includes(videoSearchForComments.toLowerCase())).length > 0 ? 
                    videos.filter(v => v.title.toLowerCase().includes(videoSearchForComments.toLowerCase())).map((video) => (
                    <div 
                      key={video._id} 
                      onClick={() => { setSelectedVideoForComments(video); setVideoSearchForComments(''); }}
                      className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/50 transition cursor-pointer group"
                    >
                      <div className="aspect-video relative">
                        <img src={getUploadUrl(video.thumbnail_url)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="bg-white text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest">Chọn video</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-white font-bold text-sm line-clamp-2 mb-1">{video.title}</h4>
                        <p className="text-white/40 text-[10px] uppercase font-bold">{video.view_count || 0} lượt xem</p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-10 text-white/20 italic">Bạn chưa có video nào để quản lý bình luận.</div>
                  )}
                </div>
              </div>
            ) : (
              /* GIAO DIỆN QUẢN LÝ BÌNH LUẬN CỦA VIDEO ĐÃ CHỌN */
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 bg-[#1a1a1a] border border-white/10 p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedVideoForComments(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition">
                      <Layout size={20} />
                    </button>
                    <div>
                      <h3 className="text-white font-bold text-lg line-clamp-1">{selectedVideoForComments.title}</h3>
                      <p className="text-white/40 text-xs">Đang xem tất cả bình luận của video này</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative group hidden md:block">
                      <input type="text" placeholder="Tìm bình luận..." value={commentSearch} onChange={(e) => setCommentSearch(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl py-2 px-10 text-sm text-white outline-none focus:border-red-500 transition w-64" />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    </div>
                    <button onClick={() => setUnrepliedOnly(!unrepliedOnly)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${unrepliedOnly ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                      {unrepliedOnly ? 'Đang lọc: Chưa trả lời' : 'Tất cả bình luận'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {comments.length > 0 ? comments.map((comment) => (
                    <div key={comment._id} className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 hover:border-white/20 transition">
                      <div className="flex gap-4">
                        <img 
                          src={comment.channel?.avatar_url || comment.user?.avatar_url || '/assets/img/avata.jpg'} 
                          className={`w-12 h-12 rounded-full border border-white/10 ${comment.channel ? 'ring-2 ring-red-500/50' : ''}`} 
                          alt="" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-bold flex items-center gap-2">
                              {comment.channel?.channel_name || comment.user?.name}
                              {comment.channel && <ShieldCheck size={14} className="text-red-500" />}
                              <span className="text-white/20 text-xs font-normal ml-2">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                            </h4>
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-white/20 hover:text-red-500 transition p-2"><Trash2 size={18} /></button>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed mb-4">{comment.content}</p>
                          
                          {/* HIỂN THỊ CÁC PHẢN HỒI (REPLIES) */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 mb-6 ml-4 pl-4 border-l-2 border-white/5 space-y-4">
                              {comment.replies.map((rep: any) => (
                                <div key={rep._id} className="group/reply">
                                  <div className="flex gap-3">
                                    <img 
                                      src={rep.channel?.avatar_url || rep.user?.avatar_url || '/assets/img/avata.jpg'} 
                                      className={`w-8 h-8 rounded-full border border-white/5 ${rep.channel ? 'ring-1 ring-red-500/30' : ''}`} 
                                      alt="" 
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <h5 className="text-white/90 font-bold text-xs flex items-center gap-1">
                                          {rep.channel?.channel_name || rep.user?.name}
                                          {rep.channel && <ShieldCheck size={12} className="text-red-500" />}
                                          <span className="text-white/20 text-[10px] font-normal ml-2">{new Date(rep.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </h5>
                                        <button onClick={() => handleDeleteComment(rep._id)} className="text-white/0 group-hover/reply:text-white/20 hover:!text-red-500 transition p-1"><Trash2 size={14} /></button>
                                      </div>
                                      <p className="text-white/60 text-sm">{rep.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {replyingTo === comment._id ? (
                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                              <textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Viết phản hồi công khai..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500 transition resize-none h-24" />
                              <div className="flex justify-end gap-3">
                                <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-white/40 hover:text-white transition font-bold text-sm">Hủy</button>
                                <button onClick={() => handleSendReply(comment)} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-red-600/20">Phản hồi</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setReplyingTo(comment._id)} className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:text-red-400 transition bg-red-500/5 px-4 py-2 rounded-xl">
                              <MessageSquare size={14} /> Trả lời
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-[40px] p-24 text-center border-dashed">
                      <MessageSquare size={64} className="text-white/5 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white/40 mb-2">Chưa có bình luận nào</h3>
                      <p className="text-white/20 text-sm italic">Video này hiện chưa có phản hồi nào từ khán giả.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'revenue' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-green-600/20 to-zinc-900 border border-green-500/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-green-500 font-bold mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />Số dư khả dụng</p>
                  <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">{overviewData?.summary.balance?.toLocaleString('vi-VN')} <span className="text-2xl text-white/40">VNĐ</span></h2>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-2xl transition shadow-lg shadow-green-600/20 flex items-center gap-2 active:scale-95"><Plus size={20} /> Rút tiền</button>
                    <button className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-2xl transition border border-white/10 flex items-center gap-2">Lịch sử giao dịch</button>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-green-600/10 blur-[100px] rounded-full" />
              </div>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 flex flex-col justify-center">
                <h3 className="text-white/40 font-bold text-sm uppercase tracking-widest mb-4">Phí nền tảng</h3>
                <div className="flex items-end gap-2 mb-6"><span className="text-4xl font-bold text-white">10%</span><span className="text-white/40 mb-1 text-sm">mỗi giao dịch</span></div>
                <p className="text-white/60 text-xs leading-relaxed">Phí này được dùng để duy trì hệ thống MyTube và hỗ trợ kỹ thuật cho các Creator.</p>
              </div>
            </div>
          </div>
        ) : activeTab === 'support' ? (
          <div className="animate-in slide-in-from-bottom duration-500 max-w-6xl mx-auto">
            {/* Header của mục Support */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter italic">Hỗ trợ & Giải đáp</h2>
                <p className="text-white/40 text-sm mt-1">Hệ thống phản hồi trong vòng 24h làm việc.</p>
              </div>
              {!showTicketForm && (
                <button 
                  onClick={() => { setShowTicketForm(true); setSelectedTicket(null); }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-red-600/20 flex items-center gap-2 active:scale-95"
                >
                  <Plus size={20} /> Gửi yêu cầu mới
                </button>
              )}
            </div>

            {showTicketForm ? (
              /* FORM SOẠN YÊU CẦU */
              <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-10 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Nội dung yêu cầu mới</h3>
                  <button onClick={() => setShowTicketForm(false)} className="text-white/40 hover:text-white font-bold text-sm"> Hủy bỏ </button>
                </div>
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-white/20 uppercase mb-3 block tracking-widest">Chủ đề cần hỗ trợ</label>
                    <input type="text" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} placeholder="Ví dụ: Lỗi thanh toán, Vấn đề về video..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-500 transition text-lg" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/20 uppercase mb-3 block tracking-widest">Nội dung chi tiết</label>
                    <textarea rows={6} value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-500 transition resize-none leading-relaxed" required />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={isSubmittingTicket} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-black py-5 rounded-2xl transition shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 uppercase tracking-widest">
                      {isSubmittingTicket ? 'Đang gửi...' : <><Send size={20} /> Xác nhận gửi</>}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px]">
                {/* Danh sách Ticket bên trái */}
                <div className="lg:col-span-1 flex flex-col bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest">Lịch sử yêu cầu</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {tickets.map(ticket => (
                      <div 
                        key={ticket._id} 
                        onClick={() => handleTicketClick(ticket)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${selectedTicket?._id === ticket._id ? 'bg-red-600/10 border-red-500/50 shadow-lg shadow-red-600/5' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                      >
                        {!ticket.isReadByUser && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                        <h4 className={`font-bold text-sm mb-2 line-clamp-1 ${!ticket.isReadByUser ? 'text-white' : 'text-white/60'}`}>{ticket.subject}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/20 font-medium">{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ticket.status === 'OPEN' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                            {ticket.status === 'OPEN' ? 'Đang chờ' : 'Đã xong'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <div className="py-20 text-center">
                        <MessageSquare size={32} className="mx-auto mb-4 text-white/5" />
                        <p className="text-white/20 text-[10px] italic">Chưa có yêu cầu nào.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chi tiết Ticket / Hội thoại Chat bên phải */}
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h3>
                          <p className="text-white/20 text-[10px] font-mono tracking-tighter uppercase">ID: {selectedTicket._id}</p>
                        </div>
                        <button onClick={() => setSelectedTicket(null)} className="text-white/20 hover:text-white transition p-2"> Đóng </button>
                      </div>

                      <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar">
                        {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                          selectedTicket.messages.map((msg: any, idx: number) => (
                            <div key={idx} className={`flex ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-4 rounded-2xl ${
                                msg.senderRole === 'USER' 
                                ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-600/10' 
                                : 'bg-white/10 text-white/80 rounded-tl-none border border-white/5'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                <span className="text-[9px] opacity-30 mt-2 block text-right">
                                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-white/20 italic text-xs">
                            Không có tin nhắn nào trong hội thoại này.
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <div className="relative">
                          <textarea 
                            value={ticketReplyText} 
                            onChange={(e) => setTicketReplyText(e.target.value)} 
                            placeholder="Phản hồi cho nhân viên hỗ trợ..." 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-20 text-sm text-white outline-none focus:border-red-500 transition h-24 resize-none"
                          />
                          <button 
                            onClick={() => handleSendTicketMessage(selectedTicket._id)} 
                            disabled={isSendingMessage || !ticketReplyText.trim()} 
                            className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
                          >
                            {isSendingMessage ? '...' : <><Send size={14} /> Gửi</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl p-12 text-center bg-white/[0.01]">
                      <HelpCircle size={48} className="text-white/5 mb-6 animate-pulse" />
                      <h4 className="text-white/40 font-bold mb-2 uppercase tracking-widest text-xs">Hội thoại hỗ trợ</h4>
                      <p className="text-white/10 text-[10px] italic max-w-xs mx-auto">Chọn một yêu cầu ở danh sách bên trái để bắt đầu trao đổi với nhân viên.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>

      <CreateChannelModal isOpen={isChannelModalOpen} onClose={() => setIsChannelModalOpen(false)} onSuccess={() => fetchData(false)} />
      <UploadVideoModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} channels={channels} />
      <EditVideoModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} video={selectedVideo} onSuccess={() => fetchData(false)} />
      <EditChannelModal isOpen={isEditChannelModalOpen} onClose={() => setIsEditChannelModalOpen(false)} channel={selectedChannelForEdit} onSuccess={() => fetchData(false)} />
    </div>
  );
}
