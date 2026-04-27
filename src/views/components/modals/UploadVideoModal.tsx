"use client";

import React, { useState, useEffect } from 'react';
import { X, Upload, FileVideo, Image as ImageIcon } from 'lucide-react';

interface Channel {
  channel_id: number;
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
  const [categoryId, setCategoryId] = useState('1');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [autoThumbnail, setAutoThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [duration, setDuration] = useState(0);

  const getVideoMetadata = (file: File): Promise<{ thumbnail: File, duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const videoDuration = Math.floor(video.duration);
        // Seek to 1 second to get a good frame
        video.currentTime = Math.min(video.duration, 1);
        
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
      setChannelId(channels[0].channel_id.toString());
    }
  }, [channels]);

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
      const uploadDirectToCloudinary = async (file: File, resourceType: 'video' | 'image'): Promise<string> => {
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
              resolve(response.secure_url);
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
      const videoUrl = await uploadDirectToCloudinary(videoFile, 'video');

      // 3. Upload thumbnail (if any)
      let thumbnailUrl = '';
      const finalThumbnail = thumbnailFile || autoThumbnail;
      if (finalThumbnail) {
        thumbnailUrl = await uploadDirectToCloudinary(finalThumbnail, 'image');
      }

      // 4. Save metadata to our DB
      const saveFormData = new FormData();
      saveFormData.append('title', title);
      saveFormData.append('description', description);
      saveFormData.append('channelId', channelId);
      saveFormData.append('categoryId', categoryId);
      saveFormData.append('videoUrl', videoUrl);
      saveFormData.append('thumbnailUrl', thumbnailUrl);
      saveFormData.append('duration', duration.toString());

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Tiêu đề *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition"
                  placeholder="Tiêu đề video"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Mô tả</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition h-32 resize-none"
                  placeholder="Mô tả video của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Chọn kênh đăng *</label>
                <select 
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition"
                  required
                >
                  {channels.map(ch => (
                    <option key={ch.channel_id} value={ch.channel_id}>{ch.channel_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Video *</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="w-full h-32 bg-[#121212] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-red-500/50 transition">
                    {videoFile ? (
                      <>
                        <FileVideo size={32} className="text-red-500" />
                        <span className="text-xs text-white px-4 text-center truncate w-full">{videoFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-white/20" />
                        <span className="text-xs text-white/40">Chọn hoặc kéo thả video</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Thumbnail</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-32 bg-[#121212] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-red-500/50 transition overflow-hidden">
                    {previewUrl ? (
                       <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-white/20" />
                        <span className="text-xs text-white/40">Chọn ảnh thu nhỏ</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Danh mục</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition"
                >
                  <option value="1">Shorts</option>
                  <option value="2">Âm nhạc</option>
                  <option value="3">Trò chơi</option>
                  <option value="4">Tin tức</option>
                  <option value="5">Hoạt hình</option>
                  <option value="6">Giáo dục</option>
                  <option value="7">Thử thách</option>
                  <option value="8">Chơi khăm</option>
                  <option value="9">Hài hước</option>
                  <option value="10">Review</option>
                  <option value="11">Vlog</option>
                  <option value="12">Khác</option>

                </select>
              </div>
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
              disabled={loading || isGeneratingThumbnail}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-red-800 transition"
            >
              {loading ? `Đang xử lý ${progress}%` : (isGeneratingThumbnail ? 'Đang xử lý video...' : 'Đăng video')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

