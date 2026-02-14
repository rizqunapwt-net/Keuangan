"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden relative selection:bg-indigo-500/30">
            {/* Animated Nebula Background */}
            <div className="nebula" />

            <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
                    <button onClick={() => router.push('/')} className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        DASBOR
                    </button>
                    <div className="hidden md:block">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Akses Arsip Personel</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto py-10 md:py-16 px-4 md:px-6 relative z-10">
                <div className="mb-16 md:mb-24">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent uppercase">Arsip <span className="text-indigo-500">Personel</span></h1>
                    <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">Laporan Kinerja Historis • 30 Siklus Terakhir</p>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-white/[0.02]">
                                <tr>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Tanggal Siklus</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Inisialisasi</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Kesimpulan</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Status Protokol</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Penyimpangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-sm text-gray-600 italic">Tidak ada entri arsip yang ditemukan untuk operator ini.</td>
                                    </tr>
                                ) : (
                                    history.map((record) => (
                                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6 text-sm font-black text-white">
                                                {format(new Date(record.attendance_date), 'MMM dd, yyyy', { locale: id })}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-mono text-gray-400">
                                                {format(new Date(record.check_in_time), 'HH:mm:ss', { locale: id })}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-mono text-gray-400">
                                                {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm:ss', { locale: id }) : '--:--:--'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md
                                            ${record.status === 'HADIR' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-white/10'}`}>
                                                    {record.status === 'HADIR' ? 'HADIR' : record.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-gray-500">
                                                {record.late_minutes > 0 ? (
                                                    <span className="text-red-500 font-bold">+{record.late_minutes}m Penyimpangan</span>
                                                ) : 'Tanpa Latensi'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-16 glass-card p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
                    <h4 className="text-[10px] font-black mb-3 uppercase tracking-[0.4em] text-indigo-400">Keamanan Cloud Terjamin</h4>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-md uppercase tracking-widest font-bold">
                        Semua data arsip ditandatangani secara kriptografis dan disinkronkan dengan simpul global. Catatan tahan gangguan (Tamper-proof).
                    </p>
                </div>
            </main>
        </div>
    );
}
