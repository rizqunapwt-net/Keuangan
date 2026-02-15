"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { loadModels, getFaceDescriptor, compareFaceDescriptors } from '@/utils/biometric';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, MapPin, Scan, CheckCircle2, AlertCircle, Loader2, RefreshCcw, UserCheck, ShieldCheck } from 'lucide-react';

export default function AttendancePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // UI State
    const [status, setStatus] = useState<'NOT_EMPLOYEE' | 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT'>('NOT_CHECKED_IN');
    const [location, setLocation] = useState('Mengambil lokasi...');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Biometric State
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isFaceVerified, setIsFaceVerified] = useState(false);
    const [isFaceLoading, setIsFaceLoading] = useState(true);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    // 1. Clock Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Optimized GPS Fetching
    const fetchGPS = useCallback((highAccuracy: boolean = true) => {
        if (!("geolocation" in navigator)) {
            setLocation("GPS Tidak Didukung");
            return;
        }

        const options = {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                setErrorMessage(null);
            },
            (error) => {
                console.error("GPS Error:", error);
                if (error.code === 1) setLocation("Izin Lokasi Diperlukan");
                else if (error.code === 2) setLocation("Sinyal GPS Lemah");
                else if (error.code === 3 && highAccuracy) fetchGPS(false); // Fallback to low accuracy
                else setLocation("Sensor GPS Error");
            },
            options
        );
    }, []);

    useEffect(() => {
        fetchGPS(true);
    }, [fetchGPS]);

    // 3. Auth & Initial Status Check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchStatus();
            initBiometric();
        }

        // Cleanup function for camera stream
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [user, authLoading, router]);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/attendance/status');
            setStatus(res.data.status);
        } catch (err) {
            console.error("Status check failed:", err);
            setErrorMessage("Gagal sinkronisasi status dari server.");
        } finally {
            setLoading(false);
        }
    };

    // 4. Biometric Workflow
    const initBiometric = async () => {
        try {
            const loaded = await loadModels();
            if (loaded) {
                setIsModelsLoaded(true);
                await startVideo();
            }
        } catch (err) {
            setErrorMessage("Gagal memuat sistem biometrik.");
        } finally {
            setIsFaceLoading(false);
        }
    };

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
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setErrorMessage("Kamera diblokir. Mohon izinkan akses kamera di pengaturan browser/HP.");
        }
    };

    // Continuous Face Detection with Cleanup
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!isFaceVerified && isModelsLoaded && videoRef.current && user?.face_descriptor) {
            interval = setInterval(async () => {
                if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

                const descriptor = await getFaceDescriptor(videoRef.current);
                if (descriptor) {
                    try {
                        const savedDescriptor = JSON.parse(user.face_descriptor!);
                        const match = compareFaceDescriptors(Array.from(descriptor), savedDescriptor);
                        if (match) {
                            setIsFaceVerified(true);
                            // Optional: Add haptic feedback if available (mobile support)
                            if ('vibrate' in navigator) navigator.vibrate(100);
                        }
                    } catch (e) {
                        console.error("Descriptor parsing error");
                    }
                }
            }, 800);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isFaceVerified, isModelsLoaded, user]);

    // Auto-Trigger for Check-in
    useEffect(() => {
        if (isFaceVerified && coords && status === 'NOT_CHECKED_IN' && !actionLoading && !hasTriggered) {
            setHasTriggered(true);
            handleAction();
        }
    }, [isFaceVerified, coords, status, actionLoading, hasTriggered]);

    const handleAction = async () => {
        if (actionLoading) return;
        setActionLoading(true);

        try {
            const endpoint = status === 'NOT_CHECKED_IN' ? '/attendance/check-in' : '/attendance/check-out';
            const locationString = coords ? `${coords.lat},${coords.lng}` : location;

            await api.post(endpoint, {
                location: locationString,
                photo: "", // Can be extended to send a snapshot
                timestamp: new Date().toISOString()
            });

            setErrorMessage(null);
            await fetchStatus();

            // Success Vibration
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gagal mengirim data. Pastikan koneksi internet stabil.';
            setErrorMessage(msg);
            setHasTriggered(false); // Allow retry
        } finally {
            setActionLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                    <ShieldCheck className="absolute inset-0 m-auto text-amber-500/30" size={24} />
                </div>
                <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Server...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-amber-100">
            {/* Minimalist Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <button onClick={() => router.push('/')} className="hover:scale-110 transition-transform active:scale-95 text-slate-800">
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Identity Protocol</span>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">Terminal Absensi</h1>
                </div>
                <div className="w-6"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Dynamic Clock Section */}
                <section className="text-center mb-10 group">
                    <div className="inline-block relative">
                        <h2 className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">
                            {currentTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            <span className="text-2xl text-slate-300 ml-1">:{currentTime.getSeconds().toString().padStart(2, '0')}</span>
                        </h2>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 mt-2">
                        <span className="w-8 h-[1px] bg-slate-200"></span>
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className="w-8 h-[1px] bg-slate-200"></span>
                    </p>
                </section>

                {/* Video Biometric Canvas */}
                <section className="relative mb-10">
                    <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-200 ring-1 ring-slate-100 border-[8px] border-white">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-opacity duration-1000 ${isFaceLoading ? 'opacity-0' : 'opacity-100'}`}
                        />

                        {/* Overlay: Scanning UI */}
                        {!isFaceVerified ? (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/40">
                                <div className="absolute inset-x-8 top-1/4 aspect-square border-2 border-white/20 rounded-[60px] flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-[scan_3s_ease-in-out_infinite] absolute"></div>
                                    <div className="text-white/30">
                                        <Scan size={64} strokeWidth={1} />
                                    </div>
                                </div>
                                <div className="absolute bottom-8 inset-x-0 text-center">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Menunggu Deteksi Wajah</p>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-500">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl scale-110">
                                    <UserCheck size={48} className="text-green-500" />
                                </div>
                                <p className="mt-6 text-xs font-black text-white bg-green-500 px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">Verified</p>
                            </div>
                        )}

                        {isFaceLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white/20" size={40} />
                            </div>
                        )}
                    </div>
                </section>

                {/* Live Data Diagnostics */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:border-amber-100">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${coords ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                            <MapPin size={20} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Presisi</p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{location}</p>
                    </div>

                    <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:border-amber-100">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${isFaceVerified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            <Scan size={20} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Biometrik</p>
                        <p className="text-[11px] font-bold text-slate-700">
                            {isFaceVerified ? 'TERKONFIRMASI' : 'MENUNGGU SCAN'}
                        </p>
                    </div>
                </div>

                {/* Alerts */}
                {errorMessage && (
                    <div className="mb-8 p-5 rounded-[24px] bg-red-50 border border-red-100 flex items-start gap-4 animate-in slide-in-from-top-2">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-[11px] font-bold text-red-700 leading-relaxed">{errorMessage}</p>
                    </div>
                )}

                {/* Action Interface */}
                {status !== 'CHECKED_OUT' ? (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <button
                            onClick={handleAction}
                            disabled={actionLoading || !isFaceVerified || (!coords && status === 'NOT_CHECKED_IN')}
                            className={`relative w-full h-24 rounded-[32px] flex items-center justify-center transition-all active:scale-[0.98] shadow-xl ${
                                status === 'CHECKED_IN'
                                ? 'bg-slate-900 text-white shadow-slate-200'
                                : 'bg-amber-400 text-slate-900 shadow-amber-100'
                            } disabled:opacity-50 disabled:grayscale disabled:pointer-events-none`}
                        >
                            {actionLoading ? (
                                <Loader2 className="animate-spin" size={32} />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">Tap to Execute</span>
                                    <div className="flex items-center gap-3">
                                        <Scan size={28} />
                                        <span className="text-xl font-black tracking-widest">
                                            {status === 'NOT_CHECKED_IN' ? 'CHECK-IN' : 'CHECK-OUT'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="p-10 rounded-[40px] bg-white border border-slate-100 text-center shadow-xl shadow-slate-100/50">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 scale-110">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Shift Selesai</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
                            Data kehadiran hari ini telah berhasil <br/> diamankan dalam database.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => {
                        window.location.reload();
                    }}
                    className="w-full mt-12 flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-amber-500 transition-all active:scale-95"
                >
                    <RefreshCcw size={16} />
                    Reset & Sync Perangkat
                </button>
            </main>

            {/* Global Style Inject for Scan Animation */}
            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { top: 0%; opacity: 0.2; }
                    50% { top: 100%; opacity: 1; }
                }
                .pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
