"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Scan,
  Clock,
  MapPin,
  CalendarDays,
  History,
  ShieldCheck,
  LogOut,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Hero Welcome Section */}
      <section className="px-6 pt-4 pb-12 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Halo, {user.username}!</h2>
            <p className="text-xs text-gray-500 font-medium">Semangat untuk hari ini ⚡</p>
          </div>
          <button onClick={logout} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-colors shadow-sm">
            <LogOut size={18} />
          </button>
        </div>

        {/* Status Card */}
        <div className="modern-card p-6 border-amber-100 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Scan size={80} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Waktu Lokal Sekarang</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-8">
              {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
            </h3>

            <Link href="/attendance" className="check-in-btn no-underline">
              <Scan size={32} strokeWidth={2.5} className="text-black mb-2" />
              <span className="text-[10px] font-black uppercase tracking-wider text-black">Presensi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="px-6 -mt-8 mb-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="modern-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Masuk</p>
              <p className="text-sm font-black text-gray-900">08:00</p>
            </div>
          </div>
          <div className="modern-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Cuti Sisa</p>
              <p className="text-sm font-black text-gray-900">12 Hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action List */}
      <section className="px-6 mb-10">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Layanan Cepat</h4>
        <div className="space-y-3">
          <Link href="/attendance/history" className="modern-card p-4 flex items-center justify-between no-underline group hover:border-amber-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                <History size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">Riwayat Absensi</p>
                <p className="text-[10px] text-gray-400 font-medium tracking-tight">Cek kehadiran 30 hari terakhir</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-amber-500" />
          </Link>

          <Link href="/overtime" className="modern-card p-4 flex items-center justify-between no-underline group hover:border-amber-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                <Plus size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">Ajukan Lembur</p>
                <p className="text-[10px] text-gray-400 font-medium tracking-tight">Klaim jam kerja tambahan secara resmi</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-amber-500" />
          </Link>

          <Link href="/payroll" className="modern-card p-4 flex items-center justify-between no-underline group hover:border-amber-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                <Scan size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">Slip Gaji Digital</p>
                <p className="text-[10px] text-gray-400 font-medium tracking-tight">Download rincian pendapatan bulanan</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-amber-500" />
          </Link>
        </div>
      </section>

      {/* Corporate Footnote */}
      <section className="px-10 text-center opacity-30 mt-12 pb-20">
        <img src="/logo.png" alt="Logo" className="grayscale w-24 mx-auto mb-4" />
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-900">
          Official Enterprise Portal • 2026 Edition
        </p>
      </section>
    </div>
  );
}
