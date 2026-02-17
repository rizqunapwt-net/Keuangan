# 🔄 NRE Enterprise Merger Plan
## Menyatukan Semua Komponen Menjadi 1 Aplikasi Terintegrasi Penuh

**Tanggal**: 16 Februari 2026  
**Status**: ✅ Phase 1-4 Selesai | 🔄 Phase 5-6 Pending

---

## 📊 Hasil Audit Proyek

### Struktur Saat Ini (Terpisah-pisah)

```
NRE/
├── backend/        → NestJS + Prisma (Absensi API)         Port: 3000
├── frontend/       → Next.js (Absensi UI + Mobile PWA)     Port: 3001
├── erp/           → Laravel + Filament (Rizquna ERP)       Port: 8000
├── AbsensiOnline/ → DUPLIKAT LAMA (mirror backend/frontend/erp)
├── scripts/       → Automation scripts
└── docs/          → Dokumentasi
```

### Masalah Yang Ditemukan

| # | Masalah | Severity |
|---|---------|----------|
| 1 | **3 aplikasi terpisah** dengan 3 tech stack, 3 port, 3 database berbeda | 🔴 Critical |
| 2 | **Folder `AbsensiOnline/`** adalah duplikat lama yang tidak terpakai | 🟡 Medium |
| 3 | **Backend (`NestJS`)** dan **ERP (`Laravel`)** menggunakan database terpisah (SQLite Prisma vs SQLite Laravel) | 🔴 Critical |
| 4 | **Frontend hardcoded API URL** ke `https://api-absensi.infiatin.cloud` | 🟡 Medium |
| 5 | **Tidak ada SSO/shared auth** antara Backend Absensi dan ERP Laravel | 🔴 Critical |
| 6 | **Duplikasi konsep User** — `users` table di Prisma vs `users` table di Laravel | 🔴 Critical |
| 7 | **ERP (Publishing/Royalti)** tidak terhubung ke **Absensi/HR** sama sekali | 🟡 Medium |

### Peta Fitur Per Komponen

#### Backend (NestJS, Port 3000)
- ✅ Auth (JWT)
- ✅ Attendance (check-in/out, face recognition)
- ✅ Employee management
- ✅ Leave management (requests, balances, types)
- ✅ Overtime requests
- ✅ Payroll
- ✅ Notifications
- ✅ Attendance corrections

#### Frontend (Next.js, Port 3001)
- ✅ Employee Dashboard (home page)
- ✅ Attendance/Check-in page
- ✅ Leave requests
- ✅ Overtime requests
- ✅ Payroll view
- ✅ Admin Dashboard
- ✅ Admin User Management
- ✅ Notifications
- ✅ Profile & Face setup
- ✅ Mobile PWA + Capacitor (Android)

#### ERP (Laravel Filament, Port 8000)
- ✅ Authors management
- ✅ Books management
- ✅ Contracts (legal)
- ✅ Marketplace management
- ✅ Sales (import CSV)
- ✅ Royalty calculations
- ✅ Payments
- ✅ Assignments
- ✅ RBAC (Spatie Permission)
- ✅ Audit Trail (Spatie Activitylog)

---

## 🎯 Strategi Merger

### Pendekatan: **ERP Laravel sebagai Backend Tunggal + Next.js sebagai Frontend Tunggal**

> **Alasan**: Laravel sudah memiliki ekosistem yang lebih matang (Filament admin, Sanctum auth, Spatie permission, queue, scheduler). Migrasi fitur Absensi dari NestJS ke Laravel lebih efisien daripada sebaliknya.

### Arsitektur Target

