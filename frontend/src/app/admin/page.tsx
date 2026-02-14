"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import AdminPayrollPanel from '@/components/payroll/AdminPayrollPanel';
import AdminApprovalPanel from '@/components/leave/AdminApprovalPanel';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

interface EmployeeSummary {
    id: string;
    name: string;
    employee_code: string | null;
    category: string;
    status: string;
    check_in: string | null;
    check_out: string | null;
    late_minutes: number;
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState<EmployeeSummary[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
                router.push('/');
            } else {
                fetchSummary(date);
            }
        }
    }, [user, authLoading, router, date]);

    const fetchSummary = async (dateStr: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/attendance/summary?date=${dateStr}`);
            setSummary(res.data.summary);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (loading && summary.length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
            </div>
        );
    }

    const presentCount = summary.filter(s => s.status !== 'ABSEN').length;
    const lateCount = summary.filter(s => s.late_minutes > 0).length;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
            {/* Animated Nebula Background */}
            <div className="nebula" />
            <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm text-white">A</div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic">
                            INTELIJEN
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <NotificationDropdown />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button onClick={() => router.push('/')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                            Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
                <div className="mb-16 md:mb-20">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent uppercase">Ikhtisar Organisasi</h2>
                    <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mt-3">Data mobilisasi waktu nyata untuk siklus operasional.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="glass-card p-8 rounded-[2rem] transition-all hover:scale-[1.02]">
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-4">Total Personel</p>
                        <p className="text-5xl font-black tracking-tighter">{summary.length}</p>
                        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">Tenaga kerja aktif</p>
                    </div>
                    <div className="glass-card p-8 rounded-[2rem] transition-all hover:scale-[1.02]">
                        <p className="text-[10px] font-black uppercase text-green-400 tracking-[0.3em] mb-4">Dimobilisasi</p>
                        <p className="text-5xl font-black text-green-400 tracking-tighter">{presentCount}</p>
                        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">Sedang bertugas</p>
                    </div>
                    <div className="glass-card p-8 rounded-[2rem] transition-all hover:scale-[1.02]">
                        <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] mb-4">Anomali</p>
                        <p className="text-5xl font-black text-red-500 tracking-tighter">{lateCount}</p>
                        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">Kebocoran Protokol</p>
                    </div>
                    <div className="glass-card p-8 rounded-[2rem] transition-all hover:scale-[1.02]">
                        <p className="text-[10px] font-black uppercase text-purple-400 tracking-[0.3em] mb-4">Efisiensi</p>
                        <p className="text-5xl font-black tracking-tighter">{Math.round((presentCount / summary.length) * 100) || 0}%</p>
                        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">Tingkat Mobilitas</p>
                    </div>
                </div>

                <div className="space-y-12 mb-12">
                    <AdminPayrollPanel />
                    <div className="border-t border-white/5 pt-12">
                        <AdminApprovalPanel />
                    </div>
                </div>

                <div className="space-y-12 mb-12">
                    <AdminPayrollPanel />
                    <div className="border-t border-white/5 pt-12">
                        <AdminApprovalPanel />
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-white/[0.02]">
                                <tr>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Operator</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Divisi</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Masuk</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Keluar</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Gesekan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {summary.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-white">{emp.name}</div>
                                            <div className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">{emp.employee_code}</div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase">
                                            {emp.category === 'REGULER' ? 'REGULER' : emp.category}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full 
                                    ${emp.status === 'HADIR' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                {emp.status === 'HADIR' ? 'HADIR' : emp.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-gray-400">
                                            {emp.check_in ? format(new Date(emp.check_in), 'HH:mm:ss', { locale: id }) : '--:--:--'}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-gray-400">
                                            {emp.check_out ? format(new Date(emp.check_out), 'HH:mm:ss', { locale: id }) : '--:--:--'}
                                        </td>
                                        <td className="px-8 py-6">
                                            {emp.late_minutes > 0 ? (
                                                <span className="text-xs font-black text-red-500">+{emp.late_minutes}m Kebocoran Protokol</span>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-700">Nominal</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
