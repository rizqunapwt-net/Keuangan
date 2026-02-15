'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Download, Clock, TrendingUp, AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface Payroll {
    id: string;
    payroll_number: string;
    month: number;
    year: number;
    net_pay: number;
    gross_pay: number;
    overtime_pay: number;
    late_deduction: number;
    is_paid: boolean;
}

const PayrollDashboard: React.FC = () => {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                // In a real app, you might want to filter by employeeId if not handled by backend session
                const response = await api.get(`/api/payrolls?employeeId=${user?.employee?.id}`);
                setPayrolls(response.data.data || []);
            } catch (err) {
                console.error('Failed to fetch payrolls', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.employee?.id) fetchPayrolls();
    }, [user]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' });
    };

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Pusat Payroll</h2>
                    <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-2">Financial Earnings Record</p>
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sinkronisasi Keuangan...</p>
                </div>
            ) : payrolls.length === 0 ? (
                <div className="rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100 bg-slate-50/50">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white text-slate-300 mb-6 shadow-sm">
                        <Wallet className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum ada data slip gaji tersedia</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Latest Payroll Banner */}
                    <div className="rounded-[2.5rem] p-10 bg-emerald-900 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity duration-1000" />
                        <TrendingUp className="absolute bottom-[-10px] right-[10%] h-48 w-48 text-emerald-800/20 -rotate-12" />

                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300 mb-6 block">Penghasilan Terbaru</span>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div>
                                    <h3 className="text-5xl font-black text-white tracking-tighter mb-2">
                                        {getMonthName(payrolls[0].month)} <span className="text-emerald-400">{payrolls[0].year}</span>
                                    </h3>
                                    <p className="text-sm font-medium text-emerald-100/80">Periode penggajian telah ditutup dan dibayarkan.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-emerald-300 uppercase tracking-widest mb-1">Total Diterima</div>
                                    <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">{formatCurrency(payrolls[0].net_pay)}</div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <div className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    SUDAH DIBAYAR
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-end justify-between ml-2 pb-2 border-b border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Riwayat Transaksi</h4>
                            <span className="text-[10px] font-bold text-slate-300">{payrolls.length} RECORD FOUND</span>
                        </div>

                        {payrolls.map((payroll) => (
                            <div key={payroll.id} className="group relative rounded-[2rem] p-6 border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                        <FileText className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{getMonthName(payroll.month)} {payroll.year}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase bg-slate-50 px-2 py-1 rounded-md">#{payroll.payroll_number}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end bg-slate-50/50 p-4 rounded-3xl md:bg-transparent md:p-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gaji Kotor</p>
                                        <p className="text-sm font-bold text-slate-600 tabular-nums">{formatCurrency(payroll.gross_pay)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Take Home Pay</p>
                                        <p className="text-xl font-black text-slate-900 tabular-nums">{formatCurrency(payroll.net_pay)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-90 opacity-60 group-hover:opacity-100">
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <div className="h-12 w-12 flex items-center justify-center">
                                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollDashboard;
