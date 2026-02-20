"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, Info, Plus } from 'lucide-react';
import OvertimeDashboard from '@/components/overtime/OvertimeDashboard';
import OvertimeRequestForm from '@/components/overtime/OvertimeRequestForm';

export default function OvertimePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<'dashboard' | 'form'>('dashboard');

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
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Operational Support</span>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">
                        {view === 'form' ? 'Pengajuan Lembur' : 'Manajemen Lembur'}
                    </h1>
                </div>
                <div className="w-6"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Information Context */}
                <div className="mb-8 p-5 rounded-[24px] bg-amber-50 border border-amber-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                        <Plus size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-tight mb-1">Pusat Layanan Lembur</h4>
                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                            Laporkan jam kerja tambahan Anda untuk memastikan penghitungan upah lembur yang akurat.
                        </p>
                    </div>
                </div>

                <div className="overtime-content">
                    {view === 'dashboard' ? (
                        <OvertimeDashboard onNewRequest={() => setView('form')} />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <OvertimeRequestForm
                                onSuccess={() => setView('dashboard')}
                                onCancel={() => setView('dashboard')}
                            />
                        </div>
                    )}
                </div>

                {/* Secure Badge */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Operational Management</span>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                /* Unified Enterprise White Theme for Overtime Components */
                .glass-card {
                    background: white !important;
                    border: 1px solid #f1f5f9 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01) !important;
                    border-radius: 24px !important;
                    padding: 24px !important;
                }
                .text-white { color: #0f172a !important; }
                .text-gray-400, .text-gray-500, .text-gray-600 { color: #64748b !important; }
                .bg-white\/5 { background-color: #f8fafc !important; }
                .bg-amber-500 { background-color: #f59e0b !important; }

                /* List & Items Overrides */
                .border-white\/5 { border-color: #f1f5f9 !important; }
                .hover\:bg-white\/5:hover { background-color: #f8fafc !important; }
            `}</style>
        </div>
    );
}
