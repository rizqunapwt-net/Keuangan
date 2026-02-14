'use client';

import React, { useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, FileText, Send, X } from 'lucide-react';

interface OvertimeRequestFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const OvertimeRequestForm: React.FC<OvertimeRequestFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        overtimeDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        reason: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Combine date and time for ISO strings
            const startDateTime = new Date(`${formData.overtimeDate}T${formData.startTime}:00`).toISOString();
            const endDateTime = new Date(`${formData.overtimeDate}T${formData.endTime}:00`).toISOString();

            const response = await api.post('/api/overtime-requests', {
                employeeId: user?.employee?.id,
                overtimeDate: formData.overtimeDate,
                startTime: startDateTime,
                endTime: endDateTime,
                reason: formData.reason,
            });

            if (response.data.success) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Gagal mengirim permintaan lembur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />

            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Form Pengajuan Lembur</h2>
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-2">Personal Overtime Registry</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-white">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Tanggal Lembur</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="date"
                                required
                                value={formData.overtimeDate}
                                onChange={(e) => setFormData({ ...formData, overtimeDate: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Mulai</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Selesai</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="time"
                                    required
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Alasan Lembur</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-6 h-5 w-5 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" />
                        <textarea
                            required
                            rows={4}
                            placeholder="Jelaskan kebutuhan operasional untuk lembur ini..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-12 pr-6 text-sm font-medium text-white outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 group relative flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                SUBMIT PERMINTAAN
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:bg-white/5 transition-all"
                    >
                        BATAL
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OvertimeRequestForm;
