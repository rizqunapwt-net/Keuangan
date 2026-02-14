'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Bell, ArrowLeft, Check, Trash2, Calendar, Clock, Inbox, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    action_url: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user?.employee?.id) return;
        setLoading(true);
        try {
            const response = await api.get(`/api/notifications?employeeId=${user.employee.id}`);
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.employee?.id) return;
        try {
            await api.patch('/api/notifications/read-all', { employeeId: user.employee.id });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white relative overflow-hidden">
            {/* Animated Nebula Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-white" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter uppercase italic">
                                    ARSIP <span className="text-indigo-500">NOTIFIKASI</span>
                                </h1>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">ELITE MASTER SUITE</p>
                            </div>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
                        >
                            <Check className="h-4 w-4" />
                            TANDAI SEMUA SUDAH BACA
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto py-12 px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/5 border-t-indigo-500" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Mengunduh transmisi...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="glass-card rounded-[3rem] p-24 text-center border border-white/5">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-indigo-500/10 text-indigo-400 mb-8">
                            <Inbox className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Kotak Masuk Steril</h2>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                            Belum ada notifikasi sistem yang dikirimkan ke akun Anda saat ini. Seluruh status operasional terlihat aman.
                        </p>
                        <Link href="/" className="mt-12 inline-flex px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-sm font-black uppercase tracking-widest">
                            KEMBALI KE DASHBOARD
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`glass-card rounded-[2rem] p-8 border transition-all hover:scale-[1.01] duration-300 relative group overflow-hidden ${notification.is_read ? 'border-white/5 bg-white/[0.01]' : 'border-indigo-500/30 bg-indigo-500/[0.03]'
                                    }`}
                            >
                                {!notification.is_read && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10" />
                                )}

                                <div className="flex flex-col md:flex-row md:items-center gap-8">
                                    <div className={`h-16 w-16 rounded-2xl shrink-0 flex items-center justify-center transition-all ${notification.is_read ? 'bg-white/5 text-gray-700' : 'bg-indigo-500/20 text-indigo-400'
                                        }`}>
                                        <Bell className="h-8 w-8" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`text-lg font-black uppercase tracking-tight truncate ${notification.is_read ? 'text-gray-400' : 'text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest shrink-0 ml-4">
                                                <span className="flex items-center gap-1.5 backdrop-blur-md bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(notification.created_at), 'dd MMM yyyy', { locale: id })}
                                                </span>
                                                <span className="flex items-center gap-1.5 backdrop-blur-md bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(notification.created_at), 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed mb-6 ${notification.is_read ? 'text-gray-500' : 'text-gray-300'}`}>
                                            {notification.message}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            {notification.action_url && (
                                                <Link
                                                    href={notification.action_url}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    LIHAT DETAIL
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 p-2"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    TANDAI SUDAH BACA
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer decoration */}
            <div className="py-24 text-center">
                <p className="text-[10px] font-black text-gray-800 uppercase tracking-[0.5em]">ELITE MASTER SUITE TRANSMISSION END</p>
            </div>
        </div>
    );
}
