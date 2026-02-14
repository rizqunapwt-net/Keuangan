"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

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
            setError(err.response?.data?.error || err.response?.data?.message || 'Unauthorized Access');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0c]">
            {/* Animated Nebula Background */}
            <div className="nebula" />

            <div className="relative w-full max-w-md px-6 py-8">
                <div className="mb-12 text-center">
                    <h1 className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-5xl font-black tracking-tighter text-transparent">
                        ABSENSI
                    </h1>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/80">
                        EDISI KORPORAT MEWAH
                    </p>
                </div>

                <div className="glass-card group relative overflow-hidden rounded-[2.5rem] p-1 transition-all hover:border-white/20">
                    <div className="rounded-[calc(2.5rem-1px)] bg-[#111114]/40 p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="animate-pulse rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400">
                                    {error === 'Unauthorized Access' ? 'Akses Ditolak' : error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Identitas Pegawai</label>
                                    <input
                                        type="text"
                                        placeholder="Nama Pengguna"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="glass-input w-full rounded-2xl px-5 py-4 text-white outline-none placeholder:text-gray-700"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Kunci Keamanan</label>
                                    <input
                                        type="password"
                                        placeholder="Kata Sandi"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="glass-input w-full rounded-2xl px-5 py-4 text-white outline-none placeholder:text-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 py-5 font-black tracking-[0.2em] text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        MENGOTENTIKASI...
                                    </span>
                                ) : 'MASUK AMAN'}
                            </button>

                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-widest text-gray-600">
                                    Keamanan Perusahaan • Siap Biometrik
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    Didukung oleh Antigravity OS v4.0.1
                </p>
            </div>
        </div>
    );
}
