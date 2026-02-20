"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, Info, Plus, ShieldCheck } from 'lucide-react';
import LeaveDashboard from '@/components/leave/LeaveDashboard';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import AdminApprovalPanel from '@/components/leave/AdminApprovalPanel';

export default function LeavesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-amber-100">
            {/* Professional Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <button
                    onClick={() => view === 'form' ? setView('dashboard') : router.push('/')}
                    className="hover:scale-110 transition-transform active:scale-95 text-slate-800"
                >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Work-Life Balance</span>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">
                        {view === 'form' ? 'Form Pengajuan' : 'Manajemen Cuti'}
                    </h1>
                </div>
                <div className="w-6"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Status Context Info */}
                <div className="mb-8 p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm border border-slate-100">
                        <Plus size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tight mb-1">Pusat Layanan Cuti</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            {isAdmin
                                ? "Pantau dan setujui permintaan izin atau cuti dari seluruh tim Anda."
                                : "Silakan ajukan izin atau cuti Anda. Proses persetujuan akan diberitahukan segera."
                            }
                        </p>
                    </div>
                </div>

                {isAdmin && view === 'dashboard' && (
                    <div className="mb-10">
                        <AdminApprovalPanel />
                        <div className="my-8 border-t border-slate-100" />
                    </div>
                )}

                <div className="leave-content">
                    {view === 'dashboard' ? (
                        <LeaveDashboard onNewRequest={() => setView('form')} />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <LeaveRequestForm
                                onSuccess={() => setView('dashboard')}
                                onCancel={() => setView('dashboard')}
                            />
                        </div>
                    )}
                </div>

                {/* Secure Badge */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Official HR Protocol Management</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
