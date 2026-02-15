"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  BadgeCheck,
  Calendar,
  LogOut,
  ChevronRight,
  Shield,
  Briefcase,
  Wallet,
  Clock,
  FileText,
  Settings
} from 'lucide-react';

interface ProfileStats {
  leave_balance: number;
  attendance_rate: number;
  total_overtime: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats>({
    leave_balance: 0,
    attendance_rate: 0,
    total_overtime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchProfileStats = async () => {
      try {
        // Fetch leave balances and other stats
        // These endpoints should exist in your backend routes
        const leaveRes = await api.get('/api/leaves/balances');
        const attendanceRes = await api.get('/attendance/stats/monthly');

        // Mocking stats if endpoints are still being perfected on backend
        // In a real scenario, we'd use the actual response
        setStats({
          leave_balance: leaveRes.data?.data?.[0]?.remaining ?? 12,
          attendance_rate: attendanceRes.data?.rate ?? 98,
          total_overtime: 0
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
        // Set default values if fetch fails
        setStats(prev => ({ ...prev, leave_balance: 12 }));
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileStats();
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Premium Header Background */}
      <div className="h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/20 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <main className="px-6 -mt-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-6 mb-6 border border-white">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-[32px] bg-amber-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <div className="text-4xl font-black text-amber-500">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center">
                <BadgeCheck size={14} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.employee?.name || user.username}</h2>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">
              {user.role} • {user.employee?.category || 'STAFF'}
            </p>

            <div className="grid grid-cols-3 w-full gap-4 pt-6 border-t border-slate-50">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Cuti</p>
                <p className="text-lg font-black text-slate-800 tabular-nums">{stats.leave_balance}d</p>
              </div>
              <div className="text-center border-x border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Hadir</p>
                <p className="text-lg font-black text-slate-800 tabular-nums">{stats.attendance_rate}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Rank</p>
                <p className="text-lg font-black text-amber-500 tracking-tighter">Gold</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Detail Kepegawaian</h3>

          <div className="bg-white rounded-[24px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <BadgeCheck size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">ID Karyawan</p>
                <p className="text-sm font-bold text-slate-800">{user.employee?.id?.slice(0, 8).toUpperCase() || 'NRE-NEW'}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Briefcase size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Kategori Jabatan</p>
                <p className="text-sm font-bold text-slate-800">{user.employee?.category || 'REGULER'}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Bergabung Sejak</p>
                <p className="text-sm font-bold text-slate-800">
                  {user.employee ? new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 pt-4">Menu Lainnya</h3>

          <div className="bg-white rounded-[24px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
            <button
              onClick={() => router.push('/payroll')}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Wallet size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-800">Informasi Penggajian</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button
              onClick={() => router.push('/setup-face')}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Shield size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-800">Update Keamanan Wajah</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button
              onClick={() => router.push('/notifications')}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Clock size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-800">Preferensi Notifikasi</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>

          {/* Logout Section */}
          <div className="pt-8">
            <button
              onClick={logout}
              className="w-full py-5 rounded-[24px] bg-red-50 border border-red-100 flex items-center justify-center gap-3 group active:scale-[0.98] transition-all"
            >
              <LogOut size={20} className="text-red-500 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Keluar dari Sesi</span>
            </button>
            <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-6">
              Absensi Online v4.2.0 • PT New Rizquna Elfath
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
