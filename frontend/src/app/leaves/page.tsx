'use client';

import React, { useState } from 'react';
import LeaveDashboard from '@/components/leave/LeaveDashboard';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import AdminApprovalPanel from '@/components/leave/AdminApprovalPanel';
import { useAuth } from '@/context/AuthContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function LeavesPage() {
    const [view, setView] = useState('dashboard');
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#0a0a0c] font-outfit">
            {/* Dynamic Nebula Background */}
            <div className="fixed inset-0 z-0">
                <div className="nebula" />
            </div>

            <div className="relative z-10">
                <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
                        <button onClick={() => window.location.href = '/attendance'} className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                            <svg className="h-3 w-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            ABSENSI
                        </button>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/80">
                                {isAdmin ? 'ADMIN PANEL CUTI' : 'PORTAL CUTI EKSKLUSIF'}
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
                    {isAdmin && view === 'dashboard' && (
                        <div className="mb-12">
                            <AdminApprovalPanel />
                            <div className="my-16 border-t border-white/5" />
                        </div>
                    )}

                    {view === 'dashboard' ? (
                        <LeaveDashboard onNewRequest={() => setView('form')} />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <LeaveRequestForm
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
