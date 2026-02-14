'use client';

import React, { useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Calculator, CheckCircle, AlertTriangle, Users, Calendar, ArrowRight, Settings } from 'lucide-react';

const AdminPayrollPanel: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [params, setParams] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const handleGenerate = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await api.post('/api/payrolls/generate', params);
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: `Berhasil menghasilkan ${response.data.data.length} slip gaji untuk periode ${params.month}/${params.year}.`
                });
            }
        } catch (err: any) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Gagal memproses payroll massal'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-white/[0.03] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -mr-32 -mt-32" />

            <div className="relative">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">Otomasi Payroll Korporat</h3>
                        <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mt-1">Mass Payroll Engine v2.0</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Calculator className="h-6 w-6" />
                    </div>
                </div>

                {status && (
                    <div className={`mb-10 p-6 rounded-[1.5rem] border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {status.type === 'success' ? <CheckCircle className="h-6 w-6 shrink-0" /> : <AlertTriangle className="h-6 w-6 shrink-0" />}
                        <p className="text-xs font-bold leading-relaxed">{status.message}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Periode Bulan</label>
                        <select
                            value={params.month}
                            onChange={(e) => setParams({ ...params, month: parseInt(e.target.value) })}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m} className="bg-[#0a0a0c]">Bulan {m} - {new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Tahun Anggaran</label>
                        <select
                            value={params.year}
                            onChange={(e) => setParams({ ...params, year: parseInt(e.target.value) })}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y} className="bg-[#0a0a0c]">{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-black h-[58px] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4" />
                                    PROSES PAYROLL MASSAL
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all cursor-pointer">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Daftar Penerima</h4>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Kelola pengecualian payroll</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-white transition-all" />
                    </div>
                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all cursor-pointer">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all">
                            <Settings className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Konfigurasi Rate</h4>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Atur gaji pokok & rate lembur</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-white transition-all" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPayrollPanel;
