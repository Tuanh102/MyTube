"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Loader2 } from 'lucide-react';

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: any;
  onSuccess: () => void;
}

export default function EditVideoModal({ isOpen, onClose, video, onSuccess }: EditVideoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setCategoryId(video.category_id?.toString() || '1');
      setPreviewUrl(video.thumbnail_url ? `/uploads/${video.thumbnail_url}` : '');
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const response = await fetch(`/api/videos/${video.video_id}`, {
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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#282828] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Chỉnh sửa video
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái: Thông tin video */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition"
                  placeholder="Nhập tiêu đề video"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Mô tả</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-red-500 transition h-48 resize-none"
                  placeholder="Mô tả video của bạn"
                />
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

            {/* Cột phải: Thumbnail và Preview */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Ảnh thu nhỏ (Thumbnail)</label>
                <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black relative group mb-4">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition active:scale-95">
                      Thay đổi ảnh
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-white/40 italic">
                  * Chọn một ảnh thu nhỏ bắt mắt để tăng tỷ lệ nhấp vào video.
                </p>
              </div>

              <div className="flex-1 flex items-end pt-4 md:pt-12">
                <div className="flex gap-3 w-full">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-2 py-3 px-8 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-red-800 transition flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
