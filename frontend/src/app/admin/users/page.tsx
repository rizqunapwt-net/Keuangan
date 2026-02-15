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
    XCircle,
    User,
    Key,
    Briefcase,
    Shield,
    Loader2,
    Save,
    X,
    ChevronRight,
    Lock
} from 'lucide-react';

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
            const res = await api.get('/api/employees');
            setEmployees(res.data.data || []);
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
                password: '',
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
                delete (updateData as any).username;

                await api.patch(`/api/employees/${currentId}`, updateData);
            } else {
                await api.post('/api/employees', form);
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
                await api.delete(`/api/employees/${id}`);
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
            <div className="flex items-center justify-center min-h-screen bg-[#fdfdfd]">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfdfd] pb-32">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-100 mb-12">
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push('/admin')}
                                className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 hover:border-slate-200 transition-all shadow-sm"
                            >
                                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tighter mb-1">Manajemen Personel</h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Database Hub • Live Access</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-3 bg-slate-800 text-white px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200"
                        >
                            <UserPlus size={18} />
                            Registrasi Karyawan
                        </button>
                    </div>
                </main>
            </div>

            <main className="max-w-7xl mx-auto px-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, kode identitas, atau username portal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/5 outline-none transition-all shadow-xl shadow-slate-200/20"
                        />
                    </div>
                    <button className="bg-white border border-slate-100 px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/10">
                        <Filter size={16} />
                        Klasifikasi Unit
                    </button>
                </div>

                {/* Data Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <Loader2 className="animate-spin text-amber-500" size={48} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Synchronizing Master Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredEmployees.map((emp) => (
                            <div key={emp.id} className="group modern-card p-0 bg-white border-slate-50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-50 text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500 flex items-center justify-center font-black text-3xl transition-all border border-slate-100 group-hover:border-amber-100 group-hover:rotate-3">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <div className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm
                                                ${emp.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                {emp.is_active ? 'Authorized' : 'Suspended'}
                                            </div>
                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] font-mono">
                                                {emp.employee_code || 'ID-NONE'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-2">{emp.name}</h3>
                                        <p className="text-xs text-slate-400 font-bold lowercase bg-slate-50 inline-block px-3 py-1 rounded-lg">@{emp.user.username}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Level Akses</p>
                                            <p className="text-[11px] font-black text-slate-700 uppercase">{emp.user.role}</p>
                                        </div>
                                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Klasifikasi</p>
                                            <p className="text-[11px] font-black text-slate-700 uppercase">{emp.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-8 border-t border-slate-50">
                                        <button
                                            onClick={() => handleOpenModal(emp)}
                                            className="flex-[3] bg-white border border-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800 transition-all flex items-center justify-center gap-3 shadow-sm group-hover:shadow-lg group-hover:shadow-slate-200"
                                        >
                                            <Edit2 size={14} />
                                            Update Profil
                                        </button>
                                        {(currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN') && (
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="flex-1 bg-white border border-slate-100 py-4 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredEmployees.length === 0 && (
                            <div className="col-span-full py-40 text-center rounded-[4rem] border-4 border-dashed border-slate-50">
                                <Users size={120} className="text-slate-100 mx-auto mb-10" />
                                <h4 className="text-2xl font-black text-slate-300 tracking-tight mb-2">Data Belum Sinkron</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Gunakan tombol registrasi untuk menambah personel.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-xl bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
                        <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                                    {isEditing ? 'Daftar Ulang Operator' : 'Registrasi Personel Baru'}
                                </h3>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mt-1">Identity Management Engine</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-4 bg-white rounded-2xl text-slate-300 hover:text-slate-800 transition-all border border-slate-100 shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-12 space-y-10">
                            {error && (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex gap-4 text-red-600 animate-pulse">
                                    <XCircle size={24} className="shrink-0" />
                                    <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                {/* Username */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Login ID</label>
                                    <div className="relative group">
                                        <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            type="text"
                                            disabled={isEditing}
                                            required
                                            value={form.username}
                                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl pl-16 pr-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 disabled:opacity-50 transition-all"
                                            placeholder="Ex: rizkya99"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        {isEditing ? 'Bypass Secret Key' : 'Initial Secret Key'}
                                    </label>
                                    <div className="relative group">
                                        <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            type="password"
                                            required={!isEditing}
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl pl-16 pr-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Sesuai Dokumen</label>
                                    <div className="relative group">
                                        <Briefcase size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl pl-16 pr-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                                            placeholder="Ex: Rizky Alfiansyah"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode NIK/Identitas</label>
                                    <input
                                        type="text"
                                        value={form.employeeCode}
                                        onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                                        placeholder="Ex: NRE-001"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Otoritas Level</label>
                                    <div className="relative group">
                                        <Shield size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl pl-16 pr-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="KARYAWAN">OPERATOR LAPANGAN</option>
                                            <option value="ADMIN">ADMINISTRATOR SYSTEM</option>
                                            <option value="OWNER">SYSTEM OWNER</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Klasifikasi Unit</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="REGULER">UNIT REGULER HP</option>
                                        <option value="MAHASISWA">UNIT MAGANG/MHS</option>
                                        <option value="KEBUN">UNIT PERKEBUNAN</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-6 bg-slate-50 px-8 py-4 rounded-[1.5rem] border border-slate-100">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Status Akses</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Operational Switch</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                        className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${form.isActive ? 'bg-emerald-500 shadow-emerald-600/20' : 'bg-slate-300 shadow-slate-400/20'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${form.isActive ? 'left-8' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-24 bg-slate-800 text-white rounded-[2.5rem] font-black tracking-[0.3em] uppercase text-sm flex items-center justify-center gap-5 hover:bg-black transition-all shadow-2xl shadow-slate-400/30 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Save size={24} />
                                        Commit Master Data Hub
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
