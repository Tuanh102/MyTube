"use client";

import React from 'react';
import Link from 'next/link';
import { Flag, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getUploadUrl } from '@/lib/utils';

interface ReportPageProps {
  reports: any[];
}

export default function ReportPage({ reports }: ReportPageProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse">
            <AlertTriangle size={12} />
            <span>Chờ xử lý</span>
          </span>
        );
      case 'RESOLVED_DELETED':
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <CheckCircle size={12} />
            <span>Thành công</span>
          </span>
        );
      case 'RESOLVED_DISMISSED':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5">
            <XCircle size={12} />
            <span>Thất bại</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 min-h-[70vh] animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-4 bg-red-500/20 rounded-3xl relative z-10 text-red-500">
              <Flag size={32} fill="currentColor" />
            </div>
            <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full"></div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Lịch sử báo cáo</h1>
            <p className="text-sm text-white/40 font-medium tracking-wide uppercase">{reports.length} báo cáo của bạn</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {reports.length > 0 ? (
          reports.map((report) => {
            const isDeleted = report.status === 'RESOLVED_DELETED';
            const itemContent = (
              <div className={`flex flex-col sm:flex-row gap-5 flex-1 min-w-0 ${isDeleted ? 'opacity-80' : ''}`}>
                {/* Video Thumbnail */}
                <div className="relative w-full sm:w-52 aspect-video rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-white/5 shadow-md">
                  {report.videoThumbnail ? (
                    <img 
                      src={getUploadUrl(report.videoThumbnail)} 
                      className={`w-full h-full object-cover transition duration-700 ${!isDeleted ? 'group-hover:scale-110' : ''}`}
                      alt="" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 bg-zinc-950">
                      <Flag size={24} />
                    </div>
                  )}
                  {isDeleted && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[11px] font-black text-red-400 bg-red-950/80 border border-red-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                        Đã gỡ bỏ
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-base font-bold text-white mb-2 line-clamp-2 transition duration-300 ${!isDeleted ? 'group-hover:text-red-400' : 'text-zinc-400'}`}>
                      {report.videoTitle || 'Video không tên hoặc đã bị xóa'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-white/60 font-semibold bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl">
                        Lý do: <span className="text-red-400">{report.reason}</span>
                      </span>
                      <span className="text-white/30 font-bold">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-white/50 bg-white/5 px-3 py-2 rounded-2xl border border-white/5 max-w-lg">
                    {isDeleted ? (
                      <p className="text-emerald-400/90 font-medium">✓ Cảm ơn bạn. Video này đã bị xóa do vi phạm tiêu chuẩn cộng đồng.</p>
                    ) : report.status === 'RESOLVED_DISMISSED' ? (
                      <p className="text-white/40 font-medium">✗ Báo cáo đã đóng. Đội ngũ kiểm duyệt không tìm thấy vi phạm trên video này.</p>
                    ) : (
                      <p className="text-amber-400/90 font-medium">⚡ Đang chờ nhân viên kiểm duyệt kiểm tra và đối chiếu nội dung video.</p>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <div 
                key={report._id} 
                className="group flex items-start justify-between p-4 bg-zinc-950/40 hover:bg-zinc-950/70 border border-white/5 rounded-3xl transition relative overflow-hidden"
              >
                {!isDeleted && report.videoId ? (
                  <Link href={`/watch/${report.videoId}`} className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                    {itemContent}
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                    {itemContent}
                  </div>
                )}

                <div className="flex-shrink-0 ml-4 self-center">
                  {getStatusBadge(report.status)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-zinc-950/40 rounded-[40px] border border-white/5">
            <div className="relative mb-8 text-white/10">
              <Flag size={100} />
            </div>
            <p className="text-2xl font-black text-white/40">Chưa báo cáo video nào</p>
            <p className="text-sm text-white/20 mt-2">Báo cáo của bạn sẽ hiển thị tại đây để theo dõi tiến trình duyệt.</p>
            <Link href="/" className="mt-8 px-10 py-4 bg-white text-black rounded-full font-black hover:bg-white/90 transition active:scale-95 shadow-2xl">
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
