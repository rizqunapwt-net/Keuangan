'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Calendar, FileText, MessageSquare, Filter, Loader2 } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="max-w-2xl w-full bg-[#111114] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-slideUp">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/5 p-8 text-center">
                    <h3 className="text-2xl font-bold text-white">Review Pengajuan Cuti</h3>
                    <p className="text-gray-400 text-sm mt-1">{request.request_number}</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-black">
                            {request.employee.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-white font-bold">{request.employee.name}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{request.employee.employee_code}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Jenis Cuti</p>
                            <p className="text-white font-bold text-sm">{request.leave_type.name}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Durasi</p>
                            <p className="text-white font-bold text-sm">{request.total_days} Hari</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Alasan</p>
                        <p className="text-white text-sm leading-relaxed">{request.reason}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setStatus('APPROVED')}
                            className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${status === 'APPROVED' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-gray-500 hover:border-emerald-500/30'
                                }`}
                        >
                            <Check className="w-6 h-6" />
                            <span className="text-xs font-black uppercase">Setujui</span>
                        </button>
                        <button
                            onClick={() => setStatus('REJECTED')}
                            className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${status === 'REJECTED' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/5 bg-white/5 text-gray-500 hover:border-red-500/30'
                                }`}
                        >
                            <X className="w-6 h-6" />
                            <span className="text-xs font-black uppercase">Tolak</span>
                        </button>
                    </div>

                    {status && (
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tambahkan catatan peninjauan (opsional)..."
                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-purple-500"
                            rows={3}
                        />
                    )}
                </div>

                <div className="p-8 pt-0 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">Batal</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!status || isSubmitting}
                        className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Memproses...' : 'Simpan Keputusan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RequestCard = ({ request, onReview }: { request: any, onReview: () => void }) => (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all duration-500">
        <div className="relative p-8">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-xl">
                        {request.employee.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-white font-bold">{request.employee.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{request.employee.employee_code}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono text-gray-600 mb-1">{request.request_number}</p>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-full">Tertunda</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-[9px] text-gray-600 uppercase font-black mb-1 tracking-tighter">Jenis</p>
                    <p className="text-xs text-white font-bold">{request.leave_type.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-600 uppercase font-black mb-1 tracking-tighter">Durasi</p>
                    <p className="text-xs text-white font-bold">{request.total_days} Hari</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onReview}
                    className="flex-1 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Review Pengajuan
                </button>
            </div>
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

    if (isLoading) return <div className="py-12 text-center text-gray-500 font-black uppercase tracking-[0.5em] text-xs">Menyingkronkan Data...</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Persetujuan Cuti</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Tinjau dan proses permohonan dari tim</p>
                </div>
                <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">Total Antrian</p>
                    <p className="text-2xl font-black text-white">{requests.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.map((request) => (
                    <RequestCard key={request.id} request={request} onReview={() => setSelectedRequest(request)} />
                ))}
                {requests.length === 0 && (
                    <div className="col-span-full py-20 text-center rounded-[3rem] border border-dashed border-white/5 bg-white/[0.02]">
                        <Clock className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Tidak ada antrian pengajuan baru.</p>
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