```
NRE/ (Terintegrasi)
├── backend/        → Laravel 11 (ALL-IN-ONE API + Admin Panel)
│   ├── /admin      → Filament Panel (ERP + HR Admin)
│   ├── /api/v1     → REST API untuk Frontend
│   │   ├── /auth   → Sanctum Token Auth
│   │   ├── /attendance → Attendance endpoints
│   │   ├── /employees → Employee CRUD
│   │   ├── /leaves → Leave management
│   │   ├── /overtime → Overtime
│   │   ├── /payroll → Payroll
│   │   ├── /notifications → Notifications
│   │   ├── /contracts → Contracts (ERP)
│   │   ├── /sales → Sales import (ERP)
│   │   ├── /royalties → Royalties (ERP)
│   │   └── /payments → Payments (ERP)
│   └── database    → PostgreSQL/SQLite (SINGLE DB)
│
├── frontend/       → Next.js (UNIFIED UI)
│   ├── /           → Employee Dashboard
│   ├── /attendance → Check-in/out
│   ├── /leaves     → Leave requests
│   ├── /overtime   → Overtime
│   ├── /payroll    → Payroll slip
│   ├── /admin      → Admin panel (HR)
│   └── /erp        → ERP features (Publishing)
│
├── scripts/        → DevOps & automation
└── docs/           → Documentation
```

---

## 📋 Langkah-Langkah Implementasi

### Phase 1: Pembersihan & Persiapan
1. ✅ Hapus folder `AbsensiOnline/` (duplikat)
2. ✅ Backup database saat ini
3. ✅ Dokumentasikan semua API endpoint yang ada

### Phase 2: Migrasi Database ke Laravel
4. ✅ Buat migration Laravel untuk semua tabel Absensi:
   - ✅ `employees` (dengan relasi ke `users`)
   - ✅ `attendance`
   - ✅ `attendance_corrections`
   - ✅ `leave_types`, `leave_requests`, `leave_balances`
   - ✅ `overtime_requests`
   - ✅ `payrolls`, `payroll_periods`
   - ✅ `notifications`, `announcements`
5. ✅ Buat Eloquent Models untuk semua entity
6. ✅ Buat Seeders untuk data awal (LeaveTypeSeeder)

### Phase 3: Migrasi API dari NestJS ke Laravel
7. ✅ Buat Laravel API Controllers untuk:
   - ✅ HrAuthController (Sanctum token + face recognition)
   - ✅ AttendanceController
   - ✅ EmployeeController
   - ✅ LeaveController
   - ✅ OvertimeController
   - ✅ HrPayrollController
   - ✅ HrNotificationController
8. ✅ Migrasi business logic dari NestJS routes ke Laravel Controllers
9. ✅ Setup API response format yang kompatibel (28 API routes registered)

### Phase 4: Filament Admin Panel Integration
10. ✅ Buat Filament Resources untuk:
    - ✅ EmployeeResource (CRUD + kategori badge + salary)
    - ✅ AttendanceResource (status badge + date sort)
    - ✅ LeaveRequestResource (inline approve/reject)
    - ✅ PayrollResource (read-only view)
    - 🔄 OvertimeRequestResource
    - 🔄 NotificationResource
11. 🔄 Buat Dashboard Widget untuk HR KPI

### Phase 5: Frontend Reconnection
12. 🔄 Update `api.ts` untuk point ke Laravel backend
13. 🔄 Update auth flow (dari JWT ke Sanctum)
14. 🔄 Tambah ERP pages di frontend
15. 🔄 Update Navigation untuk include ERP menu

### Phase 6: Testing & Cleanup
16. ✅ Run full test suite
17. 🗑️ Remove NestJS backend setelah semua termigrasi
18. 📝 Update README & documentation

---

## ⏱️ Estimasi Waktu
- Phase 1: 30 menit
- Phase 2: 2-3 jam
- Phase 3: 3-4 jam
- Phase 4: 2-3 jam
- Phase 5: 1-2 jam
- Phase 6: 1 jam

**Total: ~10-14 jam kerja**

---

## ⚠️ Risiko & Mitigasi
1. **Data migration**: Backup dulu, buat seeder fallback
2. **Auth breaking change**: Frontend perlu update JWT → Sanctum
3. **Face recognition**: Perlu port biometric logic ke PHP (atau keep sebagai microservice)
4. **Mobile app**: Capacitor config perlu update API endpoint
