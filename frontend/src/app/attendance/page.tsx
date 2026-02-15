"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { loadModels, getFaceDescriptor, compareFaceDescriptors } from '@/utils/biometric';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, MapPin, Camera, Scan, CheckCircle2, AlertCircle, Loader2, RefreshCcw, UserCheck } from 'lucide-react';

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
        <div className="min-h-screen bg-white pb-24">
            {/* Header Navigation */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-4">
                <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500 hover:text-amber-500 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">Presensi Kehadiran</h1>
                <div className="w-10"></div>
            </div>

            <main className="px-6 py-8 md:max-w-xl md:mx-auto">
                {/* Time Display Section */}
                <div className="text-center mb-10">
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-1">
                        {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
                    </h2>
                    <p className="text-xs text-amber-500 font-black uppercase tracking-[0.2em]">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Video/Scan Section - Clean Redesign */}
                <div className="modern-card p-3 mb-8 bg-white border-amber-100 overflow-hidden relative">
                    <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-50 border border-slate-100">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-all duration-700 ${isFaceVerified ? 'brightness-105' : 'brightness-90'}`}
                        />

                        {/* Scan UI Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            {!isFaceVerified ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-56 h-56 border-2 border-dashed border-amber-400/40 rounded-full animate-[spin_15s_linear_infinite] flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-amber-400/5 rounded-full pulse-slow"></div>
                                        <div className="w-48 h-48 border border-white/40 rounded-full"></div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-md border border-amber-100 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                                        <Scan size={18} className="text-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                            Scanning Identitas...
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                                    <div className="bg-green-500 p-6 rounded-full text-white shadow-2xl shadow-green-200">
                                        <UserCheck size={48} />
                                    </div>
                                    <div className="bg-white/95 px-6 py-3 rounded-2xl shadow-xl border border-green-100">
                                        <span className="text-xs font-black text-green-600 uppercase tracking-widest">
                                            Identitas Terverifikasi
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Tiles */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${coords ? 'bg-white text-blue-500' : 'bg-white text-red-500'}`}>
                            <MapPin size={22} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">Sinyal Navigasi Satelit</p>
                            <p className="text-sm font-bold text-slate-700 truncate">{location}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isFaceVerified ? 'bg-white text-green-500' : 'bg-white text-amber-500'}`}>
                            <Scan size={22} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">Protokol Biometrik</p>
                            <p className="text-sm font-bold text-slate-700">
                                {isFaceVerified ? 'Sistem Aktif • Akses Diberikan' : 'Sistem Siap • Menunggu Scan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-10 p-5 rounded-3xl bg-red-50 border border-red-100 flex items-start gap-4">
                        <div className="bg-red-500 p-1.5 rounded-lg text-white">
                            <AlertCircle size={18} />
                        </div>
                        <p className="text-xs font-bold text-red-700 leading-tight pt-1">{errorMessage}</p>
                    </div>
                )}

                {/* Main Action Trigger */}
                {status !== 'CHECKED_OUT' ? (
                    <button
                        onClick={handleAction}
                        disabled={actionLoading || !isFaceVerified || (!coords && status === 'NOT_CHECKED_IN')}
                        className={`btn-primary h-20 relative flex items-center justify-center transition-all ${status === 'CHECKED_IN' ? 'bg-slate-700 hover:bg-slate-800 shadow-slate-200' : ''}`}
                    >
                        {actionLoading ? (
                            <Loader2 className="animate-spin text-white" size={28} />
                        ) : (
                            <div className="flex items-center gap-4">
                                <Scan size={28} className={status === 'CHECKED_IN' ? 'text-white' : 'text-slate-800'} />
                                <span className={`text-lg font-black tracking-[0.15em] ${status === 'CHECKED_IN' ? 'text-white' : 'text-slate-800'}`}>
                                    {status === 'NOT_CHECKED_IN' ? 'CHECK-IN' : 'CHECK-OUT'}
                                </span>
                            </div>
                        )}
                        {!isFaceVerified && !actionLoading && (
                            <div className="absolute -top-3 right-4 bg-slate-800 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                Locked
                            </div>
                        )}
                    </button>
                ) : (
                    <div className="p-10 rounded-[2.5rem] bg-green-50 border border-green-100 text-center animate-in fade-in duration-700">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-green-500 shadow-sm mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <p className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">Berhasil Disimpan</p>
                        <p className="text-xs text-slate-500 font-medium">Data absensi harian Anda telah masuk ke arsip pusat.</p>
                    </div>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="w-full mt-10 py-4 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-amber-500 transition-colors active:scale-95 duration-200"
                >
                    <RefreshCcw size={16} />
                    Sync Ulang Perangkat
                </button>
            </main>
        </div>
    );
}
