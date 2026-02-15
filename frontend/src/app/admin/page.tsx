"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Users,
    UserCheck,
    AlertTriangle,
    TrendingUp,
    Calendar,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Bell,
    Settings,
    LogOut
} from 'lucide-react';
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
    const { user, loading: authLoading, logout } = useAuth();
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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500" />
            </div>
        );
    }

    const presentCount = summary.filter(s => s.status !== 'ABSEN').length;
    const lateCount = summary.filter(s => s.late_minutes > 0).length;

    return (
        <div className="min-h-screen bg-[#fdfdfd] pb-24 text-slate-800">
            {/* Admin Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Settings className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-[0.2em] text-slate-800 uppercase">Control Center</h1>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Admin Authorization Level</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <Calendar size={14} className="text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 outline-none"
                            />
                        </div>
                        <NotificationDropdown />
                        <button onClick={logout} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-6">
                {/* Welcome & Stats Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-800 mb-2">Ikhtisar Organisasi</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.3em]">Monitoring mobilisasi sumber daya manusia.</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="bg-slate-800 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 transition-all shadow-xl shadow-slate-200"
                        >
                            <Users size={16} />
                            Manajemen Karyawan
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    <div className="modern-card p-8 bg-white border-slate-50 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-6">
                            <Users size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Total Personel</p>
                        <p className="text-4xl font-black text-slate-800 tracking-tight">{summary.length}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ArrowUpRight size={12} className="text-green-500" />
                            Target operasional
                        </div>
                    </div>

                    <div className="modern-card p-8 bg-white border-slate-50 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-6">
                            <UserCheck size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Dimobilisasi</p>
                        <p className="text-4xl font-black text-green-600 tracking-tight">{presentCount}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ArrowUpRight size={12} className="text-green-500" />
                            Hadir bertugas
                        </div>
                    </div>

                    <div className="modern-card p-8 bg-white border-slate-50 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                            <AlertTriangle size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Anomali</p>
                        <p className="text-4xl font-black text-amber-500 tracking-tight">{lateCount}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <TrendingUp size={12} className="text-amber-500" />
                            Keterlambatan
                        </div>
                    </div>

                    <div className="modern-card p-8 bg-white border-slate-50 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Efisiensi</p>
                        <p className="text-4xl font-black text-blue-600 tracking-tight">
                            {Math.round((presentCount / summary.length) * 100) || 0}%
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ArrowUpRight size={12} className="text-blue-500" />
                            Skor kehadiran
                        </div>
                    </div>
                </div>

                {/* Action Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                    <div className="modern-card p-4 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Persetujuan Cuti & Izin</h3>
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-200">Pending Actions</span>
                        </div>
                        <div className="p-4">
                            <AdminApprovalPanel />
                        </div>
                    </div>

                    <div className="modern-card p-4 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sistem Manajemen Payroll</h3>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-200">Cycle Active</span>
                        </div>
                        <div className="p-4">
                            <AdminPayrollPanel />
                        </div>
                    </div>
                </div>

                {/* Main Data Table */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Status Mobilisasi Operator</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Log aktivitas personel per {format(new Date(date), 'd MMMM yyyy', { locale: id })}</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode..."
                                className="bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Identitas Operator</th>
                                    <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Divisi</th>
                                    <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Protokol</th>
                                    <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Inisialisasi</th>
                                    <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Terminasi</th>
                                    <th className="px-10 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {summary.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 leading-none mb-1">{emp.name}</div>
                                                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{emp.employee_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-[10px] font-black text-slate-500 border border-slate-200 px-2 py-1 rounded-lg uppercase">
                                                {emp.category}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${emp.status === 'HADIR' ? 'bg-green-500 pulse-slow' : 'bg-red-500'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest 
                                                    ${emp.status === 'HADIR' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {emp.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-500">
                                                <Clock size={12} className="text-slate-300" />
                                                {emp.check_in ? format(new Date(emp.check_in), 'HH:mm:ss') : '--:--:--'}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-500">
                                                <Clock size={12} className="text-slate-300" />
                                                {emp.check_out ? format(new Date(emp.check_out), 'HH:mm:ss') : '--:--:--'}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="p-2 text-slate-300 hover:text-amber-500 transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Menampilkan {summary.length} Entri Personel</span>
                        <div className="flex gap-4">
                            <button className="hover:text-slate-800 transition-colors cursor-not-allowed opacity-50">Prev</button>
                            <button className="hover:text-slate-800 transition-colors cursor-not-allowed opacity-50">Next</button>
                        </div>
                    </div>
                </div>

                {/* Footer Center Info */}
                <div className="mt-20 text-center opacity-40">
                    <img src="/logo.png" alt="Logo" className="grayscale h-12 mx-auto mb-4" />
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-900">
                        NRE Enterprise Authorization Portal • Secure v5.0
                    </p>
                </div>
            </main>
        </div>
    );
}

function Clock({ className, size }: { className?: string, size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
