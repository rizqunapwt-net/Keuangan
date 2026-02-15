'use client';

import React, { useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Calculator, CheckCircle, AlertTriangle, Users, Calendar, ArrowRight, Settings, Loader2 } from 'lucide-react';

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
        <div className="modern-card p-10 bg-white border-slate-50 relative overflow-hidden">
            {/* Soft decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 blur-[100px] -mr-32 -mt-32 opacity-60" />

            <div className="relative">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-800">Otomasi Payroll Korporat</h3>
                        <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Mass Payroll Engine • Active Cycle</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm">
                        <Calculator className="h-7 w-7" />
                    </div>
                </div>

                {status && (
                    <div className={`mb-10 p-6 rounded-3xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${status.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                        {status.type === 'success' ? <CheckCircle className="h-6 w-6 shrink-0" /> : <AlertTriangle className="h-6 w-6 shrink-0" />}
                        <p className="text-xs font-bold leading-relaxed">{status.message}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Periode Bulan</label>
                        <div className="relative">
                            <select
                                value={params.month}
                                onChange={(e) => setParams({ ...params, month: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>Bulan {m} - {new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                <ArrowRight className="rotate-90 w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tahun Anggaran</label>
                        <div className="relative">
                            <select
                                value={params.year}
                                onChange={(e) => setParams({ ...params, year: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                <ArrowRight className="rotate-90 w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white h-[58px] rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-slate-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4" />
                                    Eksekusi Payroll Massal
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-50">
                    <div className="flex items-center gap-6 p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 group hover:border-emerald-200 hover:bg-white transition-all cursor-pointer">
                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-500 border border-slate-100 group-hover:border-emerald-100 shadow-sm transition-all">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Daftar Penerima</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Personel Terdaftar Sistem</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="flex items-center gap-6 p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 group hover:border-amber-200 hover:bg-white transition-all cursor-pointer">
                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-amber-500 border border-slate-100 group-hover:border-amber-100 shadow-sm transition-all">
                            <Settings className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Konfigurasi Rate</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Setting Gaji & Rate Lembur</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPayrollPanel;
