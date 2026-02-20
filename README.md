# Rizquna ERP (MVP)

Aplikasi internal ERP Publishing untuk PT Rizquna Pustaka.

## Scope MVP
- Master data `authors`, `books`, `marketplaces`
- Kontrak legal (`pending`, `approved`, `rejected`, `expired`)
- Assignment buku ke marketplace (hanya buku dengan kontrak approved aktif)
- Import sales CSV (`completed` / `refunded`)
- Kalkulasi royalti bulanan
- Generate invoice PDF + payment tracking
- Dashboard KPI (Filament)
- RBAC (Admin, Legal, Marketing, Finance)
- Audit trail (Spatie Activitylog)

## Tech Stack
- Laravel 11, PHP 8.2+
- Filament v3
- PostgreSQL 16 (target), SQLite (default local/test)
- Redis + Horizon
- Sanctum
- Spatie Permission + Activitylog
- DomPDF + Laravel Excel

## One-Command (Recommended)
```bash
cd erp
./scripts/dev.sh up
```

## Setup (Manual)
```bash
cd erp
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
```

Jalankan aplikasi:
```bash
php artisan serve
```

## Docker (Opsional)
```bash
./scripts/dev.sh up
```

Akses:
- App: `http://localhost:8000`
- PostgreSQL: `127.0.0.1:5434`
- Redis: `127.0.0.1:6380`
- MinIO API: `http://localhost:9010`
- MinIO Console: `http://localhost:9011`

## Akun Default
Seeder membuat akun admin:
- Email: `admin@rizquna.id`
- Password: `password`

## Panel Admin
- URL: `/admin`

## API v1
Base path: `/api/v1`

### Auth Token
- `POST /auth/token`

Body:
```json
{
  "email": "admin@rizquna.id",
  "password": "password",
  "device_name": "postman"
}
```

### Contracts
- `POST /contracts` (Legal/Admin)
- `PUT /contracts/{id}/approve` (Legal/Admin)
- `PUT /contracts/{id}/reject` (Legal/Admin)

### Sales
- `POST /sales/import` (Finance)

CSV kolom wajib:
- `period_month`
- `marketplace_code`
- `isbn`
- `transaction_id`
- `quantity`
- `net_price`
- `status`

### Royalties
- `POST /royalties/calculate` (Finance)
- `PUT /royalties/{id}/finalize` (Finance)
- `POST /royalties/{id}/invoice` (Finance)

### Payments
- `PUT /payments/{id}/mark-paid` (Finance)

## Response Envelope
Success:
```json
{
  "success": true,
  "data": {},
  "meta": {"timestamp": "..."}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "message": "...",
    "errors": {}
  },
  "meta": {"timestamp": "..."}
}
```

## Scheduler & Queue
Jalankan scheduler dan queue worker di environment produksi:
```bash
php artisan schedule:work
php artisan horizon
```

Job harian:
- `contracts:expire` untuk auto-update kontrak approved yang sudah melewati `end_date`.
- `contracts:notify-expiring` untuk kirim reminder H-30/H-7/H-1 ke webhook n8n.

Job bulanan:
- `audit:export` untuk ekspor CSV `activity_log` per bulan.

Konfigurasi n8n:
- set `N8N_CONTRACT_EXPIRY_WEBHOOK` di `.env`

## Docs
Dokumentasi pendukung ada di folder `docs/`:
- `docs/AUDIT_REPORT.md`
- `docs/AUDIT_CHECKLIST.md`
- `docs/SECURITY_HARDENING.md`
- `docs/MONITORING_SENTRY.md`
- `docs/UAT_RUNBOOK.md`
- `docs/UAT_CHECKLIST_FINAL.md`
- `docs/DEPLOYMENT_RUNBOOK.md`
- `docs/BACKUP_RESTORE.md`
- `docs/CHANGELOG_HARDENING.md`

## Testing
```bash
php artisan test
```

Saat ini mencakup test untuk:
- Formula royalti + exclude refunded
- Approval kontrak + overlap protection
- Import CSV sales
- Invoice + mark paid flow
- Guard assignment tanpa kontrak approved
