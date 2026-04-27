"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Video, Tv, Layout, Settings, Trash2, Edit2, PlayCircle, BarChart2, Users, MessageSquare, Eye, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
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

  // Debounce search query
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
      // Chỉ hiện loading full trang lần đầu hoặc khi đổi tab quan trọng
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
      if (commentChannelId !== 'all') params.append('channelId', commentChannelId);
      if (debouncedCommentSearch) params.append('search', debouncedCommentSearch);
      if (unrepliedOnly) params.append('unreplied', 'true');

      const res = await fetch(`/api/studio/comments?${params.toString()}`);
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchComments();
    }
  }, [status, commentChannelId, debouncedCommentSearch, unrepliedOnly]);

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
       // fetchComments is now separate and handled by its own useEffect
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video này? Thao tác này không thể hoàn tác.')) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVideos(prev => prev.filter(v => v.video_id !== videoId));
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
      const response = await fetch(`/api/studio/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.comment_id !== commentId));
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
          videoId: comment.video_id,
          content: replyText,
          parentCommentId: comment.comment_id,
          channelId: comment.video_channel_id
        }),
      });

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchComments(); // Refresh list to show unreplied changes if filter is on
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
      fetchComments(); // Refresh to show new counts and state
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kênh này? Tất cả video thuộc kênh này cũng sẽ bị ẩn hoặc xóa. Thao tác này không thể hoàn tác.')) return;

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE',
      });

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
                    <option key={ch.channel_id} value={ch.channel_id}>{ch.channel_name}</option>
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
            <button 
              onClick={() => {
                if (channels.length === 0) setIsChannelModalOpen(true);
                else setIsUploadModalOpen(true);
              }}
              className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Plus size={20} /> Tạo
            </button>
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
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl hover:border-red-500/30 transition">
                <div className="flex items-center gap-3 text-white/60 mb-3">
                  <BarChart2 size={20} />
                  <h3 className="font-medium">Lượt tương tác</h3>
                </div>
                <p className="text-3xl font-bold text-white">{overviewData.summary.totalInteractions.toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Video hiệu suất cao nhất</h2>
                <div className="space-y-4">
                  {overviewData.topVideos && overviewData.topVideos.length > 0 ? overviewData.topVideos.map((video: any, index: number) => (
                    <div key={video.video_id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition group cursor-pointer" onClick={() => router.push(`/watch/${video.video_id}`)}>
                      <div className="text-2xl font-bold text-white/20 w-8 text-center">{index + 1}</div>
                      <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0">
                        <img 
                          src={getUploadUrl(video.thumbnail_url)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          alt="" 
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-bold text-white z-10">
                          {formatDuration(video.duration || 0)}
                        </div>
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
                  )) : (
                    <p className="text-white/40 text-center py-4">Chưa có đủ dữ liệu</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600/20 to-[#1a1a1a] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    Kênh nổi bật
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white mb-8 w-full text-left">Đang thịnh hành</h2>
                
                {overviewData.topChannel ? (
                  <>
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-tr from-red-600 to-red-400 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-[0_0_50px_rgba(220,38,38,0.4)] group-hover:scale-105 transition duration-500 relative z-10 overflow-hidden">
                        {overviewData.topChannel.avatar_url ? (
                          <img src={getUploadUrl(overviewData.topChannel.avatar_url, '/assets/img/avata.jpg')} className="w-full h-full object-cover" alt="" />
                        ) : (
                          overviewData.topChannel.channel_name.charAt(0)
                        )}
                      </div>
                      <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 group-hover:opacity-40 transition"></div>
                    </div>

                    
                    <h3 className="text-2xl font-bold text-white mb-2">{overviewData.topChannel.channel_name}</h3>
                    <div className="flex items-center gap-2 mb-8 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                      <Users size={16} className="text-red-500" />
                      <span className="text-white/80 font-medium">{overviewData.topChannel.sub_count?.toLocaleString('vi-VN')} người đăng ký</span>
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setActiveTab('channels')} 
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-red-600/20"
                      >
                        Quản lý
                      </button>
                      <button 
                        onClick={() => router.push(`/channel/${overviewData.topChannel.channel_id}`)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition text-sm border border-white/10"
                      >
                        Xem kênh
                      </button>
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
              <input 
                type="text" 
                placeholder="Tìm kiếm video..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-red-500 transition"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-500 transition">
                <Search size={18} />
              </div>
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
                    <tr key={video.video_id} className="hover:bg-white/5 transition group">
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden relative">
                            <img 
                              src={getUploadUrl(video.thumbnail_url)} 
                              className="w-full h-full object-cover"
                              alt="" 
                            />
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-bold text-white z-10">
                              {formatDuration(video.duration || 0)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium line-clamp-2">{video.title}</p>
                            <p className="text-white/40 text-xs mt-1 line-clamp-1">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm">{video.channel_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm">{new Date(video.uploaded_at).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {video.view_count || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(video)}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteVideo(video.video_id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-red-500/60 hover:text-red-500 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-white/40">
                        Bạn chưa có video nào. Hãy tải lên video đầu tiên!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'channels' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => (
              <div key={channel.channel_id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 hover:border-red-500/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white text-2xl font-bold border border-white/5">
                    {channel.avatar_url ? (
                      <img src={getUploadUrl(channel.avatar_url, '/assets/img/avata.jpg')} className="w-full h-full object-cover" alt="" />
                    ) : (
                      channel.channel_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{channel.channel_name}</h3>
                    <p className="text-white/40 text-xs">Tham gia: {new Date(channel.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm line-clamp-2 mb-6 h-10">
                  {channel.description || 'Chưa có mô tả'}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleEditChannelClick(channel)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => handleDeleteChannel(channel.channel_id)}
                    className="p-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {channels.length < 3 && (
              <button 
                onClick={() => setIsChannelModalOpen(true)}
                className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-white/60 hover:border-white/20 transition group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition">
                  <Plus size={24} />
                </div>
                <span className="font-bold">Thêm kênh mới</span>
              </button>
            )}
          </div>
        ) : activeTab === 'comments' ? (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm bình luận hoặc tên người dùng..."
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white outline-none focus:border-red-500 transition"
                  />
                </div>
                <select 
                  value={commentChannelId}
                  onChange={(e) => setCommentChannelId(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition"
                >
                  <option value="all">Tất cả kênh</option>
                  {channels.map(ch => (
                    <option key={ch.channel_id} value={ch.channel_id}>{ch.channel_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-white/5 transition"
                   onClick={() => setUnrepliedOnly(!unrepliedOnly)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${unrepliedOnly ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>
                  {unrepliedOnly && <Layout size={12} className="text-white" />}
                </div>
                <span className="text-sm text-white select-none">Chưa phản hồi</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare size={24} className="text-red-500" />
                  Bình luận ({comments.length})
                </h2>
              </div>
              
              <div className="divide-y divide-white/5">
              {comments.length > 0 ? comments.map(comment => (
                <div key={comment.comment_id} className="p-6 hover:bg-white/[0.02] transition group">
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                      <img 
                        src={getUploadUrl(comment.avatar, '/assets/img/avata.jpg')} 
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                    </div>
                    
                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm">{comment.username}</span>
                        {comment.parent_username && (
                          <span className="text-white/40 text-xs">trả lời <strong className="text-red-500">@{comment.parent_username}</strong></span>
                        )}
                        {comment.is_unreplied ? (
                          <span className="bg-red-600/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">Chưa phản hồi</span>
                        ) : (
                          <span className="bg-green-600/20 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20">Đã phản hồi</span>
                        )}
                        <span className="text-white/40 text-xs">{new Date(comment.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-white/80 text-sm mb-4 leading-relaxed">
                        {comment.content.split(' ').map((word: string, i: number) => 
                          word.startsWith('@') ? <span key={i} className="text-red-500 font-medium">{word} </span> : word + ' '
                        )}
                      </p>
                      
                      {/* Like/Dislike Actions */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleToggleCommentLike(comment.comment_id, comment.video_id, 'like')}
                            className={`p-1.5 rounded-full hover:bg-white/10 transition ${comment.is_liked ? 'text-red-600' : 'text-white/40'}`}
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <span className="text-xs text-white/40 ml-1">{comment.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleToggleCommentLike(comment.comment_id, comment.video_id, 'dislike')}
                            className={`p-1.5 rounded-full hover:bg-white/10 transition ${comment.is_disliked ? 'text-white' : 'text-white/40'}`}
                          >
                            <ThumbsDown size={16} />
                          </button>
                          <span className="text-xs text-white/40 ml-1">{comment.dislikes_count || 0}</span>
                        </div>
                      </div>

                      {/* Video Context */}
                      <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 w-fit max-w-full">
                        <div className="w-16 aspect-video rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={getUploadUrl(comment.video_thumbnail)} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Bình luận tại video</p>
                          <p className="text-white/80 text-xs font-medium truncate max-w-[200px]">{comment.video_title}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-500 transition"
                        title="Xóa bình luận"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id);
                          setReplyText('');
                        }}
                        className={`p-2 rounded-lg transition ${replyingTo === comment.comment_id ? 'bg-red-600 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                        title="Phản hồi"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Reply Input Area */}
                  {replyingTo === comment.comment_id && (
                    <div className="mt-4 ml-14 bg-black/40 p-4 rounded-2xl border border-white/10 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                        <MessageSquare size={12} />
                        <span>Phản hồi với tư cách: <strong className="text-white/80">{comment.video_channel_name}</strong></span>
                      </div>
                      <textarea 
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Viết phản hồi của bạn..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-red-500 transition resize-none h-24 mb-3"
                      />
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-1.5 text-xs font-bold text-white/60 hover:text-white transition"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => handleSendReply(comment)}
                          disabled={!replyText.trim()}
                          className="px-6 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-red-600/20"
                        >
                          Phản hồi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <MessageSquare size={48} className="text-white/10 mb-4" />
                  <p className="text-white/40">Chưa có bình luận nào trên các video của bạn.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
      </main>

      <CreateChannelModal 
        isOpen={isChannelModalOpen} 
        onClose={() => setIsChannelModalOpen(false)} 
        onSuccess={() => fetchData(false)} 
      />
      
      <UploadVideoModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        channels={channels}
      />

      <EditVideoModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        video={selectedVideo}
        onSuccess={() => fetchData(false)}
      />

      <EditChannelModal 
        isOpen={isEditChannelModalOpen}
        onClose={() => setIsEditChannelModalOpen(false)}
        channel={selectedChannelForEdit}
        onSuccess={() => fetchData(false)}
      />
    </div>
  );
}
