"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Tv, Save, Loader2, Camera, User, Image as ImageIcon, Upload, Edit2, RotateCcw } from 'lucide-react';
import { getUploadUrl } from '@/lib/utils';
import BannerPositioner, { BannerPositionerRef } from '../BannerPositioner';

interface EditChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  channel: any;
}

export default function EditChannelModal({ isOpen, onClose, onSuccess, channel }: EditChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bannerRef = useRef<BannerPositionerRef>(null);
  const avatarRef = useRef<BannerPositionerRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (channel) {
      setName(channel.channel_name || '');
      setDescription(channel.description || '');
      setPreviewUrl(channel.avatar_url || '');
      setBannerPreviewUrl(channel.banner_url || '');
      setAvatarFile(null);
      setBannerFile(null);
    }
  }, [channel, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerPreviewUrl(URL.createObjectURL(file));
      setBannerFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (avatarRef.current && previewUrl) {
        const croppedBlob = await avatarRef.current.capture();
        if (croppedBlob) {
          formData.append('avatar', new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' }));
        } else if (avatarFile) {
          formData.append('avatar', avatarFile);
        }
      } else if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      // Capture current crop if interactive
      if (bannerRef.current && bannerPreviewUrl) {
        const croppedBlob = await bannerRef.current.capture();
        if (croppedBlob) {
          formData.append('banner', new File([croppedBlob], 'banner.jpg', { type: 'image/jpeg' }));
        } else if (bannerFile) {
          formData.append('banner', bannerFile);
        }
      } else if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const response = await fetch(`/api/channels/${channel._id}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Đã có lỗi xảy ra');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#282828] rounded-2xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tv size={24} className="text-red-500" />
            Tùy chỉnh kênh
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Banner & Avatar Section */}
          <div className="flex flex-col gap-6">
            {/* Banner Upload */}
            <div className="relative group cursor-pointer w-full aspect-[4/1] bg-[#121212] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:border-red-500/50 transition">
              {bannerPreviewUrl ? (
                <div className="w-full h-full relative">
                  <BannerPositioner 
                    ref={bannerRef} 
                    image={bannerPreviewUrl.startsWith('blob:') ? bannerPreviewUrl : getUploadUrl(bannerPreviewUrl)} 
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="p-1.5 bg-black/60 hover:bg-white/20 rounded-lg text-white shadow-lg transition z-20"
                      title="Thay đổi ảnh"
                    >
                      <Camera size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setBannerPreviewUrl('');
                        setBannerFile(null);
                      }}
                      className="p-1.5 bg-black/60 hover:bg-red-600 rounded-lg text-white shadow-lg transition z-20"
                      title="Xóa ảnh"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    ref={bannerInputRef}
                    onChange={handleBannerChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex flex-col items-center text-white/20 w-full h-full justify-center"
                  >
                    <ImageIcon size={32} />
                    <span className="text-xs mt-2 font-bold uppercase tracking-wider">Tải lên ảnh bìa</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition text-white"
                  >
                    <Camera size={32} />
                  </button>
                </>
              )}
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group w-32 h-32">
                {previewUrl && !previewUrl.includes('default') ? (
                  <div className="w-full h-full relative">
                    <BannerPositioner 
                      ref={avatarRef} 
                      image={previewUrl.startsWith('blob:') ? previewUrl : getUploadUrl(previewUrl, '/assets/img/avata.jpg')} 
                      aspectRatio={1} 
                      circular={true} 
                    />
                    <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-black/60 hover:bg-white/20 rounded-full text-white shadow-lg transition z-20"
                        title="Thay đổi ảnh"
                      >
                        <Camera size={12} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewUrl('');
                          setAvatarFile(null);
                        }}
                        className="p-1.5 bg-black/60 hover:bg-red-600 rounded-full text-white shadow-lg transition z-20"
                        title="Xóa ảnh"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full bg-[#121212] border-2 border-dashed border-white/10 rounded-full flex flex-col items-center justify-center overflow-hidden group-hover:border-red-500/50 transition shadow-2xl cursor-pointer"
                    >
                      <User size={64} className="text-white/20" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-full text-white"
                    >
                      <Camera size={32} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-white/40">Nhấp để thay đổi ảnh đại diện</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Tên kênh *</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition"
                placeholder="Nhập tên kênh"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Mô tả</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition h-32 resize-none"
                placeholder="Giới thiệu về kênh của bạn"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-red-800 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
