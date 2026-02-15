# UAT Checklist Final - Rizquna ERP MVP

Tanggal: 2026-02-15

Dokumen ini adalah checklist UAT yang bisa ditandatangani untuk gate staging/go-live.

Referensi skenario naratif: `erp/docs/UAT_RUNBOOK.md`.

## Prasyarat
- `php artisan migrate:fresh --seed` berhasil.
- Akun role tersedia:
  - Admin
  - Legal
  - Marketing
  - Finance
- Marketplace minimal 1 aktif.
- Sample CSV sales berisi `completed` dan `refunded`.

## Checklist UAT

### A. Legalitas Kontrak (Role: Legal)
- [ ] Buat `Author`.
- [ ] Buat `Book` untuk author.
- [ ] Upload kontrak PDF (status awal `pending`).
- [ ] Approve kontrak (status menjadi `approved`).
- [ ] Coba approve kontrak yang overlap untuk buku yang sama -> sistem menolak (HTTP 409).

### B. Distribusi Marketplace (Role: Marketing)
- [ ] Assign buku ke marketplace (hanya jika kontrak `approved` aktif).
- [ ] Coba assign buku tanpa kontrak `approved` aktif -> sistem menolak (validasi).

### C. Import Sales (Role: Finance)
- [ ] Import CSV periode `YYYY-MM`.
- [ ] Sistem menolak baris dengan `status` selain `completed/refunded`.
- [ ] Sistem menolak `transaction_id` duplikat untuk marketplace yang sama.
- [ ] Pastikan `refunded` tetap tersimpan sebagai sales namun tidak dihitung royalti.

### D. Royalti Bulanan (Role: Finance)
- [ ] Jalankan calculate royalty untuk periode `YYYY-MM`.
- [ ] Verifikasi formula: `qty * net_price * (royalty_percentage/100)`.
- [ ] Finalize royalty.
- [ ] Coba calculate ulang untuk author/periode yang sudah finalized -> sistem menolak (HTTP 409).

### E. Invoice & Payment (Role: Finance)
- [ ] Generate invoice hanya dari royalty finalized.
- [ ] Mark paid payment.
- [ ] Status royalty ikut berubah menjadi `paid`.

### F. Audit & Rekonsiliasi (Admin/Finance)
- [ ] Pastikan aksi kritis tercatat di `activity_log`.
- [ ] Jalankan `php artisan audit:export YYYY-MM` dan pastikan file CSV terbentuk.
- [ ] Sampling minimal 30 transaksi untuk rekonsiliasi manual (Finance).

## Sign-off
- [ ] Legal
- [ ] Marketing
- [ ] Finance
- [ ] Admin/PM

