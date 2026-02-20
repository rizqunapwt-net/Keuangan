'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, ExternalLink, Inbox, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    action_url: string;
    is_read: boolean;
    created_at: string;
}

const NotificationDropdown: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

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
        // Set up a basic interval for real-time-ish feel (every 30s)
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
            >
                <Bell className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-indigo-500 border-2 border-[#0a0a0c] rounded-full flex items-center justify-center text-[8px] font-black text-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 md:w-96 glass-card rounded-[2rem] border border-white/10 bg-[#0a0a0c]/90 backdrop-blur-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Notifikasi</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">Sinyal Sistem Terkini</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                <Check className="h-3 w-3" />
                                BACA SEMUA
                            </button>
                        )}
                    </div>

                    <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center space-y-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/5 border-t-indigo-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gray-700 mb-4">
                                    <Inbox className="h-6 w-6" />
                                </div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Kesenyapan Total</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-5 transition-all hover:bg-white/[0.03] group relative ${notification.is_read ? 'opacity-60' : 'bg-indigo-500/[0.02]'}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center transition-all ${notification.is_read ? 'bg-white/5 text-gray-600' : 'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                <Bell className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={notification.action_url || '#'}
                                                    className="block"
                                                    onClick={() => {
                                                        markAsRead(notification.id);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{notification.title}</h4>
                                                        <span className="text-[8px] font-black text-gray-700 uppercase">{formatTime(notification.created_at)}</span>
                                                    </div>
                                                    <p className="text-[10px] font-medium text-gray-400 leading-relaxed mb-3 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </Link>
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
                                                    >
                                                        TANDAI SUDAH BACA
                                                    </button>
                                                )}
                                            </div>
                                            {notification.action_url && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="h-3 w-3 text-gray-700" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-4 text-center border-t border-white/5 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                    >
                        LIHAT ARSIP LENGKAP
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
