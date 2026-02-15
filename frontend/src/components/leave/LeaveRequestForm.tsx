'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Upload, X, Loader2, ChevronRight, Briefcase } from 'lucide-react';
import api from '@/utils/api';

export default function LeaveRequestForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [balances, setBalances] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            calculateBusinessDays();
        }
    }, [formData.startDate, formData.endDate]);

    const fetchInitialData = async () => {
        try {
            const response = await api.get('/api/users/me');
            const employeeId = response.data.data.employee_id;

            const [typesRes, balancesRes] = await Promise.all([
                api.get('/api/leave-types'),
                api.get(`/api/employees/${employeeId}/leave-balance`),
            ]);

            if (typesRes.data.success) setLeaveTypes(typesRes.data.data);
            if (balancesRes.data.success) setBalances(balancesRes.data.data);
        } catch (err) {
            console.error('Error fetching initialization data:', err);
            setError('Gagal memuat data awal.');
        }
    };

    const calculateBusinessDays = () => {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        let count = 0;
        const current = new Date(start);

        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) count++;
            current.setDate(current.getDate() + 1);
        }
        setCalculatedDays(count);
    };

    const validateForm = () => {
        if (!formData.leaveTypeId) return 'Pilih jenis cuti.';
        if (!formData.startDate || !formData.endDate) return 'Tentukan range tanggal.';
        if (new Date(formData.endDate) < new Date(formData.startDate)) return 'Tanggal selesai tidak valid.';
        if (formData.reason.trim().length < 10) return 'Alasan minimal 10 karakter.';

        const balance = balances.find(b => b.leave_type_id === formData.leaveTypeId);
        if (balance && calculatedDays > balance.remaining) return 'Saldo cuti tidak mencukupi.';

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.get('/api/users/me');
            const employeeId = response.data.data.employee_id;

            const res = await api.post('/api/leave-requests', {
                ...formData,
                employeeId: employeeId,
            });

            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => onSuccess?.(), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-12 text-center animate-pulse">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Pengajuan Berhasil</h3>
                <p className="text-sm font-medium text-slate-500">Permohonan cuti Anda telah diteruskan ke HRD.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                        <Briefcase size={16} />
                    </div>
                    <label id="leave-type-label" className="text-sm font-black text-slate-800 uppercase tracking-wider">Jenis Cuti</label>
                </div>

                <div role="group" aria-labelledby="leave-type-label" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {leaveTypes.map((type) => {
                        const balance = balances.find(b => b.leave_type_id === type.id);
                        const isSelected = formData.leaveTypeId === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setFormData({ ...formData, leaveTypeId: type.id })}
                                className={`group relative p-5 rounded-[1.5rem] border text-left transition-all duration-300 ${isSelected
                                    ? 'border-amber-500 bg-slate-900 shadow-xl shadow-amber-500/10'
                                    : 'border-slate-100 bg-white hover:border-amber-200 hover:shadow-lg'
                                    }`}
                            >
                                {isSelected && <div className="absolute top-4 right-4 text-amber-400"><CheckCircle size={16} /></div>}

                                <div className="flex flex-col h-full justify-between">
                                    <div className="mb-4">
                                        <h4 className={`text-sm font-black uppercase tracking-wide mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                            {type.name}
                                        </h4>
                                        <p className={`text-[10px] font-medium leading-relaxed ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {type.description}
                                        </p>
                                    </div>

                                    {balance && (
                                        <div className={`mt-auto pt-4 border-t border-dashed ${isSelected ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <div className="flex items-end justify-between">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>Sisa Kuota</span>
                                                <span className={`text-xl font-black ${isSelected ? 'text-amber-400' : 'text-slate-800'}`}>
                                                    {balance.remaining}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="start-date" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mulai Tanggal</label>
                    <div className="relative">
                        <input
                            id="start-date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-sm font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="end-date" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Sampai Tanggal</label>
                    <div className="relative">
                        <input
                            id="end-date"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-sm font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {calculatedDays > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex justify-between items-center animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Durasi Cuti</p>
                            <p className="text-xs text-amber-600 font-medium">Hari kerja efektif</p>
                        </div>
                    </div>
                    <span className="text-2xl font-black text-amber-600 tracking-tight">{calculatedDays} Hari</span>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="reason" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Alasan Pengajuan</label>
                <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    placeholder="Jelaskan secara singkat keperluan cuti Anda..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-sm font-medium resize-none outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-400"
                />
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest text-[10px]"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black hover:shadow-xl hover:shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 group"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                        <>
                            Kirim Pengajuan
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
