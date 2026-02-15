"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Scan,
  Clock,
  CalendarDays,
  History,
  LogOut,
  Plus,
  ArrowRight,
  UserCheck,
  Bell
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
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-50 border-t-amber-500" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="bg-[#fdfdfd] min-h-screen pb-24">
      {/* Top Header */}
      <header className="px-6 pt-6 pb-12 bg-gradient-to-b from-amber-50/40 to-transparent">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-amber-100 flex items-center justify-center overflow-hidden p-1.5">
              <img src="/logo-icon.png" alt="Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[10px] font-black tracking-[0.2em] text-amber-600 uppercase">Master Suite</h1>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">v4.2 Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-amber-500 transition-all shadow-sm">
              <Bell size={18} />
            </button>
            <button onClick={logout} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Halo, {user.username}!</h2>
          <p className="text-xs text-gray-400 font-medium">Selamat beraktivitas di PT New Rizquna Elfath ✨</p>
        </div>

        {/* Hero Clock Card */}
        <div className="modern-card p-8 border-amber-50 relative overflow-hidden bg-white shadow-xl shadow-amber-500/5">
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] rotate-12">
            <Scan size={200} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700">Waktu Server Terkoneksi</p>
            </div>
            <h3 className="text-5xl font-black text-slate-800 tracking-tighter mb-8 tabular-nums">
              {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
            </h3>

            <Link href="/attendance" className="group flex items-center gap-4 bg-amber-500 hover:bg-amber-400 text-slate-900 px-10 py-5 rounded-[2rem] transition-all no-underline shadow-lg shadow-amber-500/20 active:scale-95 duration-200">
              <Scan size={24} className="animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest">Mulai Presensi</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="px-6 -mt-6 mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-[360px]">
          <div className="modern-card p-5 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mb-0.5">Shift Masuk</p>
              <p className="text-base font-black text-slate-800 tracking-tight">08:00</p>
            </div>
          </div>
          <div className="modern-card p-5 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mb-0.5">Sisa Cuti</p>
              <p className="text-base font-black text-slate-800 tracking-tight">12 Hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="px-6 mb-12">
        <div className="flex justify-between items-end mb-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Hub Layanan Mandiri</h4>
          <div className="w-8 h-px bg-slate-100 mb-1"></div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link href="/attendance/history" className="modern-card p-5 flex items-center gap-4 no-underline group hover:border-amber-300 transition-all bg-white">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-300">
              <History size={26} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800 leading-tight mb-1">Riwayat Absensi</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">Rekap Jejak Kehadiran</p>
            </div>
            <ArrowRight size={16} className="text-slate-200 group-hover:text-amber-500 transition-colors" />
          </Link>

          <Link href="/overtime" className="modern-card p-5 flex items-center gap-4 no-underline group hover:border-amber-300 transition-all bg-white">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-300">
              <Plus size={26} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800 leading-tight mb-1">Aplikasi Lembur</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">Pengajuan Jam Tambahan</p>
            </div>
            <ArrowRight size={16} className="text-slate-200 group-hover:text-amber-500 transition-colors" />
          </Link>

          <Link href="/payroll" className="modern-card p-5 flex items-center gap-4 no-underline group hover:border-amber-300 transition-all bg-white">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-300">
              <UserCheck size={26} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800 leading-tight mb-1">Financial Report</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">Slip Gaji Digital • PDF</p>
            </div>
            <ArrowRight size={16} className="text-slate-200 group-hover:text-amber-500 transition-colors" />
          </Link>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="px-10 text-center mt-8 pb-12">
        <div className="h-px w-12 bg-gray-100 mx-auto mb-8"></div>
        <img src="/logo.png" alt="Logo" className="w-24 mx-auto mb-4 opacity-40 hover:opacity-100 transition-opacity" />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
          Professionalism & Integrity
        </p>
      </footer>
    </div>
  );
}
