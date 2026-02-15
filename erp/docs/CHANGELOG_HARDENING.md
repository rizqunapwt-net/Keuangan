# Changelog Hardening - Rizquna ERP MVP

Tanggal: 2026-02-15

Dokumen ini merangkum perubahan hardening/operasional yang dilakukan.

## Security
- Redact kredensial dari `ssh.md` dan menyediakan `ssh.example.md`.
- Menambahkan middleware security headers:
  - `erp/app/Http/Middleware/SecurityHeaders.php`
  - diaktifkan untuk `web` dan `api` via `erp/bootstrap/app.php`.
- Menambahkan rate limiter dan throttle:
  - limiter `api`, `auth`, `sales-import` di `erp/app/Providers/AppServiceProvider.php`.
  - enforce `throttle:auth` di `POST /api/v1/auth/token`.
  - enforce `throttle:sales-import` di `POST /api/v1/sales/import`.
- Menambahkan opsi CSP report-only (default off) via `ERP_CSP_REPORT_ONLY=true`.

## Testing
- Memaksa test memakai filesystem `local` via `erp/phpunit.xml`.
- Menambah test:
  - `erp/tests/Feature/SecurityHeadersTest.php`
  - `erp/tests/Feature/AuthTokenRateLimitTest.php`

## DevOps / CI
- Menambahkan workflow CI minimal:
  - `.github/workflows/ci.yml`
- Menambahkan secret scan (gitleaks) di CI (non-blocking).
- Menambahkan Trivy scan di CI (non-blocking):
  - filesystem scan
  - Docker image scan (PHP app image)

## Backup / Restore
- Menambahkan script repeatable:
  - `erp/scripts/backup_db.sh`
  - `erp/scripts/restore_db.sh`
  - `erp/scripts/verify_backup_restore.sh`
- Menambahkan dokumentasi: `erp/docs/BACKUP_RESTORE.md`.

## Docker / Local Dev
- Menyesuaikan port agar tidak konflik:
  - Postgres: `5434`
  - Redis: `6380`
  - MinIO: `9010/9011`
- Menyamakan baseline PHP:
  - Docker app pakai `php:8.4-fpm-alpine`.

## Dependencies
- Menambahkan driver S3 Flysystem dan AWS SDK:
  - `league/flysystem-aws-s3-v3`
  - `aws/aws-sdk-php`
- Menyamakan requirement PHP di `erp/composer.json` menjadi `^8.4`.

## Monitoring
- Menambahkan integrasi Sentry (opsional, default off jika `SENTRY_LARAVEL_DSN` kosong).
