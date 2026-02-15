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
    ArrowUpRight,
    Settings,
    LogOut,
    Loader2
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
            const res = await api.get(`/api/attendance/summary?date=${dateStr}`);
            setSummary(res.data.summary || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fdfdfd]">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    const presentCount = summary.filter(s => s.status !== 'ABSEN').length;
    const lateCount = summary.filter(s => s.late_minutes > 0).length;

    return (
        <div className="min-h-screen bg-[#fdfdfd] text-slate-800">
            {/* Page Header Area */}
            <div className="bg-white border-b border-slate-100">
                <main className="max-w-7xl mx-auto py-10 px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Settings className="text-amber-600" size={18} />
                                </div>
                                <p className="text-[10px] font-black uppercase text-amber-600 tracking-[0.4em]">Corporate Control Hub</p>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter text-slate-800 mb-2">Ikhtisar Organisasi</h2>
                            <p className="text-sm text-slate-400 font-medium max-w-lg">Monitoring mobilisasi dan kepatuhan sumber daya manusia secara real-time.</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                                <Calendar size={16} className="text-slate-400" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-transparent text-xs font-black text-slate-800 outline-none uppercase tracking-tighter"
                                />
                            </div>
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="bg-slate-800 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-200"
                            >
                                <Users size={18} />
                                Kelola Karyawan
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <main className="max-w-7xl mx-auto py-12 px-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    <KPICard
                        label="Total Personel"
                        value={summary.length}
                        icon={<Users size={24} />}
                        hint="Target operasional"
                        color="slate"
                    />
                    <KPICard
                        label="Dimobilisasi"
                        value={presentCount}
                        icon={<UserCheck size={24} />}
                        hint="Personel Hadir"
                        color="emerald"
                    />
                    <KPICard
                        label="Anomali/Late"
                        value={lateCount}
                        icon={<AlertTriangle size={24} />}
                        hint="Late Report"
                        color="amber"
                    />
                    <KPICard
                        label="Produktivitas"
                        value={`${Math.round((presentCount / (summary.length || 1)) * 100)}%`}
                        icon={<TrendingUp size={24} />}
                        hint="Skor Kehadiran"
                        color="blue"
                    />
                </div>

                {/* Sub Panels Container */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-20">
                    <section>
                        <AdminApprovalPanel />
                    </section>
                    <section>
                        <AdminPayrollPanel />
                    </section>
                </div>

                {/* Detailed Data Section */}
                <div className="space-y-8">
                    <div className="flex items-end justify-between px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Status Aktivitas Lapangan</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Log Logistik Personel • {format(new Date(date), 'MMMM yyyy', { locale: id })}</p>
                        </div>
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Cari personel..."
                                className="bg-white border border-slate-100 rounded-3xl pl-14 pr-8 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/5 outline-none transition-all w-80 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="modern-card p-0 bg-white border-slate-50 overflow-hidden shadow-xl shadow-slate-200/20">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Operator</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Divisi</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinyal</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-In</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-Out</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {summary.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500 flex items-center justify-center font-black text-lg transition-all border border-slate-100 group-hover:border-amber-100">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-black text-slate-800 leading-none mb-1">{emp.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.employee_code || 'Unassigned'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                                    {emp.category}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${emp.status === 'HADIR' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full ${emp.status === 'HADIR' ? 'bg-emerald-500 pulse-slow' : 'bg-red-500'}`}></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {emp.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="font-mono text-sm font-bold text-slate-700">
                                                    {emp.check_in ? format(new Date(emp.check_in), 'HH:mm:ss') : '--:--:--'}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="font-mono text-sm font-bold text-slate-700">
                                                    {emp.check_out ? format(new Date(emp.check_out), 'HH:mm:ss') : '--:--:--'}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {summary.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-24 text-center">
                                                <div className="mb-4 flex justify-center">
                                                    <div className="p-6 bg-slate-50 rounded-full">
                                                        <Search size={40} className="text-slate-200" />
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Database Kosong untuk periode ini</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menampilkan {summary.length} Data Lapangan</p>
                            <div className="flex gap-3">
                                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 cursor-not-allowed transition-all shadow-sm">Prev</button>
                                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 cursor-not-allowed transition-all shadow-sm">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-20 text-center bg-slate-50/50 border-t border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300 mb-2">Developed for Rizquna Group</p>
                <div className="inline-flex items-center gap-2 opacity-30">
                    <span className="w-8 h-px bg-slate-400"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">NRE Secure Portal v5.1</span>
                    <span className="w-8 h-px bg-slate-400"></span>
                </div>
            </footer>
        </div>
    );
}

function KPICard({ label, value, icon, hint, color }: { label: string, value: any, icon: any, hint: string, color: string }) {
    const colors: { [key: string]: string } = {
        slate: "bg-slate-50 text-slate-400 border-slate-100",
        emerald: "bg-emerald-50 text-emerald-500 border-emerald-100",
        amber: "bg-amber-50 text-amber-500 border-amber-100",
        blue: "bg-blue-50 text-blue-500 border-blue-100"
    };

    return (
        <div className="modern-card p-10 bg-white border-slate-50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-transform hover:scale-110 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{label}</p>
            <p className="text-5xl font-black text-slate-800 tracking-tighter mb-6">{value}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50 pt-5">
                <ArrowUpRight size={14} className={color === 'slate' ? 'text-slate-300' : `text-${color}-500`} />
                {hint}
            </div>
        </div>
    );
}
