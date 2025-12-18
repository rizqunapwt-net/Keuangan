# STATUS PROYEK

## Kondisi Umum

- Repo: baru dibuat
- Folder docs: siap
- Belum ada kode

## Tahap Saat Ini

FASE E – Frontend Scaffold (Admin)

## Yang Sudah Selesai

- Dokumen konsep tersedia
- SPEC.md dibuat
- RULES.md dibuat
- FLOW.md dibuat

- Prisma schema dibuat (`prisma/schema.prisma`) dengan models: users, employees, attendance, attendance_corrections, leave_requests, overtime_requests, payroll_periods.
- Basic backend auth (login/logout) scaffold dibuat:
  - `package.json`
  - `src/index.js`
  - `src/auth.js`
  - `.env.example`

- RBAC middleware ditambahkan:
  - `src/auth/auth.middleware.js` (verify JWT, set `req.user`)
  - `src/middlewares/assertAuthenticated.js`
  - `src/middlewares/requireRole.js`
  - `src/middlewares/requireAnyRole.js`

- Validasi kategori karyawan ditambahkan di backend (validator terpusat):
  - `src/validators/attendanceCategory.validator.js`
  - `src/services/attendance.service.js` menggunakan validator untuk `checkIn`/`checkOut`

- Seed script dan contoh data pengguna dibuat: `prisma/seed.js` (OWNER/ADMIN/KARYAWAN)
- Contoh route attendance dengan integrasi RBAC & Payroll Lock Guard:
  - `src/routes/attendance.js`
  - `src/guards/assertPayrollUnlocked.js`
  - `src/services/payrollPeriod.service.js`

- Frontend scaffold (Admin) dibuat di `frontend/`:
  - Next.js (App Router) + Tailwind CSS
  - Basic routes: `app/layout`, `app/page`, `app/admin/layout`, `app/admin/page`
  - Static mock data; belum ada integrasi API (no fetches)

## Next Step

- Finalisasi desain UI dan definisi API untuk integrasi (FASE F)
- Implementasi integrasi API di frontend (menggunakan kontrak di `docs/API_CONTRACT.md`)

-- Untuk menjalankan lokal: jalankan `npm install`, set `DATABASE_URL` di `.env`, lalu `npx prisma generate` dan `npm run seed`.

## Catatan Perbaikan Terbaru

- `backend/package.json` diperbarui: `dev` script diubah menjadi `node src/index.js` (menghindari dependensi `nodemon` yang tidak tersetup) dan `prisma` ditambahkan ke `devDependencies` agar `npx prisma` tersedia.
- Setelah perubahan ini, langkah lokal yang direkomendasikan:

```bash
cd backend
npm install
npx prisma generate
npm run seed
npm run dev
```

Jika ada error saat `npx prisma generate`, pastikan `DATABASE_URL` diisi di `backend/.env` sebelum menjalankan migrasi.

## Hasil Eksekusi Terbaru

- `npx prisma generate` — berhasil setelah perbaikan skema.
- `npx prisma db push` — berhasil (SQLite `backend/dev.db` dibuat dan schema diterapkan).
- `npm run seed` — berhasil; users/employee contoh dibuat.
- `node src/index.js` (start server) — percobaan start dilakukan; proses mengalami pesan lingkungan (Copilot rate limit) di terminal yang mencegah verifikasi proses. Untuk verifikasi lokal, jalankan langkah berikut di mesin pengembang:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Jika `npx prisma db push` sudah dijalankan, cukup jalankan `npm run seed` lalu `npm run dev`.

**🔒 Checkpoint: Struktur repo final** — Repo diinisialisasi, commit struktural dibuat dan dipush ke `origin/main`.
