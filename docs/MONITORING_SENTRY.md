# Monitoring Error - Sentry (Opsional) - Rizquna ERP MVP

Tanggal: 2026-02-15

Integrasi Sentry dipasang via package `sentry/sentry-laravel`. Secara default tidak aktif jika `SENTRY_LARAVEL_DSN` kosong.

## Enable di Staging/Prod
1. Set env:
- `SENTRY_LARAVEL_DSN=<dsn>`
- (opsional) `SENTRY_TRACES_SAMPLE_RATE=0.1` (contoh 10%)
- (opsional) `SENTRY_SEND_DEFAULT_PII=false` (disarankan tetap `false` kecuali sudah ada dasar legal)

2. Pastikan config terbaca:
```bash
cd erp
php artisan config:clear
```

3. Test kirim event (hanya di staging):
```bash
cd erp
php artisan sentry:test
```

## Catatan Keamanan/Privasi
- Jangan aktifkan `SENTRY_SEND_DEFAULT_PII=true` tanpa review (bisa mengirim IP, header, user).
- Pastikan DSN disimpan via secret manager, bukan di repo.

