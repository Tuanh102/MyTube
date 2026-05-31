"use client";

import React, { useState, useRef } from 'react';
import { X, Tv, Upload, Image as ImageIcon, Edit2, RotateCcw } from 'lucide-react';
import BannerPositioner, { BannerPositionerRef } from '../BannerPositioner';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateChannelModal({ isOpen, onClose, onSuccess }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bannerRef = useRef<BannerPositionerRef>(null);
  const avatarRef = useRef<BannerPositionerRef>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerPreviewUrl(URL.createObjectURL(file));
      setBannerFile(file); // Store initial file in case no cropping happens (though we will capture on submit)
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

      const response = await fetch('/api/channels', {
        method: 'POST',
        body: formData, // No Content-Type header needed for FormData
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#282828] rounded-2xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tv size={24} className="text-red-500" />
            Tạo kênh mới
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-6 mb-6">
            {/* Banner Upload */}
            <div className="relative group cursor-pointer w-full aspect-[4/1] bg-[#121212] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:border-red-500/50 transition">
              {bannerPreviewUrl ? (
                <div className="w-full h-full relative">
                  <BannerPositioner ref={bannerRef} image={bannerPreviewUrl} />
                  <button 
                    type="button"
                    onClick={() => {
                      setBannerPreviewUrl('');
                      setBannerFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg text-white shadow-lg transition z-20"
                    title="Xóa ảnh"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    ref={bannerInputRef}
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex flex-col items-center text-white/20 w-full h-full justify-center"
                  >
                    <ImageIcon size={32} />
                    <span className="text-xs mt-2 font-bold uppercase tracking-wider">Tải lên ảnh bìa</span>
                    <span className="text-[10px] mt-1">(Tối ưu: 2048 x 1152 px)</span>
                  </div>
                  <div className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-lg text-white shadow-lg opacity-0 group-hover:opacity-100 transition z-20">
                    <Upload size={14} />
                  </div>
                </>
              )}
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer w-32 h-32">
                {previewUrl ? (
                  <div className="w-full h-full relative">
                    <BannerPositioner ref={avatarRef} image={previewUrl} aspectRatio={1} circular={true} />
                    <button 
                      type="button"
                      onClick={() => {
                        setPreviewUrl('');
                        setAvatarFile(null);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-full text-white shadow-lg transition z-20"
                      title="Xóa ảnh"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      ref={avatarInputRef}
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div 
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-full h-full bg-[#121212] border-2 border-dashed border-white/10 rounded-full flex flex-col items-center justify-center overflow-hidden group-hover:border-red-500/50 transition shadow-2xl"
                    >
                      <div className="flex flex-col items-center text-white/20">
                        <Upload size={24} />
                        <span className="text-[10px] mt-1 text-center font-bold uppercase">Ảnh đại diện</span>
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 p-1.5 bg-red-600 rounded-full text-white shadow-lg group-hover:scale-110 transition z-20">
                      <ImageIcon size={14} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Tên kênh *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition"
              placeholder="Nhập tên kênh của bạn"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Mô tả</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition h-24 resize-none"
              placeholder="Giới thiệu về kênh của bạn"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white font-bold hover:bg-white/5 transition"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-red-800 transition"
            >
              {loading ? 'Đang tạo...' : 'Tạo kênh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
