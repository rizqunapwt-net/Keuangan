"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { loadModels, getFaceDescriptor } from '@/utils/biometric';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ShieldCheck, Scan, Camera, AlertCircle, Loader2, CheckCircle2, Info } from 'lucide-react';

export default function SetupFacePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [status, setStatus] = useState<'LOADING' | 'READY' | 'CAPTURING' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [error, setError] = useState<string | null>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);

    // 1. Model & Video Initialization
    const init = useCallback(async () => {
        try {
            const loaded = await loadModels();
            if (loaded) {
                setIsModelsLoaded(true);
                await startVideo();
            } else {
                throw new Error('Gagal memuat modul AI.');
            }
        } catch (err: any) {
            setStatus('ERROR');
            setError(err.message || 'Gagal inisialisasi sistem biometrik.');
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) init();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [user, authLoading, router, init]);

    const startVideo = async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 800 }
                }
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus('READY');
            }
        } catch (err) {
            setStatus('ERROR');
            setError('Izin kamera ditolak. Mohon aktifkan kamera di pengaturan perangkat.');
        }
    };

    const handleRegister = async () => {
        if (!videoRef.current || status === 'CAPTURING') return;

        setStatus('CAPTURING');
        setError(null);

        try {
            // Give user a moment to prepare
            await new Promise(resolve => setTimeout(resolve, 500));

            const descriptor = await getFaceDescriptor(videoRef.current);
            if (!descriptor) {
                throw new Error('Wajah tidak terdeteksi. Pastikan wajah terlihat jelas dan pencahayaan cukup.');
            }

            await api.post('/auth/biometric', {
                descriptor: Array.from(descriptor)
            });

            // Success feedback
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
            setStatus('SUCCESS');

            // Redirect after success
            setTimeout(() => router.push('/'), 2500);
        } catch (err: any) {
            setStatus('READY');
            setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat pendaftaran.');
            if ('vibrate' in navigator) navigator.vibrate(200);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-indigo-100">
            {/* Minimalist Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <button onClick={() => router.push('/')} className="hover:scale-110 transition-transform active:scale-95 text-slate-800">
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Security Provision</span>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">Pendaftaran Wajah</h1>
                </div>
                <div className="w-6"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Intro Section */}
                <section className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                        Setup Biometrik
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Daftarkan identitas visual Anda untuk <br/> akses absensi yang aman dan cepat.
                    </p>
                </section>

                {/* Video Container */}
                <section className="relative mb-10">
                    <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl shadow-indigo-100 ring-1 ring-slate-100 border-[8px] border-white transition-all duration-500">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-all duration-1000 ${
                                status === 'READY' ? 'opacity-100' : 'opacity-40 grayscale'
                            }`}
                        />

                        {/* Overlays based on status */}
                        {status === 'READY' && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-x-12 top-1/4 aspect-square border-2 border-white/20 rounded-full flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_4s_ease-in-out_infinite] absolute"></div>
                                    <div className="text-white/10">
                                        <Scan size={80} strokeWidth={0.5} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === 'LOADING' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-md">
                                <Loader2 className="animate-spin text-indigo-500" size={40} />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Menyiapkan AI...</span>
                            </div>
                        )}

                        {status === 'CAPTURING' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-indigo-600/20 backdrop-blur-sm">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <Camera className="absolute inset-0 m-auto text-white" size={24} />
                                </div>
                                <span className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Menganalisis Wajah</span>
                            </div>
                        )}

                        {status === 'SUCCESS' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90 backdrop-blur-xl animate-in fade-in duration-500">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl scale-110 mb-6">
                                    <CheckCircle2 size={56} className="text-green-500" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Berhasil Terdaftar</h3>
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-2">Mengalihkan ke Dashboard...</p>
                            </div>
                        )}
                    </div>

                    {/* Instruction Tag */}
                    {status === 'READY' && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
                            <Info size={14} className="text-indigo-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Posisikan wajah di dalam lingkaran</span>
                        </div>
                    )}
                </section>

                {/* Feedback Messages */}
                {error && (
                    <div className="mb-8 p-5 rounded-[24px] bg-red-50 border border-red-100 flex items-start gap-4 animate-in slide-in-from-top-2">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-[11px] font-bold text-red-700 leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    {status === 'READY' && (
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <button
                                onClick={handleRegister}
                                className="relative w-full h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center transition-all active:scale-[0.98] shadow-xl shadow-indigo-100"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">Identity Lock</span>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={24} />
                                        <span className="text-lg font-black tracking-widest">AMBIL SAMPEL</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full h-16 border-2 border-slate-200 text-slate-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                        >
                            <Loader2 size={16} /> Coba Inisialisasi Ulang
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/')}
                        disabled={status === 'CAPTURING'}
                        className="w-full h-16 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center hover:text-slate-600 transition-colors disabled:opacity-30"
                    >
                        Lewati untuk saat ini
                    </button>
                </div>
            </main>

            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { top: 25%; opacity: 0.1; }
                    50% { top: 75%; opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
