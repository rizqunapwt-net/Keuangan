"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { ShieldCheck, User as UserIcon, Lock, ChevronRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user } = response.data;
            if (token && user) {
                login(token, user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Akses tidak diizinkan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <img
                        src="/logo.png"
                        alt="New Rizquna Elfath"
                        className="h-24 mx-auto object-contain mb-4 animate-in fade-in zoom-in duration-700"
                    />
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 mb-2">
                        <ShieldCheck className="text-amber-500" size={12} />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Akses Terenkripsi</span>
                    </div>
                </div>

                {/* Login Form */}
                <div className="space-y-6">
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Selamat Datang</h2>
                        <p className="text-sm text-gray-500 font-medium">Silakan masuk untuk melanjutkan absensi</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center text-xs font-semibold text-red-500 animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Username / ID Pegawai"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-gray-900"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                placeholder="Kata Sandi"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-gray-900"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Masuk Sekarang</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="pt-6 text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 py-2 rounded-lg">
                                Rizquna Elfath Attendance Hub • v4.2
                            </p>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} PT New Rizquna Elfath.<br />
                        <span className="font-medium italic">"Anda punya ide, kami wujudkan"</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
