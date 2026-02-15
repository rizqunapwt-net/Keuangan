# Catatan Faktual Proyek NRE/erp

Tanggal pembaruan: 2026-02-15

## Status Aktual (Terverifikasi)
1. Aplikasi Laravel ada di folder `erp/`.
2. Stack lokal berjalan dengan Docker:
- `rizquna_web` pada `http://localhost:8000`
- `rizquna_db` pada `127.0.0.1:5434`
- `rizquna_redis` pada `127.0.0.1:6380`
- `rizquna_minio` API `http://localhost:9010`, console `http://localhost:9011`
3. Migrasi database berhasil dijalankan (semua migration status `Ran`).
4. Test suite terakhir lulus penuh:
- `43` test
- `122` assertions
- status: `PASS`

## Perbaikan yang Sudah Benar-Benar Diterapkan
1. Sanitasi kredensial:
- `ssh.md` sudah di-redact (tanpa secret plaintext).
- `ssh.example.md` tersedia sebagai template aman.
2. Konfigurasi env lokal disinkronkan ke PostgreSQL/Redis/MinIO:
- `erp/.env`
- `erp/.env.example`
3. Port Docker disesuaikan agar tidak bentrok dengan project lain:
- PostgreSQL: `5434`
- Redis: `6380`
- MinIO: `9010/9011`
4. Dependency S3 adapter ditambahkan:
- `league/flysystem-aws-s3-v3`
- `aws/aws-sdk-php`
5. Requirement PHP diselaraskan:
- `erp/composer.json` sekarang `php: ^8.4`
- Docker PHP image: `php:8.4-fpm-alpine`
6. Urutan migration yang menyebabkan FK error sudah diperbaiki:
- `create_assignments_table` dipindahkan setelah tabel referensi (`books`, `marketplaces`).
7. Security baseline:
- Security headers aktif (web + API): `erp/app/Http/Middleware/SecurityHeaders.php`
- Opsi CSP report-only (default off): `ERP_CSP_REPORT_ONLY=true`
- Rate limiting:
  - `throttle:auth` untuk `POST /api/v1/auth/token`
  - `throttle:sales-import` untuk `POST /api/v1/sales/import`
  - limiter `api/auth/sales-import` di `erp/app/Providers/AppServiceProvider.php`
8. Dokumen audit/ops:
- `erp/docs/AUDIT_REPORT.md`
- `erp/docs/SECURITY_HARDENING.md`
- `erp/docs/UAT_CHECKLIST_FINAL.md`
- `erp/docs/DEPLOYMENT_RUNBOOK.md`
- `erp/docs/BACKUP_RESTORE.md`
- `erp/docs/MONITORING_SENTRY.md`
- `erp/docs/CHANGELOG_HARDENING.md`
9. CI minimal:
- `.github/workflows/ci.yml`
  - termasuk secret scan `gitleaks` (non-blocking)
  - termasuk Trivy filesystem scan (non-blocking)
  - termasuk Trivy Docker image scan (non-blocking)
10. Backup/restore automation:
- Script: `erp/scripts/backup_db.sh`, `erp/scripts/restore_db.sh`, `erp/scripts/verify_backup_restore.sh`
- Verifikasi restore (Docker dev) sudah diuji dan sukses.
11. Test tambahan:
- `erp/tests/Feature/SecurityHeadersTest.php`
- `erp/tests/Feature/AuthTokenRateLimitTest.php`

## Gap Aktual (Masih Belum Dikerjakan)
1. CSP enforce (bukan report-only) belum diterapkan.
2. Workspace ini saat ini bukan git repository aktif, jadi commit/branch tidak dapat diverifikasi di environment ini.

## Catatan Keamanan Penting
1. Karena sebelumnya sempat ada kredensial plaintext, rotasi tetap wajib dilakukan untuk:
- token GitHub
- password SSH
- secret lain yang pernah terekspos
2. Jangan simpan kredensial di markdown/txt repo. Gunakan password manager / vault.

## Next Action Prioritas
1. Integrasi secret scanning (gitleaks) di CI dan pre-commit.
2. Tambahkan job backup terjadwal (pg_dump + storage sync) dan uji restore.
3. Monitoring error (Sentry atau sejenis) untuk staging.
