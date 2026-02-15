"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, Info, Plus } from 'lucide-react';
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
        <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-purple-100">
            {/* Professional Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <button
                    onClick={() => view === 'form' ? setView('dashboard') : router.push('/')}
                    className="hover:scale-110 transition-transform active:scale-95 text-slate-800"
                >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em]">Work-Life Balance</span>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">
                        {view === 'form' ? 'Form Pengajuan' : 'Manajemen Cuti'}
                    </h1>
                </div>
                <div className="w-6"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Status Context Info */}
                <div className="mb-8 p-5 rounded-[24px] bg-purple-50 border border-purple-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-purple-500 shadow-sm">
                        <Plus size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-tight mb-1">Pusat Layanan Cuti</h4>
                        <p className="text-[10px] text-purple-700 font-medium leading-relaxed">
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
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official HR Protocol Management</span>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                /* Unified Enterprise White Theme for Leave Components */
                .group.relative.overflow-hidden.rounded-2xl.border.border-white\/10 {
                    background: white !important;
                    border: 1px solid #f1f5f9 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01) !important;
                }
                .text-white { color: #0f172a !important; }
                .text-gray-400 { color: #64748b !important; }
                .bg-white\/5 { background-color: #f8fafc !important; }
                .bg-purple-600 { background-color: #9333ea !important; }

                /* Form Overrides */
                input, textarea, select {
                    background: white !important;
                    border-color: #e2e8f0 !important;
                    color: #0f172a !important;
                    border-radius: 12px !important;
                    font-size: 14px !important;
                }
                label {
                    color: #64748b !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                }
            `}</style>
        </div>
    );
}
