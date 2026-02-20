"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Info, Wallet } from 'lucide-react';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';

export default function PayrollPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-emerald-100">
            {/* Professional Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <button onClick={() => router.push('/')} className="hover:scale-110 transition-transform active:scale-95 text-slate-800">
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Financial Secure</span>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">Slip Gaji Digital</h1>
                </div>
                <div className="w-6"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Information Alert */}
                <div className="mb-10 p-5 rounded-[24px] bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-emerald-500 shadow-sm border border-slate-100">
                        <Wallet size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-tight mb-1">Kerahasiaan Gaji</h4>
                        <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                            Informasi ini bersifat rahasia dan hanya diperuntukkan bagi {user?.employee?.name || user?.username}.
                        </p>
                    </div>
                </div>

                <div className="payroll-container">
                    <PayrollDashboard />
                </div>

                {/* Secure Badge */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted Access</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
