'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Upload, X, Loader2 } from 'lucide-react';
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

    const handleSubmit = async (e) => {
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
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-8 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pengajuan Terkirim!</h3>
                <p className="text-gray-400 mb-8">Permohonan cuti Anda sedang diproses oleh tim HR.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-3">
                <label id="leave-type-label" className="block text-sm font-medium text-gray-300">Jenis Cuti</label>
                <div role="group" aria-labelledby="leave-type-label" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {leaveTypes.map((type) => {
                        const balance = balances.find(b => b.leave_type_id === type.id);
                        const isSelected = formData.leaveTypeId === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setFormData({ ...formData, leaveTypeId: type.id })}
                                className={`p-4 rounded-xl border text-left transition-all ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-white">{type.name}</h4>
                                        <p className="text-xs text-gray-500">{type.description}</p>
                                    </div>
                                    {balance && (
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-white">{balance.remaining}</p>
                                            <p className="text-[10px] text-gray-400 text-uppercase">hari Sisa</p>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-300">Mulai</label>
                    <input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-300">Hingga</label>
                    <input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            {calculatedDays > 0 && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex justify-between items-center text-white">
                    <span className="text-sm">Total hari kerja:</span>
                    <span className="text-xl font-bold">{calculatedDays} Hari</span>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-300">Alasan</label>
                <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    placeholder="Jelaskan keperluan cuti Anda..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none outline-none focus:border-purple-500"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 flex justify-center items-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Kirim Pengajuan'}
                </button>
            </div>
        </form>
    );
}
