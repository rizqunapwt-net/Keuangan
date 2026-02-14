'use client';

import React, { useState } from 'react';
import OvertimeDashboard from '@/components/overtime/OvertimeDashboard';
import OvertimeRequestForm from '@/components/overtime/OvertimeRequestForm';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function OvertimePage() {
    const [view, setView] = useState('dashboard');
    const { user } = useAuth();

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#0a0a0c] font-outfit">
            {/* Dynamic Nebula Background */}
            <div className="fixed inset-0 z-0">
                <div className="nebula" />
            </div>

            <div className="relative z-10">
                <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
                        <button onClick={() => window.location.href = '/'} className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            BERANDA
                        </button>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80">
                                PORTAL LEMBUR KORPORAT
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <NotificationDropdown />
                            <div className="hidden md:block text-right">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sesi Aktif</p>
                                <p className="text-xs font-bold">{user?.username}</p>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                    {view === 'dashboard' ? (
                        <OvertimeDashboard onNewRequest={() => setView('form')} />
                    ) : (
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <OvertimeRequestForm
                                onSuccess={() => setView('dashboard')}
                                onCancel={() => setView('dashboard')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
