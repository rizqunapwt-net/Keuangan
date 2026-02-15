"use client";

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    ChevronLeft,
    Edit2,
    Trash2,
    MoreVertical,
    CheckCircle2,
    XCircle,
    User,
    Key,
    Briefcase,
    Shield,
    Loader2,
    Save,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface EmployeeWithUser {
    id: string;
    name: string;
    employee_code: string | null;
    category: string;
    is_active: boolean;
    user: {
        id: string;
        username: string;
        role: string;
    };
}

export default function UserManagementPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        employeeCode: '',
        role: 'KARYAWAN',
        category: 'REGULER',
        isActive: true
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'OWNER')) {
                router.push('/');
            } else {
                fetchEmployees();
            }
        }
    }, [currentUser, authLoading, router]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            setEmployees(res.data.data);
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (emp?: EmployeeWithUser) => {
        if (emp) {
            setIsEditing(true);
            setCurrentId(emp.id);
            setForm({
                username: emp.user.username,
                password: '', // Keep empty for update
                name: emp.name,
                employeeCode: emp.employee_code || '',
                role: emp.user.role,
                category: emp.category,
                isActive: emp.is_active
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setForm({
                username: '',
                password: '',
                name: '',
                employeeCode: '',
                role: 'KARYAWAN',
                category: 'REGULER',
                isActive: true
            });
        }
        setShowModal(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditing && currentId) {
                const updateData = { ...form };
                if (!updateData.password) delete (updateData as any).password;
                delete (updateData as any).username; // Username cannot be changed usually

                await api.patch(`/employees/${currentId}`, updateData);
            } else {
                await api.post('/employees', form);
            }
            setShowModal(false);
            fetchEmployees();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Terjadi kesalahan pada server');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menonaktifkan karyawan ini?')) {
            try {
                await api.delete(`/employees/${id}`);
                fetchEmployees();
            } catch (err) {
                alert('Gagal menghapus karyawan');
            }
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfdfd] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 -ml-2 text-gray-400 hover:text-amber-500 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">Manajemen Karyawan</h1>
                        <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Database Personel Hub</p>
                    </div>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
                >
                    <UserPlus size={14} />
                    Tambah Karyawan
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, kode, atau username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button className="bg-white border border-slate-100 px-6 py-4 rounded-2xl flex items-center gap-2 text-slate-400 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={16} />
                        Kategori
                    </button>
                </div>

                {/* Data Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-amber-500" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployees.map((emp) => (
                            <div key={emp.id} className="modern-card p-6 bg-white hover:border-amber-200 transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-xl group-hover:bg-amber-50 group-hover:text-amber-500 transition-all">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border
                                                ${emp.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                {emp.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                {emp.employee_code || 'No Code'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-lg font-black text-slate-800 leading-none mb-2">{emp.name}</h3>
                                        <p className="text-xs text-slate-400 font-medium lowercase">@{emp.user.username}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight mb-1">Position</p>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase">{emp.user.role}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight mb-1">Category</p>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase">{emp.category}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => handleOpenModal(emp)}
                                        className="flex-1 bg-white border border-slate-100 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={12} />
                                        Update Data
                                    </button>
                                    {currentUser?.role === 'OWNER' && (
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="w-12 bg-white border border-slate-100 py-3 rounded-xl text-slate-300 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredEmployees.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <Users size={64} className="text-slate-100 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-400">Tidak ada data karyawan yang ditemukan.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                    {isEditing ? 'Daftar Ulang Personel' : 'Registrasi Karyawan Baru'}
                                </h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lengkapi otentikasi & identitas</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-300 hover:text-slate-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600">
                                    <XCircle size={18} className="shrink-0" />
                                    <p className="text-xs font-bold leading-tight">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username (Locked on edit) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Portal</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            disabled={isEditing}
                                            required
                                            value={form.username}
                                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                                            placeholder="Ex: rizkya99"
                                        />
                                    </div>
                                </div>

                                {/* Password (Optional on edit) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        {isEditing ? 'Sandi Baru (Opsional)' : 'Secret Key Access'}
                                    </label>
                                    <div className="relative">
                                        <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="password"
                                            required={!isEditing}
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Sesuai ID</label>
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                                            placeholder="Ex: Rizky Alfiansyah"
                                        />
                                    </div>
                                </div>

                                {/* Employee Code */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Identitas (NIK)</label>
                                    <input
                                        type="text"
                                        value={form.employeeCode}
                                        onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                                        placeholder="Ex: NRE-001"
                                    />
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Otorisasi Level</label>
                                    <div className="relative">
                                        <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none"
                                        >
                                            <option value="KARYAWAN">KARYAWAN OPERASIONAL</option>
                                            <option value="ADMIN">ADMINISTRATOR</option>
                                            <option value="OWNER">SYSTEM OWNER</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Klasifikasi Unit</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                                    >
                                        <option value="REGULER">UNIT REGULER</option>
                                        <option value="MAHASISWA">UNIT MAGANG/MHS</option>
                                        <option value="KEBUN">UNIT PERKEBUNAN</option>
                                    </select>
                                </div>

                                {/* Active Switch */}
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-1">
                                    <label className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Akses</label>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 bg-slate-800 text-white rounded-[1.5rem] font-black tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Information Hub
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
