'use client';

import React, { useState } from 'react';
import LeaveDashboard from '@/components/leave/LeaveDashboard';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import AdminApprovalPanel from '@/components/leave/AdminApprovalPanel';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeavesPage() {
    const [view, setView] = useState('dashboard');
    const { user } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-6 py-4">
                <button onClick={() => setView('dashboard')} className={`p-2 -ml-2 text-gray-400 ${view === 'dashboard' ? 'opacity-0 pointer-events-none' : ''}`}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    {isAdmin ? 'Persetujuan Cuti' : 'Pengajuan Cuti'}
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="px-6 py-8">
                {isAdmin && view === 'dashboard' && (
                    <div className="mb-10 animate-in fade-in duration-500">
                        <AdminApprovalPanel />
                        <div className="my-10 border-t border-gray-50" />
                    </div>
                )}

                {view === 'dashboard' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <LeaveDashboard onNewRequest={() => setView('form')} />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <LeaveRequestForm
                            onSuccess={() => setView('dashboard')}
                            onCancel={() => setView('dashboard')}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
