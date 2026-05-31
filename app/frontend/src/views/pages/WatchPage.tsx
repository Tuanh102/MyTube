"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, MoreHorizontal, ChevronDown, ChevronUp, MessageSquare, X, Play, Pause, ShieldCheck, Flag, AlertTriangle, Trash2, Copy, Heart } from 'lucide-react';
import VideoCard from '@/views/components/VideoCard';
import Link from 'next/link';
import { formatDuration, getUploadUrl } from '@/lib/utils';
import { toggleCommentInteraction, submitCommentAction, toggleLike, toggleDislike, toggleFollow, getUserPlaylistsAction, createPlaylistAction, toggleVideoInPlaylistAction, getWatchHistoryAction, addToHistoryAction, incrementViewCountAction, submitVideoReportAction, donateAction } from '@/lib/actions';
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
  const { 
    setActiveVideo, 
    miniPlayerTime, 
    setMiniPlayerTime, 
    setIsPlaying,
    activeVideo,
    setIsLoginDropdownOpen, // Nhận hàm kích hoạt login từ UIContext
    isAdActive,
    setIsAdActive,
    adCountdownGlobal,
    setAdCountdownGlobal,
    adTotalCountdownGlobal,
    setAdTotalCountdownGlobal,
    isAdPausedGlobal,
    setIsAdPausedGlobal
  } = useUI();

  // Hàm kiểm tra và cảnh báo Guest đăng nhập
  const ensureUserLoggedIn = (featureName: string) => {
    if (!user) {
      const confirmLogin = window.confirm(`Bạn cần đăng nhập bằng tài khoản mạng xã hội để sử dụng tính năng [${featureName}]. Click OK để đăng nhập ngay!`);
      if (confirmLogin) {
        setIsLoginDropdownOpen(true); // Bung form đăng nhập ở góc trên bên phải Header
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Tự động cuộn mượt mà lên đầu để nhìn thấy form
      }
      return false;
    }
    return true;
  };

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const viewCountedRef = useRef(false);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
  const [localComments, setLocalComments] = useState<any[]>(comments);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [overlayAnim, setOverlayAnim] = useState<'play' | 'pause' | null>(null);
  // Tính toán quyền xem đồng bộ ngay khi render
  const isPurchased = useMemo(() => {
    if (!video) return false;
    
    // 1. Kiểm tra video miễn phí (chỉ free khi không có giá tiền hoặc giá tiền bằng 0 và is_free không phải là false)
    const isFree = video.is_free !== false && (!video.price || video.price === 0);
    if (isFree) return true;

    // 2. Kiểm tra chủ sở hữu (phải đăng nhập trước, tức là user.id có giá trị thực sự)
    const isOwner = !!user?.id && (
      user.id.toString() === video.channel_user_id?.toString() || 
      user.id.toString() === video.user_id?.toString() ||
      user.id.toString() === video.channel?.user?.toString()
    );
    if (isOwner) return true;

    // 3. Kiểm tra đã mua (Dùng dữ liệu mới nhất từ DB nếu có, không thì dùng session)
    const purchasedVideos = currentUserData?.purchased_videos || user?.purchased_videos || [];
    const purchased = purchasedVideos.some((id: any) => id.toString() === (video._id || video.video_id).toString());
    return purchased;
  }, [video, user, currentUserData]);

  const isOwner = useMemo(() => {
    if (!video || !user?.id) return false;
    return (
      user.id.toString() === video.channel_user_id?.toString() || 
      user.id.toString() === video.user_id?.toString() ||
      user.id.toString() === video.channel?.user?.toString() ||
      user.id.toString() === video.channel?.user_id?.toString()
    );
  }, [video, user]);

  const [isBuying, setIsBuying] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikesCount, setDislikesCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`/api/users/profile/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            console.log('User Profile Updated:', data.purchased_videos);
            setCurrentUserData(data);
          }
        } catch (err) {
          console.error('Lỗi lấy profile:', err);
        }
      }
    };
    fetchUserProfile();

    if (video) {
      const liked = video.is_liked === true || (video.likes && user?.id && video.likes.map((id: any) => id.toString()).includes(user.id.toString()));
      const disliked = video.is_disliked === true || (video.dislikes && user?.id && video.dislikes.map((id: any) => id.toString()).includes(user.id.toString()));
      
      
      setIsLiked(liked);
      setIsDisliked(disliked);
      setLikesCount(video.likes?.length || 0);
      setDislikesCount(video.dislikes?.length || 0);
    }
  }, [video, user]);

  const [isFollowed, setIsFollowed] = useState(video.is_followed === 1);
  const [subCount, setSubCount] = useState(video.sub_count || 0);

  // States for playlists
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [draftPlaylists, setDraftPlaylists] = useState<string[]>([]);
  const [isSavingPlaylists, setIsSavingPlaylists] = useState(false);
  
  // States and refs for reporting video
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam hoặc gây hiểu lầm');
  const [customReportReason, setCustomReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(20000);
  const [donateMessage, setDonateMessage] = useState('');
  const [isSubmittingDonate, setIsSubmittingDonate] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close 3-dot dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Toast automatic dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureUserLoggedIn('Báo cáo video')) return;
    
    setIsSubmittingReport(true);
    const finalReason = reportReason === 'Lý do khác' && customReportReason.trim()
      ? `Lý do khác: ${customReportReason.trim()}`
      : reportReason;
      
    try {
      const res = await submitVideoReportAction((video._id || video.video_id).toString(), user.id.toString(), finalReason);
      if (res && (res._id || res.success !== false)) {
        setToast({ message: 'Gửi báo cáo thành công! Cảm ơn bạn đã đóng góp giúp cộng đồng lành mạnh.', type: 'success' });
        setIsReportModalOpen(false);
        setCustomReportReason('');
      } else {
        setToast({ message: res.message || 'Lỗi gửi báo cáo. Vui lòng thử lại sau!', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Lỗi kết nối server.', type: 'error' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureUserLoggedIn('Donate ủng hộ')) return;
    if (donateAmount <= 0) {
      alert('Số tiền donate không hợp lệ');
      return;
    }

    const creatorId = video.channel_user_id || video.channel?.user;
    if (!creatorId) {
      alert('Không tìm thấy ID người sở hữu kênh để donate');
      return;
    }

    if (user.id.toString() === creatorId.toString()) {
      alert('Bạn không thể donate cho chính video/kênh của mình');
      return;
    }

    setIsSubmittingDonate(true);
    try {
      const res = await donateAction(user.id.toString(), creatorId.toString(), donateAmount / 1000);
      if (res.success) {
        // Cập nhật số dư người dùng cục bộ nếu có
        if (currentUserData) {
          setCurrentUserData((prev: any) => ({
            ...prev,
            balance: res.senderBalance
          }));
        }

        // Tạo nội dung bình luận
        const commentMsg = `💸 Đã donate ${donateAmount.toLocaleString('vi-VN')}đ cho chủ kênh${donateMessage.trim() ? ` kèm lời nhắn: "${donateMessage.trim()}"` : ''}`;
        
        // Gửi bình luận lên server
        const commRes = await submitCommentAction(
          video._id || video.video_id, 
          user.id, 
          commentMsg
        );

        if (commRes.success) {
          const newComment = {
            comment_id: commRes.comment?._id || commRes.comment?.id || Date.now().toString(),
            username: user.name || user.username || 'You',
            avatar: user.image || '/assets/img/avata.jpg',
            is_premium: currentUserData?.is_premium || user?.is_premium || false,
            premium_show_avatar_aura: currentUserData?.premium_show_avatar_aura !== false && user?.premium_show_avatar_aura !== false,
            premium_show_comment_aura: currentUserData?.premium_show_comment_aura !== false && user?.premium_show_comment_aura !== false,
            content: commentMsg,
            created_at: new Date().toISOString(),
            likes_count: 0,
            dislikes_count: 0,
            likes: [],
            dislikes: [],
            parent_comment_id: null,
            replies: []
          };
          
          setLocalComments(prev => [newComment, ...prev]);
        }

        setToast({ message: `Cảm ơn bạn đã donate ${donateAmount.toLocaleString('vi-VN')}đ!`, type: 'success' });
        setIsDonateModalOpen(false);
        setDonateMessage('');
      } else {
        setToast({ message: res.message || 'Lỗi khi donate. Vui lòng thử lại!', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Lỗi kết nối máy chủ.', type: 'error' });
    } finally {
      setIsSubmittingDonate(false);
    }
  };

  // --- HỆ THỐNG QUẢNG CÁO PRE-ROLL XANH SM ---
  // Ref để theo dõi xem có thực sự đang quay lại video từ Mini Player hay không
  // Dùng refs để đánh giá duy nhất một lần tại thời điểm render đầu tiên của video mới,
  // tránh race condition khi useLayoutEffect cập nhật activeVideo làm cho state này bị thay đổi sau đó.
  const isReturningRef = useRef(false);
  const lastVideoIdRef = useRef<string | null>(null);
  const currentVideoId = (video?._id || video?.video_id)?.toString();

  if (lastVideoIdRef.current !== currentVideoId) {
    const activeId = (activeVideo?._id || activeVideo?.video_id)?.toString();
    isReturningRef.current = !!activeVideo && activeId === currentVideoId && !isAdActive;
    lastVideoIdRef.current = currentVideoId;
  }

  const isReturningFromMiniplayer = isReturningRef.current;

  // Ref lưu giữ giá trị isAdActive ở render trước đó để bắt chính xác hành động chuyển tiếp từ true sang false (Ví dụ: user bấm Bỏ qua từ MiniPlayer)
  const prevIsAdActiveRef = useRef(isAdActive);

  // Khởi tạo state quảng cáo cục bộ để đồng bộ tức thì trên giao diện render đầu tiên, tránh race condition
  const [localShowAd, setLocalShowAd] = useState(() => {
    const isPremiumUser = currentUserData?.is_premium === true || user?.is_premium === true;
    if (isPremiumUser) return false;
    return !isReturningFromMiniplayer;
  });

  // States lưu cấu hình quảng cáo lấy từ API
  const [prerollAdData, setPrerollAdData] = useState<any>(null);
  const [watchBanners, setWatchBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [prevBanner, setPrevBanner] = useState(-1);
  const [globalAdEnabled, setGlobalAdEnabled] = useState(true);

  const localAdVideoRef = useRef<HTMLVideoElement>(null);

  const getPrerollEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    let videoId = '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1&showinfo=0`;
    }
    return url;
  };

  const isYouTubeAd = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const trackAdEvent = async (slotId: string, type: 'view' | 'click') => {
    try {
      await fetch(`/api/ads/${slotId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.error(`Error tracking ${type} for ad ${slotId}:`, err);
    }
  };

  useEffect(() => {
    async function loadAds() {
      try {
        const res = await fetch('/api/ads?mode=public');
        if (res.ok) {
          const data = await res.json();
          const globalEnabled = data.globalAdEnabled !== false;
          setGlobalAdEnabled(globalEnabled);
          
          // Rotation for pre-roll ads
          const activePrerolls = data.ads?.filter((ad: any) => ad.slotId.startsWith('video_preroll') && ad.isActive) || [];
          if (activePrerolls.length > 0 && globalEnabled) {
            const randomIndex = Math.floor(Math.random() * activePrerolls.length);
            const selectedPreroll = activePrerolls[randomIndex];
            setPrerollAdData(selectedPreroll);
          } else {
            setLocalShowAd(false);
          }

          // Sidebar banners carousel
          const sidebarAds = data.ads?.filter((ad: any) => ad.slotId.startsWith('suggested_sidebar') && ad.isActive) || [];
          
          // Rotate suggested sidebar ads dynamically by shuffling
          const shuffledSidebar = [...sidebarAds].sort(() => Math.random() - 0.5);

          const formattedSidebar = shuffledSidebar.map((ad: any, idx: number) => ({
            slotId: ad.slotId,
            image: ad.mediaUrl,
            url: ad.linkUrl,
            alt: ad.description || ad.title,
            sponsor: ad.badgeText || 'Tài trợ',
            title: ad.title,
            description: ad.description,
            badgeBg: idx === 0 ? 'bg-[#00f5d4] text-zinc-950 shadow-[#00f5d4]/20' : 'bg-red-500 text-white shadow-red-500/20',
            titleHoverColor: idx === 0 ? 'group-hover:text-[#00e5ff]' : 'group-hover:text-red-400',
            overlayGradient: 'bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent'
          }));
          setWatchBanners(formattedSidebar);
        }
      } catch (err) {
        console.error("Lỗi lấy cấu hình quảng cáo WatchPage:", err);
      }
    }
    loadAds();
  }, [video?._id, video?.video_id]);

  // Track pre-roll view when shown
  useEffect(() => {
    if (localShowAd && prerollAdData) {
      trackAdEvent(prerollAdData.slotId, 'view');
    }
  }, [localShowAd, prerollAdData]);

  // Track sidebar ad view when slide changes
  useEffect(() => {
    if (watchBanners.length > 0 && watchBanners[currentBanner]) {
      trackAdEvent(watchBanners[currentBanner].slotId, 'view');
    }
  }, [currentBanner, watchBanners]);

  // Ánh xạ các state quảng cáo cục bộ sang state toàn cục trỏ từ UIContext
  const showAd = localShowAd;
  const setShowAd = setLocalShowAd;
  const adCountdown = adCountdownGlobal;
  const setAdCountdown = setAdCountdownGlobal;
  const adTotalCountdown = adTotalCountdownGlobal;
  const setAdTotalCountdown = setAdTotalCountdownGlobal;
  const isAdPaused = isAdPausedGlobal;
  const setIsAdPaused = setIsAdPausedGlobal;

  // Đồng bộ trạng thái quảng cáo từ cục bộ sang toàn cục
  useEffect(() => {
    setIsAdActive(localShowAd);
  }, [localShowAd, setIsAdActive]);

  // Đồng bộ trạng thái quảng cáo từ toàn cục về cục bộ (chỉ phản ứng khi quảng cáo thực sự được chuyển từ ON sang OFF từ bên ngoài)
  useEffect(() => {
    if (prevIsAdActiveRef.current && !isAdActive) {
      setLocalShowAd(false);
    }
    prevIsAdActiveRef.current = isAdActive;
  }, [isAdActive]);

  const adIframeRef = useRef<HTMLIFrameElement>(null);

  // Điều khiển Tạm dừng / Tiếp tục phát video quảng cáo YouTube nhúng hoặc video tự upload
  const toggleAdPlayPause = () => {
    const mediaUrl = prerollAdData?.mediaUrl || "https://www.youtube.com/embed/ZPcCfW4JNO0";
    const isYT = isYouTubeAd(mediaUrl);

    if (isYT) {
      if (!adIframeRef.current || !adIframeRef.current.contentWindow) return;
      if (isAdPaused) {
        adIframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsAdPaused(false);
      } else {
        adIframeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsAdPaused(true);
      }
    } else {
      if (!localAdVideoRef.current) return;
      if (isAdPaused) {
        localAdVideoRef.current.play().catch(err => console.log("Ad video play failed:", err));
        setIsAdPaused(false);
      } else {
        localAdVideoRef.current.pause();
        setIsAdPaused(true);
      }
    }
  };

  const handleSkipAd = () => {
    // 1. Tắt quảng cáo ngay lập tức để React re-render ẩn lớp phủ quảng cáo trước
    setShowAd(false);
    setIsPlaying(true); 
    
    // 2. Kích hoạt phát video gốc bất đồng bộ sau 50ms để tránh lỗi Autoplay block luồng re-render
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            addToHistoryAction((video._id || video.video_id).toString());
          })
          .catch((err) => {
            console.log("Auto-play main video blocked by browser:", err);
            // Giữ cho video ở trạng thái pause nếu trình duyệt bắt buộc click
            setIsPlaying(false);
          });
      }
    }, 50);
  };

  // Tự động reset quảng cáo khi chuyển đổi sang video mới (Bỏ qua reset nếu quay về đúng video đang phát ở Mini-player hoặc là Premium)
  useEffect(() => {
    const isPremiumUser = currentUserData?.is_premium === true || user?.is_premium === true;
    if (isPremiumUser) {
      setShowAd(false);
      return;
    }

    if (!isReturningFromMiniplayer) {
      const isPrerollActive = globalAdEnabled && (prerollAdData ? prerollAdData.isActive : true);
      if (isPrerollActive) {
        setShowAd(true);
        setAdCountdown(5);
        setAdTotalCountdown(30);
        setIsAdPaused(false);
      } else {
        setShowAd(false);
      }
    } else {
      // Giữ cho quảng cáo tắt nếu quay lại video đang chạy ở Mini Player
      setShowAd(false);
    }
  }, [video._id, video.video_id, isReturningFromMiniplayer, currentUserData?.is_premium, user?.is_premium, globalAdEnabled, prerollAdData?.isActive]);

  // Reset viewCountedRef and localComments when switching videos
  useEffect(() => {
    viewCountedRef.current = false;
    setLocalComments(comments);
  }, [video?._id, video?.video_id, comments]);

  // Theo dõi sự thay đổi của showAd (isAdActive) để đồng bộ phát video chính khi quảng cáo kết thúc hoặc được bỏ qua
  useEffect(() => {
    if (!showAd && isPurchased) {
      setIsPlaying(true);
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play()
          .then(() => {
            addToHistoryAction((video._id || video.video_id).toString());
          })
          .catch(err => {
            console.log("Auto-play main video blocked by browser:", err);
          });
      }
    }
  }, [showAd, isPurchased, video?._id, video?.video_id]);
  // ------------------------------------------
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayVideos, setDisplayVideos] = useState<any[]>(relatedVideos);
  const [historyVideos, setHistoryVideos] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Banner carousel state (moved up to avoid TDZ errors)

  useEffect(() => {
    if (watchBanners.length <= 1) return;
    const timer = setInterval(() => {
      setPrevBanner(currentBanner);
      setCurrentBanner((prev) => (prev + 1) % watchBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentBanner, watchBanners.length]);

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
        // Filter by category_id securely as string comparison
        setDisplayVideos(relatedVideos.filter(v => v.category_id?.toString() === video.category_id?.toString()));
      } else if (activeFilter === 'history') {
        if (historyVideos.length === 0) {
          setIsLoadingHistory(true);
          const rawHistory = await getWatchHistoryAction();
          
          // Map and ensure video_id is set
          const formattedHistory = Array.isArray(rawHistory) ? rawHistory.map((v: any) => ({
            ...v,
            video_id: v._id?.toString() || v.video_id?.toString() || '',
            channel_name: v.channel?.channel_name || 'Unknown Channel',
            watched_at: v.watched_at || new Date().toISOString()
          })) : [];

          // Deduplicate: Keep only the first (newest) occurrence of each video
          const seen = new Set();
          const deduplicatedHistory = [];
          for (const item of formattedHistory) {
            if (item.video_id && !seen.has(item.video_id)) {
              seen.add(item.video_id);
              deduplicatedHistory.push(item);
            }
          }

          setHistoryVideos(deduplicatedHistory);
          setDisplayVideos(deduplicatedHistory);
          setIsLoadingHistory(false);
        } else {
          setDisplayVideos(historyVideos);
        }
      }
    };
    filterVideos();
  }, [activeFilter, relatedVideos, video.category_id, historyVideos.length]);

  const handleToggleLike = async () => {
    if (!ensureUserLoggedIn('Like video')) return;

    const res = await toggleLike(video._id || video.video_id, user.id);
    if (res.success) {
      setIsLiked(res.isLiked);
      setIsDisliked(res.isDisliked);
      setLikesCount(res.likesCount);
      setDislikesCount(res.dislikesCount);
    }
  };

  const handleToggleDislike = async () => {
    if (!ensureUserLoggedIn('Dislike video')) return;

    const res = await toggleDislike(video._id || video.video_id, user.id);
    if (res.success) {
      setIsLiked(res.isLiked);
      setIsDisliked(res.isDisliked);
      setLikesCount(res.likesCount);
      setDislikesCount(res.dislikesCount);
    }
  };

  const handleToggleFollow = async () => {
    if (!ensureUserLoggedIn('Theo dõi kênh')) return;

    const res = await toggleFollow(video.channel_id, user.id.toString());
    if (res.success) {
      setIsFollowed(res.isFollowed);
      setSubCount(prev => res.isFollowed ? prev + 1 : prev - 1);
    }
  };
  
  // Organize comments into threads
  const threadedComments = useMemo(() => {
    const topLevel = localComments.filter(c => !c.parent_comment_id);
    const allReplies = localComments.filter(c => c.parent_comment_id);

    // Function to find the ultimate parent (root) of a comment
    const findRootParentId = (comment: any): number | null => {
      let current = comment;
      let depth = 0;
      const maxDepth = 10; // Safety break
      
      while (current.parent_comment_id && depth < maxDepth) {
        const parent = localComments.find(c => c.comment_id === current.parent_comment_id);
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
  }, [localComments]);

  useLayoutEffect(() => {
    // Nếu video trong WatchPage khác với video đang lưu toàn cục, cập nhật lại
    // CHỈ cập nhật vào Mini Player nếu đã mua hoặc miễn phí
    if (isPurchased) {
        if (activeVideo?.video_id !== video?.video_id) {
            setActiveVideo(video);
        }
    } else {
        // Nếu chưa mua, tắt Mini Player hiện tại đi
        setActiveVideo(null);
    }
    
    // Đồng bộ thời gian và tự động phát (Chỉ phát khi đã mua hoặc miễn phí và quảng cáo đã kết thúc)
    if (videoRef.current && isPurchased) {
        videoRef.current.currentTime = miniPlayerTime;
        
        if (!showAd) {
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(err => {
              console.log("Auto-play blocked:", err);
            });
        }
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
    
    // View is counted after watching for at least 30 seconds
    if (!viewCountedRef.current && videoRef.current && videoRef.current.currentTime >= 30) {
      viewCountedRef.current = true;
      incrementViewCountAction((video._id || video.video_id).toString())
        .catch(err => console.error('Error counting view:', err));
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    addToHistoryAction((video._id || video.video_id).toString());
    setOverlayAnim('play');
    setTimeout(() => setOverlayAnim(null), 500);
  };
  const handlePause = () => {
    setIsPlaying(false);
    setOverlayAnim('pause');
    setTimeout(() => setOverlayAnim(null), 500);
  };

  const handleEnded = () => {
    // Only count 1 view per session, so we DO NOT setViewCounted(false) here.
    // If the user re-watches, it won't count again until they reload the page.
    if (!viewCountedRef.current && video) {
      viewCountedRef.current = true;
      incrementViewCountAction((video._id || video.video_id).toString())
        .catch(err => console.error('Error counting view on end:', err));
    }
    setIsPlaying(false);
  };

  const handleToggleCommentLike = async (commentId: number | string, type: 'like' | 'dislike') => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện tính năng này');
      return;
    }
    if (!commentId) return;
    const res = await toggleCommentInteraction(commentId.toString(), user.id, video._id || video.video_id, type);
    if (res.success) {
      setLocalComments(prev => prev.map(c => {
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
    if (!ensureUserLoggedIn('Phản hồi bình luận')) return;
    setReplyTo(comment);
    setCommentContent(`@${comment.username} `);
    inputRef.current?.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureUserLoggedIn('Bình luận video')) return;
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitCommentAction(
        video._id || video.video_id, 
        user.id, 
        commentContent, 
        replyTo?.parent_comment_id || replyTo?.comment_id // Reply to parent or child
      );
      if (res.success) {
        setCommentContent('');
        setReplyTo(null);
        
        // Add new comment to local state
        const newComment = {
          comment_id: res.comment?._id || res.comment?.id || Date.now().toString(),
          username: user.name || user.username || 'You',
          avatar: user.image || '/assets/img/avata.jpg',
          is_premium: currentUserData?.is_premium || user?.is_premium || false,
          content: commentContent,
          created_at: new Date().toISOString(),
          likes_count: 0,
          dislikes_count: 0,
          likes: [],
          dislikes: [],
          parent_comment_id: replyTo?.parent_comment_id || replyTo?.comment_id || null,
          replies: []
        };
        
        setLocalComments(prev => [newComment, ...prev]);
        
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuy = async () => {
    if (!ensureUserLoggedIn('Mua video trả phí')) return;

    setIsBuying(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: video.price,
          description: `Mua video: ${video.title}`,
          userId: user.id,
          videoId: video._id || video.video_id
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        alert(`Lỗi khởi tạo thanh toán:\n- Lỗi: ${data.message || data.error || 'Lỗi không xác định'}\n- Chi tiết: ${data.details || ''}`);
      } else {
        alert('Không thể tạo link thanh toán. Vui lòng kiểm tra lại cấu hình cổng thanh toán.');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra');
    } finally {
      setIsBuying(false);
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
    const playlists = await getUserPlaylistsAction(video._id || video.video_id);
    setUserPlaylists(playlists);
    setDraftPlaylists(playlists.filter((p: any) => p.has_video === 1).map((p: any) => p.playlist_id));
  };

  const handleToggleSave = () => {
    if (!ensureUserLoggedIn('Lưu video')) return;
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
      // Re-fetch playlists
      const playlists = await getUserPlaylistsAction(video._id || video.video_id);
      setUserPlaylists(playlists);
      // Keep draft state for old ones, maybe add new one if it has video (it shouldn't initially)
    }
  };

  const handleToggleDraftPlaylist = (playlistId: string) => {
    setDraftPlaylists(prev => 
      prev.includes(playlistId) ? prev.filter(id => id !== playlistId) : [...prev, playlistId]
    );
  };

  const handleSavePlaylists = async () => {
    setIsSavingPlaylists(true);
    const originalSelected = userPlaylists.filter((p: any) => p.has_video === 1).map((p: any) => p.playlist_id);
    
    const toAdd = draftPlaylists.filter(id => !originalSelected.includes(id));
    const toRemove = originalSelected.filter(id => !draftPlaylists.includes(id));
    const changes = [...toAdd, ...toRemove];
    
    for (const playlistId of changes) {
      await toggleVideoInPlaylistAction(playlistId, video._id || video.video_id);
    }
    
    setIsPlaylistModalOpen(false);
    setIsSavingPlaylists(false);
  };

  // Đánh chặn click video trả phí ở danh sách gợi ý đối với Guest chưa đăng nhập
  const handleRelatedVideoClick = (e: React.MouseEvent, item: any) => {
    if (!user && item.is_free === false) {
      e.preventDefault(); // Chặn chuyển hướng của Link
      const confirmLogin = window.confirm("Đây là video trả phí cao cấp. Bạn cần đăng nhập tài khoản để tiến hành mua bản quyền và thưởng thức video này. Click OK để đăng nhập ngay!");
      if (confirmLogin) {
        setIsLoginDropdownOpen(true); // Mở popover đăng nhập ở Header
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt mà lên đầu trang
      }
    }
  };

  const checkHasPermission = (v: any) => {
    const isFree = v.is_free !== false && (!v.price || v.price === 0);
    if (isFree) return true;

    const purchasedVideos = currentUserData?.purchased_videos || user?.purchased_videos || [];
    const isPurchased = purchasedVideos.some((id: any) => id.toString() === (v._id || v.video_id).toString());

    const isOwner = !!user?.id && (
      v.channel_user_id?.toString() === user.id.toString() ||
      v.user_id?.toString() === user.id.toString() ||
      v.channel?.user?.toString() === user.id.toString() ||
      v.channel?.user_id?.toString() === user.id.toString()
    );

    return isPurchased || isOwner;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Cột chính: Player + Info + Comments */}
      <div className="flex-1 min-w-0">
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-4 group">
          <video 
            ref={videoRef}
            controls={isPurchased && !showAd} 
            autoPlay={isPurchased && !showAd} 
            loop={false}
            className="w-full h-full"
            poster={getUploadUrl(video.thumbnail_url)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onPlay={handlePlay}
            onPause={handlePause}
          >
            {isPurchased && <source src={getUploadUrl(video.video_url)} type="video/mp4" />}
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>

          {/* LỚP PHỦ QUẢNG CÁO PRE-ROLL DÂN CƠ CHẾ VẬN HÀNH */}
          {isPurchased && showAd && (
            <div className="absolute inset-0 z-30 bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-300 dark-keep">
              {isYouTubeAd(prerollAdData?.mediaUrl || "https://www.youtube.com/embed/ZPcCfW4JNO0") ? (
                <iframe 
                  ref={adIframeRef}
                  src={getPrerollEmbedUrl(prerollAdData?.mediaUrl || "https://www.youtube.com/embed/ZPcCfW4JNO0")}
                  className="absolute w-[116%] h-[116%] -top-[8%] -left-[8%] pointer-events-none"
                  allow="autoplay; encrypted-media"
                  title="YouTube Pre-roll Ad"
                />
              ) : (
                <video
                  ref={localAdVideoRef}
                  src={getUploadUrl(prerollAdData?.mediaUrl)}
                  className="absolute w-full h-full object-cover pointer-events-none"
                  autoPlay
                  playsInline
                  onEnded={handleSkipAd}
                />
              )}
              
              {/* Lớp phủ bắt sự kiện nhấp chuột Play/Pause quảng cáo */}
              <div 
                onClick={toggleAdPlayPause}
                className="absolute inset-0 z-35 cursor-pointer flex items-center justify-center bg-black/5 hover:bg-black/20 transition-all duration-300"
              >
                {/* Biểu tượng Play khổng lồ xuất hiện ở trung tâm khi quảng cáo bị tạm dừng */}
                {isAdPaused && (
                  <div className="w-20 h-20 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center ring-4 ring-white/10 animate-in zoom-in-75 duration-200 hover:scale-105 transition shadow-[0_0_30px_rgba(255,255,255,0.25)] border border-white/10">
                    <Play size={36} className="text-white fill-white ml-1.5 animate-pulse" />
                  </div>
                )}
              </div>
              
              {/* Nhãn hiệu "Quảng cáo" (Ad label) ở góc trên bên trái */}
              <a 
                href={prerollAdData?.linkUrl || "https://www.xanhsm.com/"}
                onClick={() => {
                  if (prerollAdData?.slotId) {
                    trackAdEvent(prerollAdData.slotId, 'click');
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-40 hover:bg-black/85 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span className="bg-white text-zinc-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {prerollAdData?.badgeText || 'Ad'}
                </span>
                <span className="text-white font-bold text-xs hover:underline">{prerollAdData?.title || 'Quảng cáo tài trợ'}</span>
              </a>

              {/* Nút đếm ngược / Bỏ qua quảng cáo ở góc dưới bên phải */}
              <div className="absolute bottom-4 right-4 z-40">
                {adCountdown > 0 ? (
                  <div className="bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-white font-medium text-xs flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                      {adCountdown}
                    </span>
                    <span>Quảng cáo sẽ tắt sau {adCountdown}s...</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleSkipAd}
                    className="bg-[#121212]/60 hover:bg-[#121212]/85 backdrop-blur-md text-white font-bold py-3 px-6 rounded-sm border border-white/10 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Bỏ qua quảng cáo</span>
                    <svg className="w-4 h-4 text-white fill-current animate-pulse" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Overlay Khóa Video Trả Phí */}
          {!isPurchased && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212]/95 backdrop-blur-xl z-20 p-6 text-center animate-in fade-in duration-500 dark-keep">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-600/10">
                <ShieldCheck size={40} className="text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {!user ? 'Yêu cầu đăng nhập tài khoản' : 'Video này yêu cầu thanh toán'}
              </h2>
              <p className="text-white/60 mb-8 max-w-sm leading-relaxed text-sm">
                {!user ? (
                  <>
                    Nội dung trả phí thuộc sở hữu của <strong>{video.channel_name}</strong>. 
                    Vui lòng đăng nhập để tiến hành mua bản quyền và thưởng thức toàn bộ video này.
                  </>
                ) : (
                  <>
                    Nội dung này thuộc quyền sở hữu của <strong>{video.channel_name}</strong>. 
                    Hãy ủng hộ tác giả để xem toàn bộ video này.
                  </>
                )}
              </p>
              
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                {!user ? (
                  <button 
                    onClick={() => ensureUserLoggedIn('Xem & Mua video trả phí')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-base shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Đăng nhập để mua video
                  </button>
                ) : (
                  <button 
                    onClick={handleBuy}
                    disabled={isBuying}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    {isBuying ? 'Đang khởi tạo...' : `Mua ngay - ${((video.price || 0) < 1000 ? (video.price || 0) * 1000 : (video.price || 0)).toLocaleString('vi-VN')} VNĐ`}
                  </button>
                )}
                <Link href="/" className="text-white/40 hover:text-white text-sm transition font-medium">
                  Quay về trang chủ
                </Link>
              </div>
            </div>
          )}

          {/* Overlay Animation */}
          {overlayAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-in fade-in zoom-in duration-300">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 text-white">
                {overlayAnim === 'play' ? <Play size={64} fill="currentColor" /> : <Pause size={64} fill="currentColor" />}
              </div>
            </div>
          )}
        </div>

        {/* Video Title */}
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
          {video.title}
        </h1>

        {/* Channel & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/channel/${video.channel_id}`} className="flex items-center gap-3 group/channel">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5 ring-2 ring-transparent group-hover/channel:ring-red-500 transition-all">
                  <img 
                    src={getUploadUrl(video.channel_avatar, '/assets/img/avata.jpg')} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                    }}
                  />
                </div>
                {video.channel_is_verified && (
                  <div 
                    className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-[#0f0f0f] flex items-center justify-center shadow-lg"
                    title="Kênh đã xác minh"
                  >
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate group-hover/channel:text-red-500 transition-colors flex items-center gap-1">
                  <span>{video.channel_name}</span>
                  {video.channel_is_verified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black text-white" title="Kênh đã xác minh">✓</span>
                  )}
                </p>
                <p className="text-white/50 text-xs">{subCount?.toLocaleString('vi-VN')} người đăng ký</p>
              </div>
            </Link>
            <button 
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition ml-2 ${isFollowed ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-white/90'}`}
            >
              {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap py-1 overflow-visible">
            <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
              <button 
                onClick={handleToggleLike}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-r border-white/10 ${isLiked ? 'text-red-500' : 'text-white hover:bg-white/10'}`}
              >
                <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                <span>{likesCount?.toLocaleString('vi-VN')}</span>
              </button>
              <button 
                onClick={handleToggleDislike}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${isDisliked ? 'text-red-500' : 'text-white/60 hover:bg-white/10'}`}
              >
                <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
                {dislikesCount > 0 && <span>{dislikesCount}</span>}
              </button>
            </div>
            
            <button 
              onClick={handleToggleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${isSaved ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
              <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
            </button>
            
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium transition"
            >
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition active:scale-95"
              >
                <MoreHorizontal size={18} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl py-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isOwner ? (
                    <Link
                      href={`/studio?tab=videos&search=${encodeURIComponent(video.title)}`}
                      onClick={() => {
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-white/5 hover:text-red-400 flex items-center gap-2 transition font-medium"
                    >
                      <Trash2 size={16} />
                      <span>Xóa video</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (ensureUserLoggedIn('Donate ủng hộ')) {
                            setIsDonateModalOpen(true);
                          }
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-white/5 hover:text-amber-300 flex items-center gap-2 transition font-medium"
                      >
                        <Heart size={16} className="fill-amber-400/20" />
                        <span>Donate ủng hộ</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (ensureUserLoggedIn('Báo cáo video')) {
                            setIsReportModalOpen(true);
                          }
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-2 transition font-medium"
                      >
                        <Flag size={16} />
                        <span>Báo cáo video</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
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
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-white/5 relative ${
                    (comment.is_premium && comment.premium_show_avatar_aura !== false) 
                      ? 'p-[2px] bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                      : 'overflow-hidden'
                  }`}>
                    <img 
                      src={getUploadUrl(comment.avatar, '/assets/img/avata.jpg')} 
                      className={`w-full h-full object-cover rounded-full ${
                        (comment.is_premium && comment.premium_show_avatar_aura !== false) 
                          ? 'border border-zinc-900' 
                          : comment.is_channel 
                            ? 'ring-2 ring-red-500/50' 
                            : ''
                      }`} 
                      alt="" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                      }}
                    />
                    {(comment.is_premium && comment.premium_show_avatar_aura !== false) && (
                      <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-yellow-500 text-zinc-950 text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black shadow border border-zinc-900 select-none">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold flex items-center gap-1 ${
                        (comment.is_premium && comment.premium_show_comment_aura !== false) 
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm font-black' 
                          : comment.is_channel 
                            ? 'text-red-500' 
                            : 'text-white'
                      }`}>
                        @{comment.username}
                        {comment.is_channel && <ShieldCheck size={14} className="text-red-500" />}
                        {(comment.is_premium && comment.premium_show_comment_aura !== false) && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-[0_0_6px_rgba(245,158,11,0.3)] select-none">
                            ★ PREMIUM
                          </span>
                        )}
                      </span>
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
                                  <div className={`w-8 h-8 rounded-full flex-shrink-0 bg-white/5 relative ${
                                    (reply.is_premium && reply.premium_show_avatar_aura !== false) 
                                      ? 'p-[1.5px] bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-600 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                                      : 'overflow-hidden'
                                  }`}>
                                    <img 
                                      src={getUploadUrl(reply.avatar, '/assets/img/avata.jpg')} 
                                      className={`w-full h-full object-cover rounded-full ${
                                        (reply.is_premium && reply.premium_show_avatar_aura !== false) 
                                          ? 'border border-zinc-900' 
                                          : reply.is_channel 
                                            ? 'ring-1 ring-red-500/30' 
                                            : ''
                                      }`} 
                                      alt=""
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/img/avata.jpg';
                                      }}
                                    />
                                    {(reply.is_premium && reply.premium_show_avatar_aura !== false) && (
                                      <span className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-500 to-yellow-500 text-zinc-950 text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black shadow border border-zinc-900 select-none">
                                        ★
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs font-bold flex items-center gap-1 ${
                                        (reply.is_premium && reply.premium_show_comment_aura !== false) 
                                          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm font-black' 
                                          : reply.is_channel 
                                            ? 'text-red-500' 
                                            : 'text-white'
                                      }`}>
                                        @{reply.username}
                                        {reply.is_channel && <ShieldCheck size={12} className="text-red-500" />}
                                        {(reply.is_premium && reply.premium_show_comment_aura !== false) && (
                                          <span className="ml-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-[0_0_5px_rgba(245,158,11,0.3)] select-none">
                                            ★ PREMIUM
                                          </span>
                                        )}
                                      </span>
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
        {watchBanners && watchBanners.length > 0 && (
          <div className="relative aspect-[2/1] rounded-xl overflow-hidden border border-white/10 shadow-2xl group bg-black/20 dark-keep">
            {watchBanners.map((banner, idx) => {
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
                <a 
                  key={idx}
                  href={banner.url || "#"}
                  onClick={(e) => {
                    if (banner.slotId) {
                      trackAdEvent(banner.slotId, 'click');
                    }
                    if (!banner.url || banner.url.trim() === "" || banner.url === "#" || banner.url === "/") {
                      e.preventDefault();
                    }
                  }}
                  target={banner.url && banner.url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`absolute inset-0 ease-in-out block ${positionClass} ${transitionClass}`}
                >
                  <img 
                    src={getUploadUrl(banner.image)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={banner.alt} 
                  />
                  {/* Dynamic Gradient Overlay */}
                  <div className={`absolute inset-0 ${banner.overlayGradient} transition-all duration-300`} />
                  
                  {/* Brand Text Info Overlay */}
                  <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col text-left">
                    <span className={`${banner.badgeBg} text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider self-start mb-1.5 shadow-sm animate-pulse`}>
                      {banner.sponsor}
                    </span>
                    <h3 className={`text-xs font-black text-white uppercase tracking-wider transition-colors leading-tight ${banner.titleHoverColor}`}>
                      {banner.title}
                    </h3>
                    <p className="text-[9px] text-zinc-300 font-semibold line-clamp-1 mt-0.5 drop-shadow">
                      {banner.description}
                    </p>
                  </div>
                </a>
              );
            })}

            {/* Carousel Indicators */}
            {watchBanners.length > 1 && (
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
            )}
          </div>
        )}

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
                  <Link href={`/watch/${item.video_id}`} onClick={(e) => handleRelatedVideoClick(e, item)} className="flex gap-2 w-full">
                    <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                      <img 
                        src={getUploadUrl(item.thumbnail_url)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        alt=""
                      />
                      
                      {item.is_free === false && !checkHasPermission(item) && (
                        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-black z-10 shadow-lg flex items-center gap-1 animate-pulse">
                          <div className="w-1 h-1 bg-white rounded-full" />
                          TRẢ PHÍ
                        </div>
                      )}

                      <div className="absolute bottom-1 right-1 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold z-10 border border-white/10" style={{ color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
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
          
          <div className="relative bg-[#1f1f1f] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-xl font-black text-white">Lưu video vào...</h3>
              <button onClick={() => setIsPlaylistModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/60 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {userPlaylists.length > 0 ? (
                userPlaylists.map((pl) => (
                  <button 
                    key={pl.playlist_id}
                    onClick={() => handleToggleDraftPlaylist(pl.playlist_id)}
                    className="flex items-center justify-between w-full p-3 hover:bg-white/5 rounded-xl transition text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${draftPlaylists.includes(pl.playlist_id) ? 'bg-blue-600 border-blue-600' : 'border-white/20 group-hover:border-white/40'}`}>
                        {draftPlaylists.includes(pl.playlist_id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-white text-base font-medium">{pl.playlist_name}</span>
                    </div>

                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{pl.is_private ? 'Riêng tư' : 'Công khai'}</span>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-white/30 text-sm">
                  Bạn chưa có danh sách phát nào.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/5 bg-black/20">
              <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3 mb-6">
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Tên danh sách mới..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition"
                    maxLength={50}
                    />
                    <button 
                    type="submit"
                    disabled={!newPlaylistName.trim() || isCreatingPlaylist}
                    className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition disabled:opacity-50"
                    >
                    {isCreatingPlaylist ? '...' : 'Tạo'}
                    </button>
                </div>
              </form>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                    onClick={() => setIsPlaylistModalOpen(false)}
                    className="px-6 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition"
                >
                    Hủy
                </button>
                <button 
                    onClick={handleSavePlaylists}
                    disabled={isSavingPlaylists}
                    className="px-6 py-2.5 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                    {isSavingPlaylists ? 'Đang lưu...' : 'Xong'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Glassmorphic Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Báo cáo vi phạm</h3>
                <p className="text-xs text-white/50">Chúng tôi sẽ xem xét báo cáo này trong vòng 24 giờ.</p>
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 block">Chọn lý do báo cáo:</label>
                {[
                  'Spam hoặc gây hiểu lầm',
                  'Nội dung khiêu dâm',
                  'Nội dung bạo lực hoặc phản cảm',
                  'Quấy rối hoặc bắt nạt',
                  'Vi phạm bản quyền',
                  'Lý do khác'
                ].map((reason) => (
                  <label 
                    key={reason}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      reportReason === reason 
                        ? 'bg-red-500/10 border-red-500/30 text-white' 
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm font-medium">{reason}</span>
                    <input 
                      type="radio" 
                      name="reportReason" 
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {reportReason === 'Lý do khác' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-semibold text-white/60 block">Mô tả lý do chi tiết:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Mô tả lý do bạn báo cáo video này..."
                    value={customReportReason}
                    onChange={(e) => setCustomReportReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-red-500/40 transition resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {isSubmittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Glassmorphic Donate Modal */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsDonateModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Heart size={20} className="fill-amber-500/20" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Donate ủng hộ kênh</h3>
                <p className="text-xs text-white/50">Gửi tặng coins ủng hộ cho chủ kênh: <span className="text-amber-400 font-bold">{video.channel_name}</span></p>
              </div>
            </div>

            <form onSubmit={handleDonateSubmit} className="space-y-5">
              {/* Wallet Balance Display */}
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/60">Số dư ví của bạn:</span>
                <span className="text-green-400 font-extrabold text-sm">{((currentUserData?.balance || user?.balance || 0) * 1000).toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60 block text-left">Chọn số tiền quyên góp:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonateAmount(amt)}
                      className={`py-2 rounded-xl border text-xs font-black transition-all ${
                        donateAmount === amt 
                          ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                          : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {amt >= 1000 ? `${amt / 1000}k` : amt}đ
                    </button>
                  ))}
                </div>
                
                {/* Custom Amount Input */}
                <div className="mt-2 relative">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="Nhập số tiền khác..."
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-8 text-white outline-none focus:border-amber-500 transition text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-[10px] font-bold">VNĐ</span>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-white/60 block">Lời nhắn gửi kèm:</label>
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="Nhập lời chúc hoặc lời nhắn đến chủ kênh..."
                  value={donateMessage}
                  onChange={(e) => setDonateMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-xs outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsDonateModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingDonate || (currentUserData?.balance || user?.balance || 0) < (donateAmount / 1000)}
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 hover:opacity-90 transition disabled:opacity-30 shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                >
                  {isSubmittingDonate ? 'Đang gửi...' : 'Xác nhận quyên góp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Glassmorphic Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Share2 size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Chia sẻ video</h3>
                <p className="text-xs text-white/50">Chia sẻ video này đến mọi người.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Facebook</span>
              </a>

              <a
                href={`https://zalo.me/share?to=&utm_source=zaloshare&utm_medium=zalo&utm_campaign=share&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition font-black text-xs">
                  Zalo
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Zalo</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(video.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Twitter / X</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(video.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.24-.213-.054-.33-.373-.12l-6.87 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.536-.2 1.006.12.834.938z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition">Telegram</span>
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 block text-left">Hoặc sao chép liên kết:</label>
              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 pl-4">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="bg-transparent flex-1 text-xs text-white/80 outline-none select-all min-w-0"
                />
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      setToast({ message: 'Sao chép liên kết thành công!', type: 'success' });
                      setIsShareModalOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/10 active:scale-95 flex-shrink-0"
                >
                  <Copy size={14} />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>

            {/* Native Share Trigger if supported */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: video.title,
                        text: `Xem video "${video.title}" trên MyTube`,
                        url: window.location.href
                      });
                      setIsShareModalOpen(false);
                    } catch (err) {
                      console.log('Share canceled or failed:', err);
                    }
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-2xl transition border border-white/5 hover:border-white/10 text-center"
                >
                  Chia sẻ qua ứng dụng khác...
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Micro Floating Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {toast.type === 'success' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {toast.type === 'success' ? 'Thông báo' : 'Có lỗi xảy ra'}
            </p>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

