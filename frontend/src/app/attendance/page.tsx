"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { loadModels, getFaceDescriptor, compareFaceDescriptors } from '@/utils/biometric';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, MapPin, Camera, Scan, CheckCircle2, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';

export default function AttendancePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<'NOT_EMPLOYEE' | 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT'>('NOT_CHECKED_IN');
    const [location, setLocation] = useState('Mengambil lokasi...');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isFaceVerified, setIsFaceVerified] = useState(false);
    const [isFaceLoading, setIsFaceLoading] = useState(true);
    const [hasTriggered, setHasTriggered] = useState(false);

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
                        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                        setErrorMessage(null);
                    },
                    (error) => {
                        if (error.code === 1) setLocation("Izin Lokasi Ditolak");
                        else if (error.code === 2) setLocation("Sinyal GPS Lemah");
                        else if (error.code === 3 && highAccuracy) fetchGPS(false);
                        else setLocation("Sensor GPS Error");
                    },
                    { enableHighAccuracy: highAccuracy, timeout: 8000, maximumAge: 0 }
                );
            } else {
                setLocation("GPS Tidak Didukung");
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
        if (loaded) startVideo();
        setIsFaceLoading(false);
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            setErrorMessage("Gagal mengakses kamera. Mohon izinkan akses kamera.");
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
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isFaceVerified, user]);

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
            setErrorMessage(err.response?.data?.message || 'Sinkronisasi gagal. Coba lagi.');
        } finally {
            setActionLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Presensi Kehadiran</h1>
                <div className="w-10"></div>
            </div>

            <main className="px-6 py-8">
                {/* Time Section */}
                <div className="text-center mb-8">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-1">
                        {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
                    </h2>
                    <p className="text-xs text-amber-500 font-black uppercase tracking-[0.2em]">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Camera / Biometric Section */}
                <div className="modern-card p-4 mb-6 bg-gray-50 border-gray-100 overflow-hidden">
                    <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-black shadow-inner">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-all duration-700 ${isFaceVerified ? 'brightness-110 contrast-110' : 'brightness-50 grayscale'}`}
                        />

                        {/* Overlay Scan UI */}
                        <div className="absolute inset-0 border-[16px] border-black/10 rounded-[24px]"></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {!isFaceVerified ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-48 h-48 border-2 border-dashed border-amber-400/50 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                                        <div className="w-40 h-40 border-2 border-white/20 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                                        Posisikan Wajah Anda
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-green-500/90 backdrop-blur-md p-4 rounded-full text-white animate-in zoom-in duration-300">
                                    <CheckCircle2 size={48} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Information */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${coords ? 'bg-amber-100 text-amber-600' : 'bg-red-50 text-red-400'}`}>
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Lokasi Presensi</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{location}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFaceVerified ? 'bg-green-100 text-green-600' : 'bg-amber-50 text-amber-400'}`}>
                            <Scan size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Status Biometrik</p>
                            <p className="text-sm font-bold text-gray-800">
                                {isFaceVerified ? 'Identitas Terkonfirmasi' : 'Verifikasi Dibutuhkan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Box */}
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-red-600 leading-tight">{errorMessage}</p>
                    </div>
                )}

                {/* Action Button */}
                {status !== 'CHECKED_OUT' ? (
                    <button
                        onClick={handleAction}
                        disabled={actionLoading || !isFaceVerified || (!coords && status === 'NOT_CHECKED_IN')}
                        className={`btn-primary h-20 flex items-center justify-center gap-3 transition-all ${status === 'CHECKED_IN' ? 'bg-gray-900 shadow-gray-900/10' : ''}`}
                    >
                        {actionLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <Scan size={24} />
                                <span className="text-lg font-black tracking-widest">
                                    {status === 'NOT_CHECKED_IN' ? 'CHECK-IN SEKARANG' : 'CHECK-OUT SEKARANG'}
                                </span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 text-center">
                        <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Presensi Selesai</p>
                        <p className="text-xs text-gray-500 font-medium">Data Anda telah tersimpan secara aman.</p>
                    </div>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest active:text-amber-500 transition-colors"
                >
                    <RefreshCcw size={14} />
                    Kalibrasi Ulang Perangkat
                </button>
            </main>
        </div>
    );
}
