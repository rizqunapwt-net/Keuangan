'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Clock, CheckCircle2, XCircle, AlertCircle, History, Plus } from 'lucide-react';

interface OvertimeRequest {
    id: string;
    request_number: string;
    overtime_date: string;
    total_hours: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
}

interface OvertimeDashboardProps {
    onNewRequest: () => void;
}

const OvertimeDashboard: React.FC<OvertimeDashboardProps> = ({ onNewRequest }) => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<OvertimeRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get(`/api/overtime-requests?employeeId=${user?.employee?.id}`);
                setRequests(response.data.data);
            } catch (err) {
                console.error('Failed to fetch overtime requests', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.employee?.id) fetchRequests();
    }, [user]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case 'REJECTED': return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <Clock className="h-4 w-4 text-amber-400" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="space-y-12">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Siklus Lembur</h2>
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-2">Personal Overtime History</p>
                </div>
                <button
                    onClick={onNewRequest}
                    className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    AJUKAN LEMBUR BARU
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/5 border-t-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Sinkronisasi Data...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="glass-card rounded-[2.5rem] p-16 text-center border-dashed border-2 border-white/5">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-600 mb-6">
                            <History className="h-10 w-10" />
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tidak ada riwayat lembur ditemukan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((request) => (
                            <div key={request.id} className="glass-card group relative rounded-[2rem] p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase ${getStatusStyle(request.status)}`}>
                                        {getStatusIcon(request.status)}
                                        {request.status}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-600 tracking-widest uppercase">{request.request_number}</span>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tanggal Lembur</p>
                                    <p className="text-xl font-black text-white">{new Date(request.overtime_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>

                                <div className="flex items-center gap-6 mb-8 p-4 rounded-xl bg-black/20">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Durasi</p>
                                        <p className="text-lg font-black text-amber-500">{request.total_hours.toFixed(1)} Jam</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Alasan</p>
                                    <p className="text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed">{request.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OvertimeDashboard;
