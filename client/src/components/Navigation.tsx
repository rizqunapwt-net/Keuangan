"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, User, Bell, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navigation() {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || pathname === "/login") return null;

    return (
        <>
            {/* Top Header with Logo */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 overflow-hidden">
                        {/* Fallback to text if logo missing, but we assume logo.png exists */}
                        <img src="/logo-icon.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <div className="font-bold text-amber-500 text-xl">R</div>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900 leading-tight">Rizquna Elfath</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Attendance Hub</p>
                    </div>
                </div>
                <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-amber-500 transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Link>
            </header>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
                    <LayoutDashboard size={24} strokeWidth={pathname === "/" ? 2.5 : 1.5} />
                    <span>Beranda</span>
                </Link>

                <Link href="/attendance" className={`nav-item ${pathname === "/attendance" ? "active" : ""}`}>
                    <Clock size={24} strokeWidth={pathname === "/attendance" ? 2.5 : 1.5} />
                    <span>Absen</span>
                </Link>

                <Link href="/leaves" className={`nav-item ${pathname === "/leaves" ? "active" : ""}`}>
                    <FileText size={24} strokeWidth={pathname === "/leaves" ? 2.5 : 1.5} />
                    <span>Cuti</span>
                </Link>

                {user?.role === "ADMIN" || user?.role === "OWNER" ? (
                    <Link href="/admin" className={`nav-item ${pathname.startsWith("/admin") ? "active" : ""}`}>
                        <User size={24} strokeWidth={pathname.startsWith("/admin") ? 2.5 : 1.5} />
                        <span>Admin</span>
                    </Link>
                ) : (
                    <Link href="/profile" className={`nav-item ${pathname === "/profile" ? "active" : ""}`}>
                        <User size={24} strokeWidth={pathname === "/profile" ? 2.5 : 1.5} />
                        <span>Profil</span>
                    </Link>
                )}
            </nav>
        </>
    );
}
