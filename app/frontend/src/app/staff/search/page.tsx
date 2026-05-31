"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, Users, Video, DollarSign, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface SearchResult {
    type: 'user' | 'video' | 'withdrawal' | string;
    id: string;
    title: string;
    subtitle?: string;
    meta?: string;
    url?: string;
}

export default function StaffSearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState(query);

    const fetchResults = useCallback(async (q: string) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/smart-search?q=${encodeURIComponent(q)}&role=staff`);
            if (!res.ok) throw new Error('Không thể kết nối máy chủ');
            const data = await res.json();
            setResults(Array.isArray(data.results) ? data.results : []);
        } catch (err: any) {
            setError(err.message || 'Lỗi không xác định');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (query) fetchResults(query);
    }, [query, fetchResults]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            router.push(`/staff/search?q=${encodeURIComponent(inputValue.trim())}`);
        }
    };

    const typeIcon = (type: string) => {
        switch (type) {
            case 'user': return <Users size={16} className="text-blue-400" />;
            case 'video': return <Video size={16} className="text-red-400" />;
            case 'withdrawal': return <DollarSign size={16} className="text-green-400" />;
            default: return <Search size={16} className="text-zinc-400" />;
        }
    };

    const typeLabel = (type: string) => {
        switch (type) {
            case 'user': return 'Người dùng';
            case 'video': return 'Video';
            case 'withdrawal': return 'Rút tiền';
            default: return type;
        }
    };

    const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
        const key = result.type || 'other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-rose-50/20 dark:bg-[#020202] text-zinc-800 dark:text-zinc-100 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 h-16 border-b border-rose-100 dark:border-white/5 flex items-center gap-4 px-8 bg-white/90 dark:bg-black/80 backdrop-blur-md">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-white/5 transition-colors text-zinc-500 dark:text-white/40"
                >
                    <ArrowLeft size={18} />
                </button>

                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3 bg-white dark:bg-white/[0.03] border border-rose-200 dark:border-white/10 rounded-xl px-4 py-2 max-w-2xl">
                    <Search size={16} className="text-zinc-400 dark:text-white/30 flex-shrink-0" />
                    <input
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        name="q"
                        type="text"
                        placeholder="Tìm kiếm thông minh AI..."
                        className="flex-1 bg-transparent text-sm text-zinc-700 dark:text-white/70 placeholder:text-zinc-400 dark:placeholder:text-white/25 outline-none"
                    />
                    {isLoading && <Loader2 size={15} className="animate-spin text-red-500 flex-shrink-0" />}
                </form>

                <span className="text-xs text-zinc-400 dark:text-white/25 font-medium hidden md:block">Staff Panel</span>
            </header>

            {/* Body */}
            <main className="max-w-4xl mx-auto px-8 py-10">
                {query && (
                    <p className="text-sm text-zinc-500 dark:text-white/30 mb-8">
                        {isLoading ? 'Đang tìm kiếm...' : `${results.length} kết quả cho`}&nbsp;
                        <span className="font-semibold text-zinc-800 dark:text-white">"{query}"</span>
                    </p>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm mb-8">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-10">
                        {Object.entries(groupedResults).map(([type, items]) => (
                            <section key={type}>
                                <div className="flex items-center gap-2 mb-4">
                                    {typeIcon(type)}
                                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-white/30">
                                        {typeLabel(type)} <span className="text-zinc-400 dark:text-white/20">({items.length})</span>
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => item.url && router.push(item.url)}
                                            className={`flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-rose-100 dark:border-white/5 rounded-xl transition-all ${item.url ? 'cursor-pointer hover:border-red-500/30 hover:shadow-sm' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {typeIcon(type)}
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-800 dark:text-white">{item.title}</p>
                                                    {item.subtitle && <p className="text-xs text-zinc-400 dark:text-white/30">{item.subtitle}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {item.meta && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/25 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                                        {item.meta}
                                                    </span>
                                                )}
                                                {item.url && <ExternalLink size={14} className="text-zinc-400 dark:text-white/20" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {!isLoading && !error && query && results.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Search size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-zinc-400 dark:text-white/30 text-sm">Thử tìm với từ khóa khác hoặc kiểm tra lại chính tả.</p>
                    </div>
                )}

                {!query && (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Search size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-2">Tìm kiếm thông minh AI</h3>
                        <p className="text-zinc-400 dark:text-white/30 text-sm">Nhập từ khóa vào thanh tìm kiếm phía trên để bắt đầu.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
