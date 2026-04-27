"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, MoreHorizontal, ChevronDown, ChevronUp, MessageSquare, X } from 'lucide-react';
import VideoCard from '@/views/components/VideoCard';
import Link from 'next/link';
import { formatDuration, getUploadUrl } from '@/lib/utils';
import { toggleCommentInteraction, submitCommentAction, toggleLike, toggleFollow, getUserPlaylistsAction, createPlaylistAction, toggleVideoInPlaylistAction, getWatchHistoryAction } from '@/lib/actions';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface WatchPageProps {
  video: any;
  relatedVideos: any[];
  comments?: any[];
  user?: any;
}

export default function WatchPage({ video, relatedVideos, comments = [], user }: WatchPageProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);

  // States for interactions
  const [isLiked, setIsLiked] = useState(video.is_liked === 1);
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const [isFollowed, setIsFollowed] = useState(video.is_followed === 1);
  const [subCount, setSubCount] = useState(video.sub_count || 0);

  // States for playlists
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistsWithVideo, setPlaylistsWithVideo] = useState<number[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayVideos, setDisplayVideos] = useState<any[]>(relatedVideos);
  const [historyVideos, setHistoryVideos] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Banner carousel state
  const [currentBanner, setCurrentBanner] = useState(0);
  const [prevBanner, setPrevBanner] = useState(-1);
  const watchBanners = ['/assets/img/banner3.jpg', '/assets/img/banner4.jpg'];

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevBanner(currentBanner);
      setCurrentBanner((prev) => (prev + 1) % watchBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentBanner]);

  useEffect(() => {
    if (prevBanner !== -1) {
      const timer = setTimeout(() => setPrevBanner(-1), 1000);
      return () => clearTimeout(timer);
    }
  }, [prevBanner]);

  useEffect(() => {
    const filterVideos = async () => {
      if (activeFilter === 'all') {
        setDisplayVideos(relatedVideos);
      } else if (activeFilter === 'category') {
        // Filter by category_id
        setDisplayVideos(relatedVideos.filter(v => v.category_id === video.category_id));
      } else if (activeFilter === 'history') {
        if (historyVideos.length === 0) {
          setIsLoadingHistory(true);
          const history = await getWatchHistoryAction();
          setHistoryVideos(history);
          setDisplayVideos(history);
          setIsLoadingHistory(false);
        } else {
          setDisplayVideos(historyVideos);
        }
      }
    };
    filterVideos();
  }, [activeFilter, relatedVideos, video.category_id]);

  const handleToggleLike = async () => {
    if (!user) {
      signIn();
      return;
    }

    const res = await toggleLike(video.video_id, Number(user.id));
    if (res.success) {
      setIsLiked(res.isLiked);
      setLikesCount(prev => res.isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      signIn();
      return;
    }

    const res = await toggleFollow(video.channel_id, Number(user.id));
    if (res.success) {
      setIsFollowed(res.isFollowed);
      setSubCount(prev => res.isFollowed ? prev + 1 : prev - 1);
    }
  };
  
  const { 
    setActiveVideo, 
    miniPlayerTime, 
    setMiniPlayerTime, 
    setIsPlaying,
    activeVideo
  } = useUI();

  // Organize comments into threads
  const threadedComments = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_comment_id);
    const allReplies = comments.filter(c => c.parent_comment_id);

    // Function to find the ultimate parent (root) of a comment
    const findRootParentId = (comment: any): number | null => {
      let current = comment;
      let depth = 0;
      const maxDepth = 10; // Safety break
      
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
        .filter(r => {
          const rootId = findRootParentId(r);
          return rootId === parent.comment_id;
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Replies chronological
    })).sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)); // Sort parents by likes
  }, [comments]);

  useLayoutEffect(() => {
    // Nếu video trong WatchPage khác với video đang lưu toàn cục, cập nhật lại
    if (activeVideo?.video_id !== video?.video_id) {
        setActiveVideo(video);
    }
    
    // Đồng bộ thời gian và tự động phát
    if (videoRef.current) {
        videoRef.current.currentTime = miniPlayerTime;
        
        // Chỉ tự động phát nếu không có miniPlayerTime (tức là xem mới) 
        // hoặc nếu đang ở trạng thái phát từ miniPlayer chuyển sang
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Auto-play blocked:", err);
        });
    }

    // Cleanup khi component unmount
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [video?.video_id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        setMiniPlayerTime(videoRef.current.currentTime);
    }
    
    if (!viewCounted && videoRef.current && videoRef.current.currentTime >= 10) {
      setViewCounted(true);
      fetch(`/api/videos/${video.video_id}/view`, {
        method: 'POST',
      }).catch(err => console.error('Error counting view:', err));
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleEnded = () => {
    // Allows counting another view if the user re-watches the video after it ends
    setViewCounted(false);
    setIsPlaying(false);
  };

  const handleToggleCommentLike = async (commentId: number, type: 'like' | 'dislike') => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện tính năng này');
      return;
    }
    await toggleCommentInteraction(commentId, Number(user.id), video.video_id, type);
  };

  const handleReplyClick = (comment: any) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện tính năng này');
      return;
    }
    setReplyTo(comment);
    setCommentContent(`@${comment.username} `);
    inputRef.current?.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitCommentAction(
        video.video_id, 
        Number(user.id), 
        commentContent, 
        replyTo?.parent_comment_id || replyTo?.comment_id // Reply to parent or child
      );
      if (res.success) {
        setCommentContent('');
        setReplyTo(null);
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => 
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  const [isSaved, setIsSaved] = useState(false);

  const fetchPlaylists = async () => {
    if (!user) return;
    const playlists = await getUserPlaylistsAction(video.video_id);
    setUserPlaylists(playlists);
  };


  const handleToggleSave = () => {
    if (!user) {
      signIn();
      return;
    }
    fetchPlaylists();
    setIsPlaylistModalOpen(true);
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setIsCreatingPlaylist(true);
    const res = await createPlaylistAction(newPlaylistName);
    if (res.success) {
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
      fetchPlaylists();
    }
  };

  const handleTogglePlaylist = async (playlistId: number) => {
    const res = await toggleVideoInPlaylistAction(playlistId, video.video_id);
    if (res.success) {
      // Update local state if needed
      fetchPlaylists();
    }
  };

  if (!video) return <div className="text-white p-10 text-center">Video không tồn tại</div>;

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Cột chính: Player + Info + Comments */}
      <div className="flex-1 min-w-0">
        {/* Video Player */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-4">
          <video 
            ref={videoRef}
            controls 
            autoPlay 
            loop={false}
            className="w-full h-full"
            poster={getUploadUrl(video.thumbnail_url)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onPlay={handlePlay}
            onPause={handlePause}
          >
            <source src={getUploadUrl(video.video_url)} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
        </div>

        {/* Video Title */}
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
          {video.title}
        </h1>

        {/* Channel & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5">
              <img 
                src={getUploadUrl(video.channel_avatar, '/assets/img/avata.jpg')} 
                className="w-full h-full object-cover" 
                alt="" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base truncate">{video.channel_name}</p>
              <p className="text-white/50 text-xs">{subCount?.toLocaleString('vi-VN')} người đăng ký</p>
            </div>
            <button 
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition ml-2 ${isFollowed ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-white/90'}`}
            >
              {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${isLiked ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>{likesCount?.toLocaleString('vi-VN')}</span>
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium transition">
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
            <button 
              onClick={handleToggleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${isSaved ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
              <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
            </button>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6 hover:bg-white/10 transition group cursor-pointer" onClick={() => setIsDescExpanded(!isDescExpanded)}>
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
            <span>{video.view_count?.toLocaleString('vi-VN')} lượt xem</span>
            <span>•</span>
            <span>{new Date(video.uploaded_at).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className={`text-sm text-white/90 whitespace-pre-line ${isDescExpanded ? '' : 'line-clamp-3'}`}>
            {video.description || 'Không có mô tả.'}
          </div>
          <button className="text-sm font-bold text-white mt-2 flex items-center gap-1">
            {isDescExpanded ? 'Ẩn bớt' : 'Xem thêm'}
            {isDescExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Comments Section */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-6">{comments.length} bình luận</h3>
          
          {/* Add Comment Input */}
          <div className="flex flex-col gap-2 mb-8">
            {replyTo && (
              <div className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-lg text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} />
                  <span>Đang phản hồi <strong>@{replyTo.username}</strong></span>
                </div>
                <button onClick={() => {setReplyTo(null); setCommentContent('');}} className="hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmitComment} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
                  <img 
                    src={user?.image || '/assets/img/avata.jpg'} 
                    className="w-full h-full object-cover"
                    alt=""
                  />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="border-b border-white/20 pb-1 focus-within:border-white transition">
                    <input 
                      ref={inputRef}
                      type="text" 
                      placeholder="Viết bình luận..." 
                      className="w-full bg-transparent text-white text-sm outline-none py-1"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                </div>
                {commentContent.trim() && (
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => {setCommentContent(''); setReplyTo(null);}}
                      className="px-4 py-2 text-sm text-white/60 hover:text-white transition"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-full font-bold transition"
                    >
                      {isSubmitting ? 'Đang gửi...' : (replyTo ? 'Phản hồi' : 'Bình luận')}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {threadedComments.length > 0 ? threadedComments.map((comment) => (
              <div key={comment.comment_id} className="group">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5">
                    <img 
                      src={getUploadUrl(comment.avatar, '/assets/img/avata.jpg')} 
                      className="w-full h-full object-cover"
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">@{comment.username}</span>
                      <span className="text-xs text-white/40">{new Date(comment.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {comment.content.split(' ').map((word: string, i: number) => 
                        word.startsWith('@') ? <span key={i} className="text-red-500 font-medium">{word} </span> : word + ' '
                      )}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleToggleCommentLike(comment.comment_id, 'like')}
                          className={`p-2 rounded-full hover:bg-white/10 transition ${comment.is_liked ? 'text-red-600' : 'text-white/40'}`}
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <span className="text-xs text-white/40 ml-1">{comment.likes_count || 0}</span>
                      </div>
                      <button 
                        onClick={() => handleToggleCommentLike(comment.comment_id, 'dislike')}
                        className={`p-2 rounded-full hover:bg-white/10 transition ${comment.is_disliked ? 'text-white' : 'text-white/40'}`}
                      >
                        <ThumbsDown size={16} />
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
                            className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1 rounded-full transition"
                          >
                            <ChevronDown size={16} />
                            Xem thêm {comment.replies.length} phản hồi
                          </button>
                        ) : (
                          <>
                            <div className="mt-4 space-y-4 ml-2 border-l-2 border-white/10 pl-4 mb-4">
                              {comment.replies.map((reply: any) => (
                                <div key={reply.comment_id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/5">
                                    <img 
                                      src={getUploadUrl(reply.avatar, '/assets/img/avata.jpg')} 
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold text-white">@{reply.username}</span>
                                      <span className="text-[10px] text-white/40">{new Date(reply.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <p className="text-sm text-white/90 leading-relaxed">
                                      {/* Highlight tags */}
                                      {reply.content.split(' ').map((word: string, i: number) => 
                                        word.startsWith('@') ? <span key={i} className="text-red-500 font-medium">{word} </span> : word + ' '
                                      )}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <div className="flex items-center">
                                        <button 
                                          onClick={() => handleToggleCommentLike(reply.comment_id, 'like')}
                                          className={`p-1.5 rounded-full hover:bg-white/10 transition ${reply.is_liked ? 'text-red-600' : 'text-white/40'}`}
                                        >
                                          <ThumbsUp size={14} />
                                        </button>
                                        <span className="text-[10px] text-white/40">{reply.likes_count || 0}</span>
                                      </div>
                                      <button 
                                        onClick={() => handleToggleCommentLike(reply.comment_id, 'dislike')}
                                        className={`p-1.5 rounded-full hover:bg-white/10 transition ${reply.is_disliked ? 'text-white' : 'text-white/40'}`}
                                      >
                                        <ThumbsDown size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleReplyClick(reply)}
                                        className="text-[10px] text-white/40 hover:text-white transition font-bold"
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
                              className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1 rounded-full transition"
                            >
                              <ChevronUp size={16} />
                              Ẩn bớt
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-white/40 text-center py-10 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            )}
          </div>
        </div>
      </div>

      {/* Cột phụ: Video gợi ý */}
      <aside className="xl:w-[400px] flex-shrink-0 space-y-6">
        {/* Banner Carousel Frame */}
        <div className="relative aspect-[2/1] rounded-xl overflow-hidden border border-white/10 shadow-2xl group bg-black/20">
          {watchBanners.map((img, idx) => {
            const isCurrent = idx === currentBanner;
            const isPrev = idx === prevBanner;
            
            let positionClass = "translate-x-full opacity-0";
            let transitionClass = "transition-all duration-1000";

            if (isCurrent) {
              positionClass = "translate-x-0 opacity-100 z-10";
            } else if (isPrev) {
              positionClass = "-translate-x-full opacity-0 z-0";
            } else {
              transitionClass = "transition-none";
            }

            return (
              <div 
                key={idx}
                className={`absolute inset-0 ease-in-out ${positionClass} ${transitionClass}`}
              >
                <img 
                  src={img} 
                  className="w-full h-full object-cover" 
                  alt={`Quảng cáo ${idx + 1}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            );
          })}
          
          <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
            Tài trợ
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {watchBanners.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentBanner ? 'w-4 bg-white' : 'w-1 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-4">Video gợi ý</h3>
          
          {/* Category Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'category', label: 'Cùng thể loại' },
              { id: 'history', label: 'Đã xem' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeFilter === filter.id 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {isLoadingHistory ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-2 animate-pulse">
                    <div className="w-40 aspect-video bg-white/5 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayVideos.length > 0 ? (
              displayVideos.map((item) => (
                <div key={`${activeFilter}-${item.video_id}`} className="flex gap-2 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-300">
                  <Link href={`/watch/${item.video_id}`} className="flex gap-2 w-full">
                    <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                      <img 
                        src={getUploadUrl(item.thumbnail_url)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        alt=""
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white z-10 border border-white/10">
                        {formatDuration(item.duration || 0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-red-500 transition-colors mb-1 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors">{item.channel_name}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                        <span>{item.view_count?.toLocaleString('vi-VN')} lượt xem</span>
                        {item.watched_at && (
                          <>
                            <span>•</span>
                            <span className="text-red-400">Đã xem</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-white/30 text-center py-10 italic text-sm">Không tìm thấy video nào</p>
            )}
          </div>
        </div>
      </aside>


      {/* Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPlaylistModalOpen(false)} />
          
          <div className="relative bg-[#1f1f1f] border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Lưu vào...</h3>
              <button onClick={() => setIsPlaylistModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-white/60">
                <X size={20} />
              </button>
            </div>

            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {userPlaylists.length > 0 ? (
                userPlaylists.map((pl) => (
                  <button 
                    key={pl.playlist_id}
                    onClick={() => handleTogglePlaylist(pl.playlist_id)}
                    className="flex items-center justify-between w-full p-3 hover:bg-white/5 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${pl.has_video === 1 ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>
                        {pl.has_video === 1 && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className="text-white text-sm font-medium">{pl.playlist_name}</span>
                    </div>

                    <span className="text-[10px] text-white/40">{pl.is_private ? 'Riêng tư' : 'Công khai'}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-white/30 text-sm italic">
                  Bạn chưa có danh sách phát nào.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
              <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Tên danh sách phát mới..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition"
                  maxLength={50}
                />
                <button 
                  type="submit"
                  disabled={!newPlaylistName.trim() || isCreatingPlaylist}
                  className="bg-white text-black py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition disabled:opacity-50"
                >
                  {isCreatingPlaylist ? 'Đang tạo...' : 'Tạo mới'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

