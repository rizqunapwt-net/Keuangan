"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { loadModels, getFaceDescriptor, compareFaceDescriptors } from '@/utils/biometric';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { id } from 'date-fns/locale';

export default function AttendancePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<'NOT_EMPLOYEE' | 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT'>('NOT_CHECKED_IN');
    const [location, setLocation] = useState('Mencari Sinyal GPS...');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isFaceVerified, setIsFaceVerified] = useState(false);
    const [isFaceLoading, setIsFaceLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchGPS = (highAccuracy: boolean) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCoords({ lat: latitude, lng: longitude });
                        setLocation(`Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                        setErrorMessage(null);
                    },
                    (error) => {
                        console.error("GPS Error Details:", {
                            code: error.code,
                            message: error.message
                        });

                        if (error.code === 1) { // PERMISSION_DENIED
                            setLocation("Izin GPS Ditolak");
                            setErrorMessage("Mohon aktifkan izin lokasi di pengaturan browser & perangkat Boss.");
                        } else if (error.code === 2) { // POSITION_UNAVAILABLE
                            setLocation("Lokasi Tidak Tersedia");
                            setErrorMessage("Sinyal GPS lemah atau tidak tersedia. Pastikan Boss di area terbuka.");
                        } else if (error.code === 3 && highAccuracy) { // TIMEOUT
                            // High accuracy timed out, try low accuracy
                            console.log("GPS Timeout: Retrying with low accuracy...");
                            fetchGPS(false);
                        } else if (error.code === 3) {
                            setLocation("GPS Timeout");
                            setErrorMessage("Waktu pengambilan lokasi habis. Coba muat ulang halaman.");
                        } else {
                            setLocation("Sensor GPS Error");
                            setErrorMessage(`Terjadi gangguan pada sensor lokasi (Error ${error.code}).`);
                        }
                    },
                    {
                        enableHighAccuracy: highAccuracy,
                        timeout: highAccuracy ? 8000 : 15000,
                        maximumAge: 0
                    }
                );
            } else {
                setLocation("Browsermu Tidak Support GPS");
            }
        };

        fetchGPS(true);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchStatus();
            initBiometric();
        }
    }, [user, authLoading, router]);

    const initBiometric = async () => {
        const loaded = await loadModels();
        if (loaded) {
            startVideo();
        }
        setIsFaceLoading(false);
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Camera Error:", err);
            setErrorMessage("Gagal mengakses kamera untuk verifikasi biometrik.");
        }
    };

    useEffect(() => {
        if (!isFaceVerified && videoRef.current && user?.face_descriptor) {
            const interval = setInterval(async () => {
                const descriptor = await getFaceDescriptor(videoRef.current!);
                if (descriptor) {
                    const savedDescriptor = JSON.parse(user.face_descriptor!);
                    const match = compareFaceDescriptors(Array.from(descriptor), savedDescriptor);
                    if (match) {
                        setIsFaceVerified(true);
                        clearInterval(interval);
                    }
                }
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [isFaceVerified, user]);

    const [hasTriggered, setHasTriggered] = useState(false);

    // Auto-trigger when verified
    useEffect(() => {
        if (isFaceVerified && coords && status === 'NOT_CHECKED_IN' && !actionLoading && !hasTriggered) {
            setHasTriggered(true);
            handleAction();
        }
    }, [isFaceVerified, coords, status, actionLoading, hasTriggered]);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/attendance/status');
            setStatus(res.data.status);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        setActionLoading(true);
        try {
            const endpoint = status === 'NOT_CHECKED_IN' ? '/attendance/check-in' : '/attendance/check-out';
            const locationString = coords ? `${coords.lat},${coords.lng}` : location;
            await api.post(endpoint, { location: locationString, photo: "" });
            setErrorMessage(null);
            await fetchStatus();
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Gagal dalam sinkronisasi protokol absensi.');
        } finally {
            setActionLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
            </div>
        );
    }

    const getTimeString = () => {
        return currentTime.toLocaleTimeString('id-ID', { hour12: false });
    };

    const getDateString = () => {
        return currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const translateStatus = (s: string) => {
        switch (s) {
            case 'NOT_CHECKED_IN': return 'BELUM ABSEN';
            case 'CHECKED_IN': return 'SUDAH MASUK';
            case 'CHECKED_OUT': return 'SUDAH PULANG';
            default: return s;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden relative">
            {/* Animated Nebula Background */}
            <div className="nebula" />

            <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
                    <button onClick={() => router.push('/')} className="group flex items-center gap-2 text-[10px] md:text-sm font-bold text-gray-400 hover:text-white transition-colors">
                        <svg className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        KEMBALI KE HUB
                    </button>
                    <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-indigo-500/80">Stasiun Waktu</span>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Operator Aktif</p>
                        <p className="text-sm font-medium">{user?.username}</p>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-12 md:py-20 px-4 md:px-6">
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent">{getTimeString()}</h2>
                    <p className="text-indigo-500 font-extrabold tracking-[0.4em] uppercase text-[10px] md:text-sm">{getDateString()}</p>
                </div>

                <div className="glass-card relative group p-1 rounded-[3rem] transition-all hover:border-white/20">
                    <div className="bg-[#111114]/40 rounded-[calc(3rem-1px)] p-8 md:p-14 text-center">
                        <div className="mb-8 md:mb-10">
                            <div className={`mx-auto inline-flex px-3 py-1 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6 
                        ${status === 'CHECKED_IN' ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'}`}>
                                {translateStatus(status)}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                                {status === 'NOT_CHECKED_IN' ? 'Menunggu Protokol Masuk' :
                                    status === 'CHECKED_IN' ? 'Protokol Sesi Aktif' : 'Protokol Selesai'}
                            </h3>

                            <div className="glass-card bg-white/5 rounded-3xl p-5 max-w-sm mx-auto flex items-center gap-5 transition-all hover:bg-white/10">
                                <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${coords ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Status Lokasi</p>
                                    <p className="text-xs font-bold text-gray-300 truncate w-48 md:w-auto text-balance whitespace-normal">{location}</p>
                                </div>
                            </div>

                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 mb-8 mx-auto max-w-sm">
                                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transition-all duration-1000 ${isFaceVerified ? 'grayscale-0' : 'grayscale brightness-50'}`} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    {!isFaceVerified ? (
                                        <>
                                            <div className="h-10 w-10 border-2 border-indigo-500/50 border-t-white animate-spin rounded-full mb-2" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Memverifikasi Wajah...</p>
                                        </>
                                    ) : (
                                        <div className="bg-green-500/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-bounce">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Wajah Terverifikasi</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <p className="text-xs font-bold text-red-400 text-left">{errorMessage}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            {status === 'NOT_CHECKED_IN' || status === 'CHECKED_IN' ? (
                                <button
                                    onClick={handleAction}
                                    disabled={actionLoading || (!coords && status === 'NOT_CHECKED_IN') || !isFaceVerified}
                                    className={`group relative w-full overflow-hidden rounded-[2rem] py-8 transition-all active:scale-95 disabled:opacity-50 shadow-2xl
                                ${status === 'NOT_CHECKED_IN' ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-indigo-500/20' : 'bg-white text-black shadow-white/10'}`}
                                >
                                    <span className="relative z-10 text-xl font-black tracking-[0.3em] uppercase">
                                        {actionLoading ? 'MENYINKRONKAN...' : status === 'NOT_CHECKED_IN' ? 'MULAI SESI' : 'AKHIRI SESI'}
                                    </span>
                                </button>
                            ) : (
                                <div className="p-8 rounded-2xl border border-white/5 bg-white/5 w-full italic text-gray-500 text-sm">
                                    Sesi hari ini telah selesai secara aman.
                                </div>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="text-[10px] font-black text-gray-700 hover:text-indigo-500 transition-colors uppercase tracking-[0.3em]">
                                Kalibrasi Ulang Sensor
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { label: 'Enkripsi', val: 'AES-256' },
                        { label: 'Status', val: 'Online' },
                        { label: 'Relay', val: 'Simpul 18' },
                        { label: 'Latensi', val: '14ms' },
                        { label: 'Tindakan', val: 'Manajemen Cuti', href: '/leaves' }
                    ].map((stat, i) => (
                        <div
                            key={i}
                            onClick={() => stat.href && router.push(stat.href)}
                            className={`p-4 rounded-2xl border border-white/5 bg-white/5 text-center transition-all hover:bg-white/[0.08] ${stat.href ? 'cursor-pointer hover:border-purple-500/30' : ''}`}
                        >
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-tighter mb-1">{stat.label}</p>
                            <p className={`text-[11px] md:text-xs font-bold ${stat.href ? 'text-purple-400' : 'text-gray-400'}`}>{stat.val}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
