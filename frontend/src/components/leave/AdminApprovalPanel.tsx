'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Calendar, FileText, MessageSquare, Filter, Loader2, ArrowRight, UserCheck, UserX } from 'lucide-react';
import api from '@/utils/api';

const ReviewModal = ({ request, onClose, onSubmit }: { request: any, onClose: () => void, onSubmit: (status: string, notes: string) => Promise<void> }) => {
    const [status, setStatus] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!status) return;
        setIsSubmitting(true);
        await onSubmit(status, notes);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-slate-50 border-b border-slate-100 p-8 text-center">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight text-center">Tinjauan Disiplin Personel</h3>
                    <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{request.request_number} • Verification Required</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-2xl font-black shadow-sm">
                            {request.employee.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 leading-none mb-1">{request.employee.name}</h4>
                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{request.employee.employee_code}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Klasifikasi Izin</p>
                            <p className="text-slate-800 font-black text-base">{request.leave_type.name}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Durasi Operasional</p>
                            <p className="text-slate-800 font-black text-base">{request.total_days} Hari Kerja</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2">Justifikasi Personal</p>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{request.reason}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <button
                            onClick={() => setStatus('APPROVED')}
                            className={`py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${status === 'APPROVED'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100'
                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-200 hover:bg-white'
                                }`}
                        >
                            <UserCheck className="w-7 h-7" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Validasi Izin</span>
                        </button>
                        <button
                            onClick={() => setStatus('REJECTED')}
                            className={`py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${status === 'REJECTED'
                                ? 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-100'
                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-red-200 hover:bg-white'
                                }`}
                        >
                            <UserX className="w-7 h-7" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Batalkan Izin</span>
                        </button>
                    </div>

                    {status && (
                        <div className="animate-in fade-in duration-300">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tambahkan catatan analitik untuk laporan..."
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <div className="p-8 pt-0 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-800 transition-colors">Batal</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!status || isSubmitting}
                        className="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-200"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Finalisasi Keputusan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RequestCard = ({ request, onReview }: { request: any, onReview: () => void }) => (
    <div className="group modern-card p-0 overflow-hidden bg-white border-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
        <div className="p-8">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                        {request.employee.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 leading-none mb-1">{request.employee.name}</h3>
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest leading-none">{request.employee.employee_code}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono font-bold text-slate-300 mb-2">{request.request_number}</p>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full">Proses Verifikasi</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Klasifikasi</p>
                    <p className="text-sm text-slate-800 font-black">{request.leave_type.name}</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Estimasi Hari</p>
                    <p className="text-sm text-slate-800 font-black">{request.total_days} Hari</p>
                </div>
            </div>

            <button
                onClick={onReview}
                className="w-full py-4 bg-white border border-slate-200 text-slate-400 group-hover:bg-slate-800 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-slate-200"
            >
                Evaluasi Pengajuan
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </div>
);

export default function AdminApprovalPanel() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get('/api/leave-requests?status=PENDING');
            if (res.data.success) setRequests(res.data.data);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = async (status: string, notes: string) => {
        try {
            const response = await api.get('/api/users/me');
            const reviewerId = response.data.data.id;

            const res = await api.patch(`/api/leave-requests/${selectedRequest.id}/status`, {
                status,
                reviewNotes: notes,
                reviewedBy: reviewerId
            });

            if (res.data.success) {
                setRequests(requests.filter(r => r.id !== selectedRequest.id));
            }
        } catch (error) {
            console.error('Error reviewing request:', error);
        }
    };

    if (isLoading) return (
        <div className="py-20 text-center">
            <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={32} />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Antrian...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Persetujuan Disiplin</h2>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Evaluasi dan validasi permohonan izin operasional</p>
                </div>
                <div className="px-6 py-4 rounded-3xl bg-white border border-slate-100 text-center shadow-sm">
                    <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Antrian Aktif</p>
                    <p className="text-3xl font-black text-slate-800 leading-none">{requests.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {requests.map((request) => (
                    <RequestCard key={request.id} request={request} onReview={() => setSelectedRequest(request)} />
                ))}

                {requests.length === 0 && (
                    <div className="col-span-full py-24 text-center rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                        <Clock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Antrian Bersih • Tidak Ada Pengajuan Tertunda</p>
                    </div>
                )}
            </div>

            {selectedRequest && (
                <ReviewModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onSubmit={handleReview}
                />
            )}
        </div>
    );
}
