'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, TrendingUp, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import api from '@/utils/api';

// No manual API_URL needed, handled by @/utils/api

const StatusBadge = ({ status }: { status: string }) => {
    const config = {
        PENDING: {
            bg: 'bg-amber-500/20',
            text: 'text-amber-300',
            border: 'border-amber-500/40',
            icon: Clock,
        },
        APPROVED: {
            bg: 'bg-emerald-500/20',
            text: 'text-emerald-300',
            border: 'border-emerald-500/40',
            icon: CheckCircle,
        },
        REJECTED: {
            bg: 'bg-red-500/20',
            text: 'text-red-300',
            border: 'border-red-500/40',
            icon: XCircle,
        },
        CANCELLED: {
            bg: 'bg-gray-500/20',
            text: 'text-gray-300',
            border: 'border-gray-500/40',
            icon: AlertCircle,
        },
    };

    const statusConfig = config[status] || config.PENDING;
    const { bg, text, border, icon: Icon } = statusConfig;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
};

const LeaveBalanceCard = ({ balance }: { balance: any }) => {
    const percentage = (balance.remaining / balance.total_quota) * 100;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">
                            {balance.leave_type.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                {balance.remaining}
                            </span>
                            <span className="text-sm text-gray-400">
                                / {balance.total_quota} hari
                            </span>
                        </div>
                    </div>

                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            backgroundColor: `${balance.leave_type.color}20`,
                            border: `1px solid ${balance.leave_type.color}40`
                        }}
                    >
                        <Calendar className="w-8 h-8" style={{ color: balance.leave_type.color }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Terpakai: {balance.used} hari</span>
                        <span>{percentage.toFixed(0)}% tersisa</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: balance.leave_type.color,
                                boxShadow: `0 0 10px ${balance.leave_type.color}60`
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
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: request.leave_type.color }} />

            <div className="relative p-6 pl-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-400">
                                {request.request_number}
                            </span>
                            <StatusBadge status={request.status} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            {request.leave_type.name}
                        </h3>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                            {request.total_days}
                        </div>
                        <div className="text-xs text-gray-400">hari</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-3 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                        {startDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        {' → '}
                        {endDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {request.reason}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        Diajukan {new Date(request.submitted_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
                        Detail →
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
            <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Manajemen Cuti</h2>
                    <p className="text-gray-400">Pantau saldo dan status pengajuan cuti Anda</p>
                </div>

                <button
                    onClick={onNewRequest}
                    className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Ajukan Cuti
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Saldo Cuti</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {balances.map((balance, idx) => (
                        <LeaveBalanceCard key={idx} balance={balance} />
                    ))}
                    {balances.length === 0 && (
                        <div className="col-span-full p-8 rounded-2xl border border-white/10 bg-white/5 text-center text-gray-500">
                            Belum ada data saldo cuti tersedia.
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">Riwayat Pengajuan</h3>
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                        {['all', 'pending', 'approved'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab === 'all' ? 'Semua' : tab === 'pending' ? 'Tertunda' : 'Disetujui'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredRequests.map((request) => (
                        <LeaveRequestCard key={request.id} request={request} />
                    ))}
                    {filteredRequests.length === 0 && (
                        <div className="col-span-full py-12 rounded-2xl border border-white/10 bg-white/5 text-center">
                            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Tidak ada pengajuan cuti ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
