"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileVideo, Image as ImageIcon, RotateCw } from 'lucide-react';

interface Channel {
  _id: string;
  channel_name: string;
}

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
}

export default function UploadVideoModal({ isOpen, onClose, channels }: UploadVideoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channelId, setChannelId] = useState('');
  const [categoryId, setCategoryId] = useState('12');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [autoThumbnail, setAutoThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);

  const getVideoMetadata = (file: File, seekTime: number = 1): Promise<{ thumbnail: File, duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        const videoDuration = Math.floor(video.duration);
        // Seek to the specified time or 1 second to get a good frame
        video.currentTime = Math.min(video.duration, seekTime);
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnail = new File([blob], 'auto-thumb.jpg', { type: 'image/jpeg' });
              resolve({ thumbnail, duration: videoDuration });
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
            URL.revokeObjectURL(video.src);
          }, 'image/jpeg', 0.8);
        };
      };

      video.onerror = (e) => reject(e);
    });
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      setIsGeneratingThumbnail(true);
      try {
        const { thumbnail, duration } = await getVideoMetadata(file);
        setAutoThumbnail(thumbnail);
        setDuration(duration);
        if (!thumbnailFile) {
          setPreviewUrl(URL.createObjectURL(thumbnail));
        }
      } catch (err) {
        console.error('Lỗi khi lấy metadata video:', err);
      } finally {
        setIsGeneratingThumbnail(false);
      }
    }
  };

  const refreshThumbnail = async () => {
    if (!videoFile || isGeneratingThumbnail) return;
    
    setIsGeneratingThumbnail(true);
    // Safety timeout to prevent getting stuck
    const timeout = setTimeout(() => setIsGeneratingThumbnail(false), 5000);

    try {
      // Pick a random time within the video duration
      const randomTime = Math.random() * (duration || 1);
      const { thumbnail } = await getVideoMetadata(videoFile, randomTime);
      setAutoThumbnail(thumbnail);
      if (!thumbnailFile) {
        setPreviewUrl(URL.createObjectURL(thumbnail));
      }
    } catch (err) {
      console.error('Lỗi khi đổi thumbnail:', err);
    } finally {
      clearTimeout(timeout);
      setIsGeneratingThumbnail(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else if (autoThumbnail) {
      setPreviewUrl(URL.createObjectURL(autoThumbnail));
    } else {
      setPreviewUrl('');
    }
  };

  useEffect(() => {
    if (channels.length > 0 && !channelId) {
      setChannelId(channels[0]._id.toString());
    }
  }, [channels]);

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);
  
  const categoryRef = useRef<HTMLDivElement>(null);
  const channelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
        setIsChannelMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const categoriesList = [
    { id: '2', label: 'Âm nhạc' },
    { id: '3', label: 'Trò chơi' },
    { id: '4', label: 'Tin tức' },
    { id: '5', label: 'Hoạt hình' },
    { id: '6', label: 'Giáo dục' },
    { id: '7', label: 'Thử thách' },
    { id: '8', label: 'Chơi khăm' },
    { id: '9', label: 'Hài hước' },
    { id: '10', label: 'Review' },
    { id: '11', label: 'Vlog' },
    { id: '13', label: 'Công nghệ' },
    { id: '14', label: 'Động vật' },
    { id: '15', label: 'Khoa học' },
    { id: '16', label: 'Thiên nhiên' },
    { id: '17', label: 'Du lịch' },
    { id: '18', label: 'Đất nước' },
    { id: '19', label: 'Ẩm thực' },
    { id: '20', label: 'Đời sống' },
    { id: '21', label: 'Thể thao' },
    { id: '22', label: 'Phim ảnh' },
    { id: '23', label: 'Thời trang' },
    { id: '24', label: 'Kinh doanh' },
    { id: '25', label: 'Sức khỏe' },
    { id: '26', label: 'Nghệ thuật' },
    { id: '27', label: 'Xe cộ' },
    { id: '28', label: 'Gia đình' },
    { id: '29', label: 'Lịch sử' },
    { id: '30', label: 'Giải trí' },
    { id: '31', label: 'Kỹ năng sống' },
    { id: '12', label: 'Khác' },
  ];

  const currentCategoryLabel = categoriesList.find(c => c.id === categoryId)?.label || 'Khác';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Vui lòng chọn video');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    try {
      // 1. Helper function to upload directly to Cloudinary with real progress
      const uploadDirectToCloudinary = async (file: File, resourceType: 'video' | 'image'): Promise<{url: string, public_id: string}> => {
        // A. Get signature from our server
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = 'mytube/videos';
        const paramsToSign = { timestamp, folder };
        
        const signRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paramsToSign })
        });
        const { signature, apiKey, cloudName } = await signRes.json();

        // B. Perform upload using XHR for progress tracking
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              // Only update overall progress for video, or weight it
              if (resourceType === 'video') setProgress(percent);
            }
          };

          xhr.onload = () => {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
              resolve({ url: response.secure_url, public_id: response.public_id });
            } else {
              console.error('Cloudinary Error:', response);
              reject(new Error(response.error?.message || 'Tải lên Cloudinary thất bại'));
            }
          };


          xhr.onerror = () => reject(new Error('Lỗi kết nối khi tải lên'));

          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp.toString());
          formData.append('signature', signature);
          formData.append('folder', folder);

          xhr.send(formData);
        });
      };

      // 2. Upload video
      const videoResult = await uploadDirectToCloudinary(videoFile, 'video');

      // 3. Upload thumbnail (if any)
      let thumbnailResult = { url: '', public_id: '' };
      const finalThumbnail = thumbnailFile || autoThumbnail;
      if (finalThumbnail) {
        thumbnailResult = await uploadDirectToCloudinary(finalThumbnail, 'image');
      }

      // 4. Save metadata to our DB
      const saveFormData = new FormData();
      saveFormData.append('title', title);
      saveFormData.append('description', description);
      saveFormData.append('channelId', channelId);
      saveFormData.append('categoryId', categoryId);
      saveFormData.append('videoUrl', videoResult.url);
      saveFormData.append('videoPublicId', videoResult.public_id);
      saveFormData.append('thumbnailUrl', thumbnailResult.url);
      saveFormData.append('thumbnailPublicId', thumbnailResult.public_id);
      saveFormData.append('duration', duration.toString());
      saveFormData.append('is_free', isFree.toString());
      saveFormData.append('price', price.toString());

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: saveFormData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Đã có lỗi xảy ra khi lưu video');

      setProgress(100);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#282828] rounded-2xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload size={24} className="text-red-500" />
            Tải video lên (Tối ưu tốc độ)
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* HÀNG 1: Tiêu đề & Video */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/60">Tiêu đề *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition"
                placeholder="Tiêu đề video"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/60">Video *</label>
              <div className="flex items-center gap-3 bg-[#121212] border border-white/10 rounded-lg p-2.5 group hover:border-red-500/50 transition relative h-[46px]">
                <FileVideo size={20} className={videoFile ? "text-red-500" : "text-white/20"} />
                <div className="flex-1 min-w-0">
                  {videoFile ? (
                    <p className="text-[10px] text-white truncate font-mono">
                      {URL.createObjectURL(videoFile)}
                    </p>
                  ) : (
                    <p className="text-sm text-white/40 italic">Chưa có video</p>
                  )}
                </div>
                <label className="shrink-0 bg-white/5 hover:bg-white/10 text-white text-[10px] px-2 py-1 rounded-md cursor-pointer transition border border-white/10">
                  Chọn
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" required />
                </label>
              </div>
            </div>

            {/* HÀNG 2: Mô tả & Thumbnail */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/60">Mô tả</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition h-[150px] resize-none"
                placeholder="Mô tả video của bạn"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-white/60">Thumbnail</label>
                {videoFile && (
                  <button type="button" onClick={refreshThumbnail} disabled={isGeneratingThumbnail} className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 transition disabled:opacity-50">
                    <RotateCw size={10} className={isGeneratingThumbnail ? 'animate-spin' : ''} />
                    Đổi ảnh
                  </button>
                )}
              </div>
              <div className="relative group cursor-pointer h-[150px]">
                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full h-full bg-[#121212] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-red-500/50 transition overflow-hidden">
                  {previewUrl ? (
                     <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-white/20" />
                      <span className="text-xs text-white/40">Chọn ảnh</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* HÀNG 3: Kênh & Danh mục */}
            <div className="space-y-1 relative" ref={channelDropdownRef}>
              <label className="block text-sm font-medium text-white/60">Chọn kênh đăng *</label>
              <button 
                type="button"
                onClick={() => setIsChannelMenuOpen(!isChannelMenuOpen)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white text-left flex justify-between items-center hover:border-red-500/50 transition"
              >
                {channels.find(ch => ch._id === channelId)?.channel_name || 'Chọn kênh'}
                <svg className={`w-4 h-4 transition ${isChannelMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {isChannelMenuOpen && (
                <div className="absolute z-[120] left-0 bottom-full mb-2 w-full max-h-[200px] overflow-y-auto bg-[#282828] border border-white/10 rounded-xl shadow-[0_-15px_40px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200 custom-scrollbar">
                  {channels.map((ch) => (
                    <button
                      key={ch._id}
                      type="button"
                      onClick={() => {
                        setChannelId(ch._id);
                        setIsChannelMenuOpen(false);
                      }}
                      className={`w-full py-2 px-3 rounded-lg text-xs text-left truncate transition ${
                        channelId === ch._id 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {ch.channel_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1 relative" ref={categoryRef}>
              <label className="block text-sm font-medium text-white/60">Danh mục</label>
              <button 
                type="button"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white text-left flex justify-between items-center hover:border-red-500/50 transition"
              >
                {currentCategoryLabel}
                <svg className={`w-4 h-4 transition ${isCategoryMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute z-[120] right-0 bottom-full mb-2 w-[290px] sm:w-[400px] md:w-[480px] max-h-[250px] overflow-y-auto bg-[#282828] border border-white/10 rounded-xl shadow-[0_-15px_40px_rgba(0,0,0,0.5)] p-2 grid grid-cols-3 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200 custom-scrollbar">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs text-left truncate transition ${
                        categoryId === cat.id 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                      title={cat.label}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* HÀNG 4: Chế độ TMĐT (Giá & Miễn phí) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/60">Chế độ xem *</label>
              <div className="flex items-center gap-4 bg-[#121212] border border-white/10 rounded-lg p-2.5">
                <button
                  type="button"
                  onClick={() => { setIsFree(true); setPrice(0); }}
                  className={`flex-1 py-1.5 rounded-md text-xs transition ${isFree ? 'bg-green-600 text-white' : 'text-white/40 hover:bg-white/5'}`}
                >
                  Miễn phí
                </button>
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`flex-1 py-1.5 rounded-md text-xs transition ${!isFree ? 'bg-red-600 text-white' : 'text-white/40 hover:bg-white/5'}`}
                >
                  Trả phí
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`block text-sm font-medium transition ${isFree ? 'text-white/20' : 'text-white/60'}`}>
                Giá bán (VNĐ)
              </label>
              <input 
                type="number" 
                value={price || ''}
                onChange={(e) => setPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                disabled={isFree}
                className={`w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition ${isFree ? 'opacity-30' : 'opacity-100'}`}
                placeholder="Ví dụ: 20000"
                min="0"
                required={!isFree}
              />
            </div>
          </div>

          {(loading || progress > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>{progress < 100 ? 'Đang tải lên Cloudinary...' : 'Đang lưu vào hệ thống...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#121212] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-red-800 transition"
            >
              {loading ? `Đang xử lý ${progress}%` : (isGeneratingThumbnail ? 'Đang chờ xử lý video...' : 'Đăng video')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

