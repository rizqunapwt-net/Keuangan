'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, TrendingUp, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import api from '@/utils/api';

// No manual API_URL needed, handled by @/utils/api

const StatusBadge = ({ status }: { status: string }) => {
    const config = {
        PENDING: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            icon: Clock,
        },
        APPROVED: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            icon: CheckCircle,
        },
        REJECTED: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-100',
            icon: XCircle,
        },
        CANCELLED: {
            bg: 'bg-slate-50',
            text: 'text-slate-500',
            border: 'border-slate-100',
            icon: AlertCircle,
        },
    };

    const statusKey = (status in config) ? (status as keyof typeof config) : 'PENDING';
    const statusConfig = config[statusKey];
    const { bg, text, border, icon: Icon } = statusConfig;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${bg} ${text} ${border}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
};

const LeaveBalanceCard = ({ balance }: { balance: any }) => {
    const percentage = (balance.remaining / balance.total_quota) * 100;

    return (
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            {balance.leave_type.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-800 tracking-tighter">
                                {balance.remaining}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                                / {balance.total_quota} hari
                            </span>
                        </div>
                    </div>

                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                            backgroundColor: `${balance.leave_type.color}10`, // 10% opacity
                            border: `1px solid ${balance.leave_type.color}20`
                        }}
                    >
                        <Calendar className="w-6 h-6" style={{ color: balance.leave_type.color }} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Terpakai: {balance.used}</span>
                        <span>{percentage.toFixed(0)}% Sisa</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: balance.leave_type.color,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeaveRequestCard = ({ request }: { request: any }) => {
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);

    return (
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white hover:border-amber-200 transition-all duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-amber-400 transition-colors" />

            <div className="relative p-6 pl-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                #{request.request_number.slice(-6)}
                            </span>
                            <StatusBadge status={request.status} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">
                            {request.leave_type.name}
                        </h3>
                    </div>

                    <div className="text-right bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <div className="text-xl font-black text-slate-800 leading-none">
                            {request.total_days}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hari</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-2 text-amber-700">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">
                            {startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            {' - '}
                            {endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {request.reason}
                </p>

                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-widest border-t border-slate-50 pt-4">
                    <span>
                        Diajukan: {new Date(request.submitted_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-amber-500 group-hover:translate-x-1 transition-transform cursor-pointer">
                        Lihat Detail →
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function LeaveDashboard({ onNewRequest }: { onNewRequest: () => void }) {
    const [balances, setBalances] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/api/users/me');
            const employeeId = response.data.data.employee_id;

            if (!employeeId) return;

            const [balanceRes, requestsRes] = await Promise.all([
                api.get(`/api/employees/${employeeId}/leave-balance`),
                api.get(`/api/leave-requests?employeeId=${employeeId}`),
            ]);

            if (balanceRes.data.success) setBalances(balanceRes.data.data);
            if (requestsRes.data.success) setRequests(requestsRes.data.data);
        } catch (error) {
            console.error('Error fetching leave data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (activeTab === 'all') return true;
        return req.status === activeTab.toUpperCase();
    });

    if (isLoading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Memuat Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Manajemen Cuti</h2>
                    <p className="text-xs font-medium text-slate-400 max-w-xs">Pantau saldo, ajukan permohonan, dan kelola keseimbangan kerja Anda.</p>
                </div>

                <button
                    onClick={onNewRequest}
                    className="group relative overflow-hidden px-8 py-4 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-200 hover:shadow-2xl transition-all duration-300 active:scale-95"
                >
                    <span className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Plus className="w-4 h-4" />
                        Buat Pengajuan
                    </span>
                    <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Saldo Cuti Aktif</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {balances.map((balance, idx) => (
                        <LeaveBalanceCard key={idx} balance={balance} />
                    ))}
                    {balances.length === 0 && (
                        <div className="col-span-full p-10 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada data saldo cuti tersedia.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Riwayat Pengajuan</h3>
                    </div>

                    <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-[1.2rem] border border-slate-200/50 self-start sm:self-auto">
                        {['all', 'pending', 'approved'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white text-slate-800 shadow-sm scale-100'
                                    : 'text-slate-400 hover:text-slate-600 scale-95'
                                    }`}
                            >
                                {tab === 'all' ? 'Semua' : tab === 'pending' ? 'Proses' : 'Selesai'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRequests.map((request) => (
                        <LeaveRequestCard key={request.id} request={request} />
                    ))}
                    {filteredRequests.length === 0 && (
                        <div className="col-span-full py-16 rounded-[2.5rem] border border-slate-100 bg-white text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <FileText className="w-8 h-8" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada pengajuan pada filter ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
