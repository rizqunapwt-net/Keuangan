"use client";

import { useState } from 'react';
import {
    Search,
    Loader2,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    Hash,
    User,
    BookOpen,
    ArrowRight,
    ChevronRight
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface TrackingData {
    title: string;
    author: string;
    current_status: string;
    status_key: string;
    progress: number;
    last_update: string;
    history: Array<{
        date: string;
        activity: string;
    }>;
}

export default function TrackingPage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`https://nre.infiatin.cloud/api/v1/tracking?code=${code}`);
            if (response.data.status === 'success') {
                setTrackingData(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengambil data tracking');
            setTrackingData(null);
        } finally {
            setLoading(false);
        }
    };

    const stages = [
        { key: 'incoming', label: 'Diterima', icon: Package },
        { key: 'layouting', label: 'Layout', icon: Clock },
        { key: 'isbn_process', label: 'ISBN', icon: AlertCircle },
        { key: 'production', label: 'Produksi', icon: Clock },
        { key: 'published', label: 'Terbit', icon: CheckCircle2 },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-amber-100 flex items-center justify-center mx-auto mb-6">
                        <img src="/logo-icon.png" alt="Icon" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Lacak Naskah Anda 🚀</h1>
                    <p className="text-slate-500 font-medium">Masukkan kode tracking untuk melihat status naskah secara real-time.</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleTrack} className="mb-12">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Contoh: NRE-XXXXXXXX"
                            className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-300 uppercase tracking-widest"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-2 bottom-2 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Lacak'}
                        </button>
                    </div>
                    {error && <p className="mt-4 text-center text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                </form>

                {/* Display Results */}
                {trackingData && (
                    <div className="space-y-6">
                        {/* Book Info Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">{trackingData.title}</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <User size={14} className="text-amber-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{trackingData.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Hash size={14} className="text-amber-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{code}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl border border-amber-100 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Status Saat Ini</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{trackingData.current_status}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-4 px-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Publishing Progress</p>
                                    <p className="text-lg font-black text-amber-500">{trackingData.progress}%</p>
                                </div>
                                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${trackingData.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Pipeline Steps (Desktop Only) */}
                            <div className="hidden lg:grid grid-cols-5 gap-2 relative">
                                <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-100 -z-10" />
                                {stages.map((stage, idx) => {
                                    const isCompleted = trackingData.progress >= (idx + 1) * 20 || (idx === 0 && trackingData.progress > 0);
                                    const isActive = trackingData.status_key.includes(stage.key);

                                    return (
                                        <div key={stage.key} className="flex flex-col items-center text-center">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white border-2 border-slate-100 text-slate-300'
                                                } ${isActive ? 'ring-4 ring-amber-500/20 scale-110' : ''}`}>
                                                <stage.icon size={18} />
                                            </div>
                                            <p className={`mt-3 text-[9px] font-bold uppercase tracking-widest ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {stage.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pipeline Steps (Mobile) */}
                            <div className="lg:hidden flex justify-between px-2">
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                                        <Loader2 className="animate-spin" size={14} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                                        {trackingData.current_status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* History Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Log Aktivitas</h3>
                            </div>

                            <div className="space-y-6">
                                {trackingData.history.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-50 transition-all group-hover:scale-125" />
                                            {idx !== trackingData.history.length - 1 && <div className="w-px h-12 bg-slate-100 mt-2" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.date}</p>
                                            <p className="text-sm font-bold text-slate-700">{item.activity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                {!trackingData && !loading && (
                    <div className="mt-12 bg-white rounded-[2.5rem] p-10 border border-dashed border-slate-200 text-center">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                            Silakan hubungi admin atau editor untuk mendapatkan kode tracking naskah Anda jika belum memilikinya.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-colors">
                        Pintu Masuk Karyawan <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
