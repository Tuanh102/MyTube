import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <div className="bg-white/5 p-6 rounded-full mb-6">
        <FileQuestion size={64} className="text-white/20" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">404 - Trang không tồn tại</h2>
      <p className="text-white/50 mb-8 max-w-md mx-auto">
        Rất tiếc, trang bạn đang tìm kiếm đã bị xóa hoặc chưa bao giờ tồn tại. Hãy quay lại trang chủ để khám phá thêm nhiều video thú vị nhé!
      </p>
      <Link 
        href="/" 
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-red-600/20"
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}
