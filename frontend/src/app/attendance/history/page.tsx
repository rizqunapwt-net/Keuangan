"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, Calendar, Clock, History, FileText, AlertTriangle } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    attendance_date: string;
    check_in_time: string;
    check_out_time: string | null;
    status: string;
    late_minutes: number;
}

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchHistory();
        }
    }, [user, authLoading, router]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/attendance/history');
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfdfd] pb-24">
            {/* Header Navigation */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-4">
                <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500 hover:text-amber-500 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">Riwayat Absensi</h1>
                <div className="w-10"></div>
            </div>

            <main className="px-6 py-8 md:max-w-xl md:mx-auto">
                {/* Title Section */}
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                        <History size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Arsip Kehadiran</h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">30 Periode Terakhir</p>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="modern-card p-12 text-center border-dashed">
                            <FileText size={40} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-400">Belum ada catatan riwayat.</p>
                        </div>
                    ) : (
                        history.map((record) => (
                            <div key={record.id} className="modern-card p-5 group hover:border-amber-400 transition-all border-l-4 border-l-amber-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">
                                            {format(new Date(record.attendance_date), 'EEEE, d MMM yyyy', { locale: id })}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full 
                                                ${record.status === 'HADIR' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {record.status}
                                            </span>
                                            {record.late_minutes > 0 && (
                                                <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full bg-red-50 text-red-600">
                                                    Terlambat {record.late_minutes}m
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                        <Calendar size={16} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Masuk</p>
                                            <p className="text-xs font-black text-gray-900">
                                                {format(new Date(record.check_in_time), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Keluar</p>
                                            <p className="text-xs font-black text-gray-900">
                                                {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '--:--'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-12 p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100 flex gap-4 items-start">
                    <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Verifikasi Cloud Monitoring</h4>
                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                            Semua data absensi disinkronkan secara aman dengan sistem pusat PT New Rizquna Elfath untuk akurasi pelaporan.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
