"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Tv, Save, Loader2, Camera, User } from 'lucide-react';

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
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (channel) {
      setName(channel.channel_name || '');
      setDescription(channel.description || '');
      setPreviewUrl(channel.avatar_url || '');
      setAvatarFile(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`/api/channels/${channel.channel_id}`, {
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
      <div className="w-full max-w-lg bg-[#282828] rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-300">
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

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 group-hover:border-red-500 transition duration-300">
                {previewUrl && !previewUrl.includes('default') ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Avatar preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User size={64} />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-full text-white"
              >
                <Camera size={32} />
              </button>
            </div>
            <p className="text-xs text-white/40">Nhấp để thay đổi ảnh đại diện</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
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
