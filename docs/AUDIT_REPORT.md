# Audit Report (Faktual) - Rizquna ERP MVP

Tanggal: 2026-02-15
Scope: aplikasi Laravel di folder `erp/`.

## Ringkasan
- Status aplikasi: berjalan (Docker) dan test suite lulus.
- Target audit: audit internal proses legalitas kontrak, import sales, perhitungan royalti, invoice, pembayaran, RBAC, dan audit trail.

## Bukti (Evidence)
1. Database & migrasi
- `php artisan migrate:status`: semua migration berstatus `Ran`.

2. Test suite
- `php artisan test`: `43 passed`, `122 assertions`.

3. Runtime (Docker)
- Akses aplikasi: `http://localhost:8000`
- PostgreSQL: `127.0.0.1:5434`
- Redis: `127.0.0.1:6380`
- MinIO API: `http://localhost:9010` (dev), Console: `http://localhost:9011`

4. Backup/restore verification (Docker dev)
- Script verifikasi: `./scripts/verify_backup_restore.sh` (backup + restore ke DB temporary + sanity query + cleanup) berjalan sukses.

## Kontrol yang Sudah Ada (Controls Implemented)
1. AuthN/AuthZ
- Auth API: Laravel Sanctum token (`POST /api/v1/auth/token`).
- RBAC: Spatie Permission, enforcement via route middleware `role:*`.

2. Audit Trail
- Spatie Activitylog pada model inti (`authors`, `books`, `contracts`, `sales_imports`, `sales`, `royalty_calculations`, `payments`, `assignments`, `marketplaces`).
- Meta request ditambahkan ke `activity_log.properties.request_meta`:
  - `ip_address`, `method`, `path`, `route_name`, `user_agent`.
- Ekspor audit bulanan tersedia via command:
  - `php artisan audit:export YYYY-MM`

3. Scheduler / Automation
- Jadwal aktif di `erp/routes/console.php`:
  - `contracts:expire` harian
  - `contracts:notify-expiring` harian
  - `audit:export` bulanan

4. Security Baseline
- Security headers aktif untuk web dan API:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- Rate limiting:
  - `throttle:auth` untuk `POST /api/v1/auth/token` (10/minute per IP)
  - `throttle:sales-import` untuk `POST /api/v1/sales/import` (30/minute per user/IP)
  - limiter `api` terdefinisi (60/minute per user/IP)

5. CI (Minimal)
- Workflow GitHub Actions disiapkan di `.github/workflows/ci.yml`:
  - PHP 8.4
  - PostgreSQL service
  - `composer install` + `php artisan test`
  - `composer audit` non-blocking
  - `gitleaks` secret scan (non-blocking)
  - Trivy filesystem scan (non-blocking)
  - Trivy Docker image scan (non-blocking)

6. Monitoring (Opsional)
- Integrasi Sentry tersedia (default off jika `SENTRY_LARAVEL_DSN` kosong). Detail: `docs/MONITORING_SENTRY.md`.

## Temuan & Status
1. (Kritis) Kredensial plaintext pernah muncul di file catatan
- Status: file `ssh.md` sudah di-redact dan diganti template `ssh.example.md`.
- Aksi wajib (manual): rotasi semua kredensial yang pernah terekspos.

2. (Medium) Ketergantungan test terhadap S3/MinIO
- Status: test dipaksa menggunakan `FILESYSTEM_DISK=local` via `erp/phpunit.xml` agar deterministik.

3. (Low) Tidak ada CSP
- Status: sengaja tidak diterapkan sekarang untuk menghindari risiko mematahkan Filament/UI.
- Rekomendasi: CSP bisa ditambahkan nanti dengan testing menyeluruh.

## Residual Risk
- Tidak ada mekanisme otomatis rotasi secret.
- Kebijakan retensi log audit belum didokumentasikan (activity log cleanup default 365 hari).

## Rekomendasi Next Step
1. Tambahkan pre-commit secret scan (opsional) untuk mencegah secret masuk sebelum push.
2. Siapkan runbook deploy + backup/restore dan uji restore minimal 1 kali.
3. Jalankan UAT sesuai checklist dan minta sign-off 4 role utama.
