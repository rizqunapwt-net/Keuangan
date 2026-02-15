"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { ShieldCheck, User as UserIcon, Lock, ChevronRight, Loader2, Info } from 'lucide-react';

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
            // Added a small delay for smoother transition on high-speed connections
            const response = await api.post('/auth/login', { username, password });
            const { token, user } = response.data;
            if (token && user) {
                login(token, user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Akses ditolak. Cek kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-50/50 to-transparent -z-10"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-100/20 rounded-full blur-3xl -z-10"></div>

            <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Logo Section */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-amber-200/50 flex items-center justify-center border border-amber-50 p-4 transition-transform hover:scale-105 duration-500">
                            <img
                                src="/logo-icon.png"
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl shadow-lg">
                            <ShieldCheck size={16} />
                        </div>
                    </div>

                    <h1 className="text-sm font-black text-amber-600 uppercase tracking-[0.4em] mb-1">Rizquna Elfath</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Management System</p>
                </div>

                {/* Login Form Container */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-white p-8 mb-8 relative">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Login Portal</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Silakan masukkan identitas pegawai</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 animate-in shake duration-500">
                                <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-bold text-red-700 leading-tight">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <UserIcon size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-slate-900 placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-slate-900 placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <span className="text-sm font-black uppercase tracking-[0.2em] ml-2">Otentikasi Akses</span>
                                        <ChevronRight size={20} strokeWidth={3} className="text-amber-500" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Credits */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Global Network Active</span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                        &copy; {new Date().getFullYear()} PT NEW RIZQUNA ELFATH<br />
                        <span className="text-amber-600">Enterprise Attendance Cloud v4.2.0</span>
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-in.shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}
