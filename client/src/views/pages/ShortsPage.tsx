"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Heart, MessageSquare, Share2, Music2, ArrowLeft, Play, X, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { getUploadUrl } from '@/lib/utils';
import { toggleLike, submitCommentAction, toggleCommentInteraction } from '@/lib/actions';
import { signIn } from 'next-auth/react';

interface ShortVideo {
  video_id: number;
  title: string;
  video_url: string;
  channel_name: string;
  channel_avatar: string;
  channel_id?: string;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
}

interface ShortsPageProps {
  shorts: ShortVideo[];
  user?: any;
}

export default function ShortsPage({ shorts, user }: ShortsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false); // Mặc định bật âm thanh, khi nào cần mới tắt
  const [localShorts, setLocalShorts] = useState<ShortVideo[]>(shorts);
  const [activeCommentsVideoId, setActiveCommentsVideoId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoId = parseInt(entry.target.getAttribute('data-id') || '0');
        const video = videoRefs.current.get(videoId);
        if (video) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setPlayingId(videoId);
          } else {
            video.pause();
            video.currentTime = 0;
            setPlayingId(prev => prev === videoId ? null : prev);
          }
        }
      });
    }, observerOptions);

    const items = document.querySelectorAll('.short-item');
    items.forEach(item => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [shorts]); // Only re-run when the shorts list completely changes

  const togglePlay = (videoId: number) => {
    const video = videoRefs.current.get(videoId);
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlayingId(videoId);
    } else {
      video.pause();
      setPlayingId(null);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click làm tạm dừng video
    setIsMuted(prev => !prev);
  };

  const handleLike = async (videoId: number) => {
    if (!user) {
      signIn();
      return;
    }
    const res = await toggleLike(videoId.toString(), user.id);
    if (res.success) {
      setLocalShorts(prev => prev.map(s => {
        if (s.video_id === videoId) {
          return {
            ...s,
            isLiked: res.isLiked,
            likes_count: res.likesCount
          };
        }
        return s;
      }));
    }
  };

  const fetchComments = async (videoId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/comments/video/${videoId}`);
      if (res.ok) {
        const rawComments = await res.json();
        const formatted = rawComments.map((c: any) => ({
          comment_id: c._id,
          username: c.user?.username || c.user?.name || 'Unknown',
          avatar: c.user?.avatar || c.user?.avatar_url || '/assets/img/default-avatar.png',
          is_premium: c.user?.is_premium || false,
          content: c.content,
          created_at: c.createdAt,
          likes_count: c.likes?.length || 0,
          dislikes_count: c.dislikes?.length || 0,
          likes: c.likes || [],
          dislikes: c.dislikes || [],
          parent_comment_id: c.parentComment || null,
          replies: c.replies?.map((r: any) => ({
            comment_id: r._id,
            username: r.user?.username || r.user?.name || 'Unknown',
            avatar: r.user?.avatar || r.user?.avatar_url || '/assets/img/default-avatar.png',
            is_premium: r.user?.is_premium || false,
            content: r.content,
            created_at: r.createdAt,
            likes_count: r.likes?.length || 0,
            dislikes_count: r.dislikes?.length || 0,
            likes: r.likes || [],
            dislikes: r.dislikes || [],
            parent_comment_id: r.parentComment || null,
          })) || []
        }));
        setComments(formatted);
      }
    } catch (err) {}
  };

  const threadedComments = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_comment_id);
    const allReplies = comments.filter(c => c.parent_comment_id);

    const findRootParentId = (comment: any): number | null => {
      let current = comment;
      let depth = 0;
      const maxDepth = 10;
      
      while (current.parent_comment_id && depth < maxDepth) {
        const parent = comments.find(c => c.comment_id === current.parent_comment_id);
        if (!parent) break;
        current = parent;
        depth++;
      }
      return current.parent_comment_id ? null : current.comment_id;
    };

    return topLevel.map(parent => ({
      ...parent,
      replies: allReplies
        .filter(r => findRootParentId(r) === parent.comment_id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    })).sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  }, [comments]);

  const handleToggleCommentLike = async (commentId: number | string, type: 'like' | 'dislike') => {
    if (!user) {
      signIn();
      return;
    }
    if (!commentId || !activeCommentsVideoId) return;
    const res = await toggleCommentInteraction(commentId.toString(), user.id, activeCommentsVideoId.toString(), type);
    if (res.success) {
      setComments(prev => prev.map(c => {
        if (c.comment_id === commentId) {
          return {
            ...c,
            is_liked: res.isLiked,
            is_disliked: res.isDisliked,
            likes_count: res.likesCount,
            dislikes_count: res.dislikesCount
          };
        }
        return c;
      }));
    }
  };

  const handleReplyClick = (comment: any) => {
    setReplyTo(comment);
    setCommentContent(`@${comment.username} `);
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => 
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  const handleOpenComments = (videoId: number) => {
    setActiveCommentsVideoId(videoId);
    setCommentContent('');
    setReplyTo(null);
    fetchComments(videoId);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signIn();
      return;
    }
    if (!commentContent.trim() || isSubmitting || !activeCommentsVideoId) return;

    setIsSubmitting(true);
    try {
      const res = await submitCommentAction(
        activeCommentsVideoId.toString(), 
        user.id, 
        commentContent,
        replyTo?.parent_comment_id || replyTo?.comment_id
      );
      if (res.success) {
        setCommentContent('');
        setReplyTo(null);
        const newComment = {
          comment_id: res.comment?._id || res.comment?.id || Date.now().toString(),
          username: user.name || user.username || 'You',
          avatar: user.image || '/assets/img/avata.jpg',
          is_premium: user.is_premium || false,
          content: commentContent,
          created_at: new Date().toISOString(),
          likes_count: 0,
          dislikes_count: 0,
          likes: [],
          dislikes: [],
          parent_comment_id: replyTo?.parent_comment_id || replyTo?.comment_id || null,
          replies: []
        };
        setComments(prev => [newComment, ...prev]);
        setLocalShorts(prev => prev.map(s => s.video_id === activeCommentsVideoId ? { ...s, comments_count: (s.comments_count || 0) + 1 } : s));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (localShorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-white/50">
        <p className="text-xl mb-4">Chưa có video ngắn nào.</p>
        <Link href="/" className="text-red-500 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] -m-4 overflow-hidden">
      <Link href="/" className="absolute top-4 left-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition">
        <ArrowLeft size={24} />
      </Link>

      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {localShorts.map((short, index) => (
          <div 
            key={short.video_id}
            data-id={short.video_id}
            className="short-item h-full w-full snap-start relative flex items-center justify-center bg-black"
          >
            {/* Wrapper to hold video and sidebar side by side */}
            <div className="flex h-full max-h-full py-4 items-end gap-4 relative">
              {/* Video Container */}
              <div className="relative h-full aspect-[9/16] bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden cursor-pointer" onClick={() => togglePlay(short.video_id)}>
                <video 
                  ref={el => { if (el) videoRefs.current.set(short.video_id, el); }}
                  src={getUploadUrl(short.video_url)}
                  loop
                  muted={isMuted}
                  playsInline
                  autoPlay={index === 0}
                  onPlay={() => setPlayingId(short.video_id)}
                  onPause={() => {
                    if (playingId === short.video_id) setPlayingId(null);
                  }}
                  className="h-full w-full object-cover"
                />

                {/* Nút loa điều khiển âm thanh thông minh ở góc trên bên phải */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute top-4 right-4 z-40 p-2.5 bg-black/40 hover:bg-black/60 active:scale-95 transition-all text-white rounded-full backdrop-blur-md border border-white/10 shadow-xl cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX size={18} className="text-white animate-pulse" />
                  ) : (
                    <Volume2 size={18} className="text-white fill-white" />
                  )}
                </button>

                {/* Play Icon Overlay */}
                {playingId !== short.video_id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm text-white/90">
                      <Play size={48} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                )}

                {/* Overlay Content (Bottom) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 pointer-events-none">
                  <div className="pointer-events-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <Link href={`/channel/${short.channel_id}`} className="flex items-center gap-3 hover:opacity-80 transition group/channel">
                        <img 
                          src={getUploadUrl(short.channel_avatar, '/assets/img/avata.jpg')} 
                          className="w-10 h-10 rounded-full border border-white/20 object-cover group-hover/channel:border-red-500 transition-all"
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                          }}
                        />
                        <span className="text-white font-bold text-sm group-hover/channel:text-red-500 transition-colors">@{short.channel_name}</span>
                      </Link>
                      <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold hover:bg-white/90">
                        Đăng ký
                      </button>
                    </div>
                    <p className="text-white text-sm mb-3 line-clamp-2">{short.title}</p>
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <Music2 size={14} />
                      <span className="truncate">Âm thanh gốc - {short.channel_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Sidebar (Outside video) */}
              <div className="flex flex-col items-center gap-6 pb-4">
                <button 
                  className="flex flex-col items-center gap-1 group"
                  onClick={() => handleLike(short.video_id)}
                >
                  <div className={`p-3 rounded-full transition ${short.isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                    <Heart size={24} fill={short.isLiked ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-white text-xs font-bold">{short.likes_count}</span>
                </button>

                <button 
                  className="flex flex-col items-center gap-1 group"
                  onClick={() => handleOpenComments(short.video_id)}
                >
                  <div className="p-3 bg-white/10 rounded-full text-white group-hover:bg-white/20 transition">
                    <MessageSquare size={24} fill="currentColor" />
                  </div>
                  <span className="text-white text-xs font-bold">{short.comments_count}</span>
                </button>

                <button 
                  className="flex flex-col items-center gap-1 group"
                  onClick={() => alert('Tính năng Share đang phát triển')}
                >
                  <div className="p-3 bg-white/10 rounded-full text-white group-hover:bg-white/20 transition">
                    <Share2 size={24} fill="currentColor" />
                  </div>
                  <span className="text-white text-xs font-bold text-center">Chia sẻ</span>
                </button>

                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden animate-spin-slow mt-4">
                  <img 
                    src={getUploadUrl(short.channel_avatar, '/assets/img/avata.jpg')} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Sliding Drawer */}
      <div 
        className={`absolute top-0 right-0 h-full w-[450px] bg-zinc-900 border-l border-white/10 flex flex-col transition-transform duration-300 z-50 shadow-2xl ${activeCommentsVideoId ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">Bình luận</h2>
          <button onClick={() => setActiveCommentsVideoId(null)} className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          {threadedComments.length > 0 ? threadedComments.map((comment) => (
            <div key={comment.comment_id} className="group">
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 bg-white/10 relative ${
                  comment.is_premium 
                    ? 'p-[1.5px] bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-600 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                    : 'overflow-hidden'
                }`}>
                  <img 
                    src={getUploadUrl(comment.avatar, '/assets/img/avata.jpg')} 
                    className="w-full h-full object-cover rounded-full" 
                    alt="" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                    }}
                  />
                  {comment.is_premium && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-500 to-yellow-500 text-zinc-950 text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black shadow border border-zinc-900 select-none">
                      ★
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1 ${
                      comment.is_premium 
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm font-black' 
                        : 'text-white/60'
                    }`}>
                      @{comment.username}
                      {comment.is_premium && (
                        <span className="px-1 py-0.2 rounded text-[7px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-[0_0_4px_rgba(245,158,11,0.3)] select-none">
                          ★ PREMIUM
                        </span>
                      )}
                    </span>
                    <span className="text-white/40 text-[10px]">{new Date(comment.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed break-words">
                    {comment.content.split(' ').map((word: string, i: number) => 
                      word.startsWith('@') ? <span key={i} className="text-red-500 font-medium">{word} </span> : word + ' '
                    )}
                  </p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleToggleCommentLike(comment.comment_id, 'like')}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition ${comment.is_liked ? 'text-red-600' : 'text-white/40'}`}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <span className="text-xs text-white/40 ml-1">{comment.likes_count || 0}</span>
                    </div>
                    <button 
                      onClick={() => handleToggleCommentLike(comment.comment_id, 'dislike')}
                      className={`p-1.5 rounded-full hover:bg-white/10 transition ${comment.is_disliked ? 'text-white' : 'text-white/40'}`}
                    >
                      <ThumbsDown size={14} />
                    </button>
                    <button 
                      onClick={() => handleReplyClick(comment)}
                      className="text-xs text-white/40 hover:text-white transition font-bold px-2 py-1 rounded-full hover:bg-white/10"
                    >
                      Phản hồi
                    </button>
                  </div>

                  {/* Replies Section */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                      {!expandedReplies.includes(comment.comment_id) ? (
                        <button 
                          onClick={() => toggleReplies(comment.comment_id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-white/60 hover:text-white px-2 py-1 rounded-full transition"
                        >
                          <ChevronDown size={14} />
                          Xem {comment.replies.length} phản hồi
                        </button>
                      ) : (
                        <>
                          <div className="mt-3 space-y-3 ml-1 border-l border-white/10 pl-3 mb-3">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.comment_id} className="flex gap-2">
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 bg-white/10 relative ${
                                  reply.is_premium 
                                    ? 'p-[1px] bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                    : 'overflow-hidden'
                                }`}>
                                  <img 
                                    src={getUploadUrl(reply.avatar, '/assets/img/avata.jpg')} 
                                    className="w-full h-full object-cover rounded-full" 
                                    alt="" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                                    }}
                                  />
                                  {reply.is_premium && (
                                    <span className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-500 to-yellow-500 text-zinc-950 text-[5px] w-2.5 h-2.5 rounded-full flex items-center justify-center font-black shadow border border-zinc-900 select-none">
                                      ★
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`font-bold text-[11px] flex items-center gap-1 ${
                                      reply.is_premium 
                                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm font-black' 
                                        : 'text-white/60'
                                    }`}>
                                      @{reply.username}
                                      {reply.is_premium && (
                                        <span className="px-1 py-0.2 rounded text-[6px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-[0_0_3px_rgba(245,158,11,0.3)] select-none">
                                          ★ PREMIUM
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-white/40 text-[9px]">{new Date(reply.created_at).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <p className="text-white text-xs leading-relaxed break-words">
                                    {reply.content.split(' ').map((word: string, i: number) => 
                                      word.startsWith('@') ? <span key={i} className="text-red-500 font-medium">{word} </span> : word + ' '
                                    )}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center">
                                      <button 
                                        onClick={() => handleToggleCommentLike(reply.comment_id, 'like')}
                                        className={`p-1 rounded-full hover:bg-white/10 transition ${reply.is_liked ? 'text-red-600' : 'text-white/40'}`}
                                      >
                                        <ThumbsUp size={12} />
                                      </button>
                                      <span className="text-[10px] text-white/40 ml-1">{reply.likes_count || 0}</span>
                                    </div>
                                    <button 
                                      onClick={() => handleToggleCommentLike(reply.comment_id, 'dislike')}
                                      className={`p-1 rounded-full hover:bg-white/10 transition ${reply.is_disliked ? 'text-white' : 'text-white/40'}`}
                                    >
                                      <ThumbsDown size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleReplyClick(reply)}
                                      className="text-[10px] text-white/40 hover:text-white transition font-bold px-1.5 py-0.5 rounded-full hover:bg-white/10"
                                    >
                                      Phản hồi
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => toggleReplies(comment.comment_id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-white/60 hover:text-white px-2 py-1 rounded-full transition ml-1"
                          >
                            <ChevronUp size={14} />
                            Thu gọn
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-white/40 text-sm mt-10">Chưa có bình luận nào.</div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-zinc-900">
          <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder={replyTo ? `Phản hồi @${replyTo.username}...` : "Thêm bình luận..."}
                className="flex-1 bg-white/5 text-white text-sm px-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-white/30"
              />
            </div>
            {commentContent.trim() && (
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => {setCommentContent(''); setReplyTo(null);}}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold text-xs disabled:opacity-50 transition hover:bg-blue-700"
                >
                  {isSubmitting ? 'Đang gửi...' : (replyTo ? 'Phản hồi' : 'Gửi')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
