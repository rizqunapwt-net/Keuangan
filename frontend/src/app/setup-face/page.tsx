"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { loadModels, getFaceDescriptor } from '@/utils/biometric';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SetupFacePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<'LOADING' | 'READY' | 'CAPTURING' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const init = async () => {
            const loaded = await loadModels();
            if (loaded) {
                startVideo();
            } else {
                setStatus('ERROR');
                setError('Gagal memuat modul AI.');
            }
        };

        if (user) init();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [user, authLoading, router]);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus('READY');
            }
        } catch (err) {
            setStatus('ERROR');
            setError('Izin kamera ditolak atau tidak ditemukan.');
        }
    };

    const handleRegister = async () => {
        if (!videoRef.current) return;
        setStatus('CAPTURING');
        setError(null);

        try {
            const descriptor = await getFaceDescriptor(videoRef.current);
            if (!descriptor) {
                throw new Error('Wajah tidak terdeteksi. Pastikan wajah terlihat jelas di kamera.');
            }

            await api.post('/auth/biometric', {
                descriptor: Array.from(descriptor)
            });

            setStatus('SUCCESS');
            setTimeout(() => router.push('/'), 2000);
        } catch (err: any) {
            setStatus('READY');
            setError(err.message || 'Terjadi kesalahan saat pendaftaran.');
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
            <div className="nebula" />

            <main className="relative z-10 max-w-2xl mx-auto py-20 px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent uppercase">
                        Setup <span className="text-indigo-500">Face ID</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Inisialisasi Keamanan Biometrik</p>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden p-8 flex flex-col items-center">
                    <div className="relative w-full max-w-md aspect-square rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 mb-8">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                        />
                        {status === 'LOADING' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
                            </div>
                        )}
                        {status === 'SUCCESS' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-500 text-white mb-4 animate-bounce">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-xl font-black tracking-tighter">FACE ID AKTIF</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="w-full mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <div className="w-full space-y-4">
                        {status === 'READY' && (
                            <button
                                onClick={handleRegister}
                                className="w-full py-5 rounded-[1.25rem] bg-indigo-600 text-xs font-black tracking-[0.2em] text-white hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                DAFTARKAN WAJAH
                            </button>
                        )}
                        {status === 'CAPTURING' && (
                            <button
                                disabled
                                className="w-full py-5 rounded-[1.25rem] bg-white/5 text-xs font-black tracking-[0.2em] text-gray-500 cursor-not-allowed"
                            >
                                MENGANALISIS...
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-5 rounded-[1.25rem] border border-white/10 text-xs font-black tracking-[0.2em] text-white hover:bg-white/5 transition-all"
                        >
                            BATALKAN
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                    Data biometrik dienkripsi secara lokal & disinkronkan aman.
                </div>
            </main>
        </div>
    );
}
