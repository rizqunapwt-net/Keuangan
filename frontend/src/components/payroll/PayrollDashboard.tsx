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
                const response = await api.get(`/api/payrolls?employeeId=${user?.employee?.id}`);
                setPayrolls(response.data.data);
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
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Pusat Payroll</h2>
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-2">Financial Earnings Record</p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/5 border-t-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Sinkronisasi Keuangan...</p>
                </div>
            ) : payrolls.length === 0 ? (
                <div className="glass-card rounded-[2.5rem] p-16 text-center border-dashed border-2 border-white/5">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-600 mb-6">
                        <Wallet className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Belum ada data slip gaji tersedia</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Latest Payroll Banner */}
                    <div className="glass-card rounded-[2.5rem] p-10 bg-gradient-to-br from-emerald-600/20 to-transparent border border-emerald-500/20 relative overflow-hidden">
                        <TrendingUp className="absolute top-10 right-10 h-32 w-32 text-emerald-500/5 -rotate-12" />
                        <div className="relative">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4 block">Penghasilan Terbaru</span>
                            <h3 className="text-4xl font-black text-white mb-2">{getMonthName(payrolls[0].month)} {payrolls[0].year}</h3>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="text-5xl font-black tracking-tighter text-white">{formatCurrency(payrolls[0].net_pay)}</div>
                                <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                                    SUDAH DIBAYAR
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] ml-2">Riwayat Transaksi</h4>
                        {payrolls.map((payroll) => (
                            <div key={payroll.id} className="glass-card group relative rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                                        <FileText className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{getMonthName(payroll.month)} {payroll.year}</p>
                                        <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">{payroll.payroll_number}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Gaji Pokok + Lembur</p>
                                        <p className="text-sm font-bold text-white/80">{formatCurrency(payroll.gross_pay)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Netto</p>
                                        <p className="text-lg font-black text-white">{formatCurrency(payroll.net_pay)}</p>
                                    </div>
                                    <button className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-white transition-all" />
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
