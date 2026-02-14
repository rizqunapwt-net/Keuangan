"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
      {/* Animated Nebula Background */}
      <div className="nebula" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm">A</div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic">
                ABSENSI
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <NotificationDropdown />
              <button onClick={logout} className="px-5 py-2 rounded-full border border-red-500/20 bg-red-500/5 text-xs font-bold text-red-400 transition-all hover:bg-red-500 hover:text-white">
                KELUAR SESI
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-4xl font-black tracking-tighter sm:text-6xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            SELAMAT DATANG DI <span className="text-indigo-500">SUITE</span>
          </h2>
          <p className="mt-4 text-sm md:text-base font-medium text-gray-500 max-w-2xl uppercase tracking-[0.2em] leading-relaxed">
            Pusat absensi korporat untuk profesional modern. Presisi pelacakan berpadu dengan kontrol tanpa batas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card: Attendance */}
          <div className="glass-card group relative rounded-[2.5rem] p-8 transition-all hover:border-indigo-500/30 hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-600/10 blur-[80px] group-hover:bg-indigo-600/20 transition-all" />
            <div className="relative">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Stasiun Waktu</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                Daftarkan kehadiran Anda untuk sesi hari ini dengan protokol geolokasi aman.
              </p>
              <Link href="/attendance" className="inline-flex w-full items-center justify-center rounded-[1.25rem] bg-indigo-600 px-6 py-4 text-xs font-black tracking-[0.2em] text-white transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98]">
                LUNCURKAN STASIUN
              </Link>
            </div>
          </div>

          {/* Card: Admin Reporting */}
          {(user.role === 'ADMIN' || user.role === 'OWNER') && (
            <div className="glass-card group relative rounded-[2.5rem] p-8 transition-all hover:border-blue-500/30 hover:bg-white/[0.07] overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-blue-600/10 blur-[80px] group-hover:bg-blue-600/20 transition-all" />
              <div className="relative">
                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Intelijen</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                  Wawasan komprehensif tentang mobilisasi personel dan siklus operasional.
                </p>
                <Link href="/admin" className="inline-flex w-full items-center justify-center rounded-[1.25rem] border border-white/10 px-6 py-4 text-xs font-black tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]">
                  AKSES INTEL
                </Link>
              </div>
            </div>
          )}

          <div className="glass-card group relative rounded-[2.5rem] p-8 transition-all hover:border-purple-500/30 hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-purple-600/10 blur-[80px] group-hover:bg-purple-600/20 transition-all" />
            <div className="relative">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Arsip</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                Lihat catatan kategoris kinerja kehadiran historis Anda secara mendalam.
              </p>
              <Link href="/attendance/history" className="inline-flex w-full items-center justify-center rounded-[1.25rem] border border-white/10 px-6 py-4 text-xs font-black tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]">
                BUKA ARSIP
              </Link>
            </div>
          </div>

          <div className="glass-card group relative rounded-[2.5rem] p-8 transition-all hover:border-orange-500/30 hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-orange-600/10 blur-[80px] group-hover:bg-orange-600/20 transition-all" />
            <div className="relative">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Biometrik</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                Inisialisasi Face ID untuk akses otomatis tanpa sentuh yang aman.
              </p>
              <Link href="/setup-face" className="inline-flex w-full items-center justify-center rounded-[1.25rem] border border-white/10 px-6 py-4 text-xs font-black tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]">
                SETUP FACE ID
              </Link>
            </div>
          </div>

          {/* Card: Overtime */}
          <div className="glass-card group relative rounded-[2.5rem] p-8 transition-all hover:border-amber-500/30 hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-amber-600/10 blur-[80px] group-hover:bg-amber-600/20 transition-all" />
            <div className="relative">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Lembur</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                Ajukan permintaan lembur untuk sesi kerja ekstra Anda secara resmi.
              </p>
              <Link href="/overtime" className="inline-flex w-full items-center justify-center rounded-[1.25rem] border border-white/10 px-6 py-4 text-xs font-black tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]">
                AJUKAN LEMBUR
              </Link>
            </div>
          </div>

          {/* Card: Payroll */}
          <div className="glass-card group relative rounded-[2.5rem] p-8 transition-all hover:border-emerald-500/30 hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-emerald-600/10 blur-[80px] group-hover:bg-emerald-600/20 transition-all" />
            <div className="relative">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Payroll</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
                Akses slip gaji digital Anda dan ringkasan pendapatan bulanan.
              </p>
              <Link href="/payroll" className="inline-flex w-full items-center justify-center rounded-[1.25rem] border border-white/10 px-6 py-4 text-xs font-black tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]">
                LIHAT SLIP GAJI
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-20 border-t border-white/5 pt-8 text-center bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-gray-700">
            Komponen Akses Resmi • v4.2.0 • Build ID 90X21
          </p>
        </div>
      </main>
    </div >
  );
}
