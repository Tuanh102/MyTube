"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const [categoryId, setCategoryId] = useState('12');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setCategoryId(video.category_id?.toString() || '12');
      setPreviewUrl(video.thumbnail_url || '');
      setIsFree(video.is_free !== false);
      setPrice(video.price || 0);
    }
  }, [video]);

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
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
      formData.append('is_free', isFree.toString());
      formData.append('price', price.toString());
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const response = await fetch(`/api/videos/${video._id}`, {
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
      <div className="w-full max-w-4xl bg-[#282828] rounded-2xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                   <div className="absolute z-[120] left-0 bottom-full mb-2 w-[290px] sm:w-[400px] md:w-[480px] max-h-[250px] overflow-y-auto bg-[#282828] border border-white/10 rounded-xl shadow-[0_-15px_40px_rgba(0,0,0,0.5)] p-2 grid grid-cols-3 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200 custom-scrollbar">
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

              {/* Chế độ TMĐT */}
              <div className="pt-2 space-y-4">
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
