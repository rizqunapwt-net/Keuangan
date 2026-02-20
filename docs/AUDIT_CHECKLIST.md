# Audit Checklist MVP Rizquna ERP

## 1. Data Integrity
- [ ] Jalankan `php artisan migrate:fresh --seed` tanpa error.
- [ ] Verifikasi `users`, `roles`, `permissions`, `activity_log`, `authors`, `books`, `contracts`, `sales`, `royalty_calculations`, `payments` terbuat.
- [ ] Verifikasi unique constraint:
  - [ ] `books.isbn`
  - [ ] `sales.marketplace_id + transaction_id`
  - [ ] `royalty_calculations.period_month + author_id`

## 2. Access Control (RBAC)
- [ ] Admin bisa akses semua modul.
- [ ] Legal hanya bisa kontrak/master data legal.
- [ ] Marketing tidak bisa import sales.
- [ ] Finance bisa import sales, hitung royalti, dan mark paid.

## 3. Critical Business Flow
- [ ] Upload kontrak -> approve -> buku bisa di-assign.
- [ ] Kontrak overlap approved ditolak.
- [ ] Sales status `refunded` tidak dihitung royalti.
- [ ] Royalti finalized tidak bisa diedit via proses hitung normal.
- [ ] Invoice hanya dari royalti finalized.

## 4. Audit Trail
- [ ] Event create/update status kontrak tercatat di `activity_log`.
- [ ] Event import sales tercatat.
- [ ] Event finalize royalty tercatat.
- [ ] Event mark paid tercatat.
- [ ] Ekspor audit bulanan berhasil: `php artisan audit:export YYYY-MM`.

## 5. Scheduler & Automation
- [ ] `contracts:expire` berjalan harian.
- [ ] `contracts:notify-expiring` kirim payload ke n8n.
- [ ] `audit:export` terjadwal bulanan.

## 6. Test Quality Gate
- [ ] `php artisan test` lulus 100%.
- [ ] Tidak ada test flaky di 2x run beruntun.

## 7. Backup & Restore
- [ ] Backup DB berhasil dibuat (`./scripts/backup_db.sh`).
- [ ] Restore diuji minimal 1x sukses (recommended: `./scripts/verify_backup_restore.sh` untuk Docker dev, atau restore ke DB temporary di staging).
