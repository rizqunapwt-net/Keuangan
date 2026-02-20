# Backup & Restore - Rizquna ERP MVP

Tanggal: 2026-02-15

Dokumen ini menjelaskan prosedur backup/restore yang repeatable untuk kebutuhan operasional dan audit.

## Target
- Backup harian database PostgreSQL.
- Restore diuji minimal 1x (contoh: restore ke database temporary).
- Backup object storage mengikuti kebijakan provider (lifecycle/replication) atau sync manual jika dibutuhkan.

## Script Resmi (Recommended)
Semua script ada di `erp/scripts/`.

### 1) Backup DB (Docker dev)
Jika PostgreSQL berjalan via docker-compose (container `rizquna_db`):
```bash
cd erp
./scripts/backup_db.sh --docker
```

Output default: `erp/backups/db/*.dump` (custom format `pg_dump -Fc`).

### 2) Restore DB (ke database baru, aman)
Restore ke database baru (tidak overwrite DB utama):
```bash
cd erp
./scripts/restore_db.sh --docker --file ./backups/db/<file>.dump
```

Script akan membuat database baru bernama `restore_<timestamp>`.

### 3) Restore DB (overwrite, destruktif)
Hanya jika memang diperlukan (mis. incident recovery).
```bash
cd erp
./scripts/restore_db.sh --docker --file ./backups/db/<file>.dump --database rizquna_erp --force
```

### 4) Verifikasi Backup+Restore (Docker only)
Ini menjalankan backup, restore ke DB temporary, sanity query, lalu cleanup.
```bash
cd erp
./scripts/verify_backup_restore.sh
```

## Cron (Production)
Contoh cron harian (pastikan environment variables/akses DB sudah benar di server):
```bash
0 1 * * * /path/to/erp/scripts/backup_db.sh --local --output-dir /var/backups/rizquna-erp/db >> /var/log/rizquna-erp-backup.log 2>&1
```

Catatan:
- Simpan backup di storage yang punya retensi (S3 bucket dengan lifecycle policy, atau volume backup terpisah).
- File backup berisi data sensitif, set permission ketat (script memakai `umask 077`).

## Object Storage (S3-Compatible)
Untuk file upload (kontrak PDF, invoice PDF, error report), rekomendasi paling aman adalah:
- Enable bucket versioning (jika tersedia).
- Set lifecycle policy (retensi + transition).
- Jika perlu, gunakan replication ke bucket/region berbeda.

Jika ingin backup manual via CLI, gunakan tool resmi provider (AWS CLI / MinIO client) sesuai environment.

