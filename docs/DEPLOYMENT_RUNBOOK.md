# Deployment Runbook - Rizquna ERP MVP

Tanggal: 2026-02-15

Dokumen ini menjelaskan langkah deploy staging/production untuk aplikasi `erp/`.

## Requirement
- PHP 8.2+
- Composer 2
- PostgreSQL 16
- Redis (recommended untuk queue/horizon)
- Object storage S3-compatible (MinIO untuk dev)

## Environment Variables (Minimal)
Wajib:
- `APP_ENV`, `APP_KEY`, `APP_URL`
- `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

Storage (prod):
- `FILESYSTEM_DISK=s3`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT` (jika non-AWS)
- `AWS_USE_PATH_STYLE_ENDPOINT=true` (umum untuk MinIO/S3-compatible)

Monitoring (opsional):
- `SENTRY_LARAVEL_DSN`
- `SENTRY_TRACES_SAMPLE_RATE` (default `0`)

## Deploy (Staging/Prod)
Dari folder `erp/`:

1. Install dependency (prod)
```bash
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
```

2. Pastikan key sudah ada
```bash
php artisan key:generate
```
Catatan: hanya dilakukan sekali saat pertama deploy.

3. Migrate
```bash
php artisan migrate --force
```

4. Cache (opsional)
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

5. Scheduler
Pilih salah satu:
- (Recommended) system cron menjalankan scheduler:
```bash
* * * * * php /path/to/erp/artisan schedule:run >> /dev/null 2>&1
```
- Atau `php artisan schedule:work` sebagai service.

6. Queue/Horizon
Jika memakai redis queue:
```bash
php artisan horizon
```
Saat deploy ulang:
```bash
php artisan horizon:terminate
```

## Backup & Restore

Dokumentasi detail: `docs/BACKUP_RESTORE.md`.

### Backup PostgreSQL
Recommended (repeatable):
```bash
cd erp
./scripts/backup_db.sh --local --output-dir /var/backups/rizquna-erp/db
```

Contoh manual:
```bash
pg_dump -Fc -h <host> -U <user> <db> > backup.dump
```

### Restore PostgreSQL
Recommended (aman, restore ke DB baru):
```bash
cd erp
./scripts/restore_db.sh --local --file /var/backups/rizquna-erp/db/<file>.dump
```

Contoh manual:
```bash
pg_restore -c -h <host> -U <user> -d <db> backup.dump
```

### Storage
- Pastikan bucket di object storage punya lifecycle/replication sesuai kebijakan.

## Smoke Test Setelah Deploy
1. Akses web: `GET /` (status 200)
2. Login admin (jika panel digunakan)
3. Test API token: `POST /api/v1/auth/token`
4. Jalankan `php artisan audit:export YYYY-MM`

## CI/CD GitHub Actions (Opsional)
Repo sudah disiapkan workflow deploy: `.github/workflows/deploy_erp.yml` (manual atau auto saat push ke `main` jika secrets tersedia).

### One-time Setup di Server
1. Clone repo pada path tertentu (contoh: `/home/<user>/nre`), lalu pastikan folder `erp/` ada.
2. Buat file `erp/.env` (jangan commit) dan set variable produksi (DB, `APP_URL`, `APP_KEY`, storage S3, dsb).
3. Pastikan `php` dan `composer` tersedia di server.
4. Tambahkan deploy key public ke `~/.ssh/authorized_keys` user deploy di server.

### Secrets yang Wajib di GitHub
Set pada GitHub Repo Settings -> Secrets and variables -> Actions:
- `DEPLOY_HOST` (contoh: `server.infiatin.cloud`)
- `DEPLOY_USER` (contoh: `tholib_server`)
- `DEPLOY_PATH` (path repo di server, contoh: `/home/tholib_server/nre`)
- `SSH_PRIVATE_KEY` (private key deploy, format OpenSSH)
- `CF_ACCESS_TOKEN_ID` dan `CF_ACCESS_TOKEN_SECRET` (Cloudflare Access service token)
- (Opsional) `SSH_KNOWN_HOSTS` untuk strict host key checking

### Apa yang Dilakukan Workflow
1. `git pull` di server (branch `main`)
2. Jalankan `erp/scripts/deploy_server.sh` (composer install prod + migrate + cache + restart horizon)
