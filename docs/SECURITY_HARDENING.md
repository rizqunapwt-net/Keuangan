# Security Hardening (Baseline) - Rizquna ERP MVP

Tanggal: 2026-02-15

Dokumen ini menjelaskan kontrol keamanan yang sudah diterapkan di codebase `erp/` dan rekomendasi peningkatan berikutnya.

## Prinsip
- Jangan simpan secret di repo (markdown, txt, `.env`).
- Enforce RBAC untuk semua aksi finansial/legal.
- Semua perubahan data kritis harus punya audit trail.
- Hindari hardening yang berisiko mematahkan UI tanpa testing (contoh CSP ketat).

## Secrets & Credential Hygiene
- `ssh.md` sudah di-redact.
- `ssh.example.md` disediakan untuk template.

Aksi wajib manual:
- Rotasi token GitHub, password SSH, dan secret lain yang pernah terekspos.

Rekomendasi:
- Secret scanning (gitleaks) sudah ditambahkan di CI (non-blocking). Jika repositori sudah bersih dari secret historis, step ini bisa dibuat blocking.
- Gunakan password manager/vault untuk distribusi secret.

## Authentication & Authorization
- API token: Sanctum (`/api/v1/auth/token`).
- RBAC: Spatie Permission.
- Enforcement: middleware `role:*` di `erp/routes/api.php`.

## Rate Limiting
Limiter terdefinisi di `erp/app/Providers/AppServiceProvider.php`:
- `api`: 60 request/menit per user (jika login) atau per IP.
- `auth`: 10 request/menit per IP.
- `sales-import`: 30 request/menit per user/IP.

Enforcement:
- `POST /api/v1/auth/token` memakai `throttle:auth`.
- `POST /api/v1/sales/import` memakai `throttle:sales-import`.

Catatan:
- Limit ini bisa dituning setelah ada data trafik nyata.

## Security Headers
Middleware `erp/app/Http/Middleware/SecurityHeaders.php` diterapkan untuk web dan API via `erp/bootstrap/app.php`.
Header yang diset:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security` hanya saat `APP_ENV=production`.

Opsional (bertahap):
- CSP report-only dapat diaktifkan dengan `ERP_CSP_REPORT_ONLY=true` (tidak memblokir request, hanya untuk observasi).

## File Upload Validation
- Kontrak: `mimes:pdf`, max 10MB (`StoreContractRequest`).
- Sales CSV: `mimes:csv,txt`, max 10MB (`ImportSalesRequest`).

## Audit Logging
- Activitylog aktif untuk model inti (log fillable dan hanya field yang berubah).
- Request metadata ditambahkan ke `properties.request_meta`:
  - `ip_address`, `method`, `path`, `route_name`, `user_agent`.

Ekspor audit:
- `php artisan audit:export YYYY-MM` menulis CSV ke storage default.

## Rekomendasi Berikutnya
1. Tambah CSP bertahap (report-only dulu), lalu enforce.
2. Tambah limit khusus untuk endpoint berat (export/report) jika diperlukan.
3. Monitoring error: Sentry sudah terpasang (opsional). Aktifkan dengan mengisi `SENTRY_LARAVEL_DSN` dan ikuti `docs/MONITORING_SENTRY.md`.
4. Hardening backup + uji restore.
5. Review temuan Trivy (filesystem/image) dan tentukan kapan harus dibuat blocking di CI.
