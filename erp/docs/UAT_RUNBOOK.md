# UAT Runbook MVP Rizquna ERP

## Tujuan
Validasi proses end-to-end Legal -> Marketing -> Finance dengan data realistis sebelum go-live.

## Prasyarat
- Database fresh dan seeded.
- Akun role: Admin, Legal, Marketing, Finance.
- Sample CSV sales dengan transaksi `completed` dan `refunded`.

## Skenario UAT Utama

### Skenario 1: Legalitas & Distribusi
1. Legal buat Author + Book.
2. Legal upload kontrak PDF (`pending`).
3. Legal approve kontrak (`approved`).
4. Marketing assign buku ke marketplace.

Expected:
- Assignment berhasil karena kontrak approved aktif.

### Skenario 2: Blokir Distribusi Tanpa Kontrak Approved
1. Buat buku baru tanpa kontrak approved.
2. Marketing coba assignment.

Expected:
- Ditolak dengan pesan validasi.

### Skenario 3: Import Sales & Royalti
1. Finance import CSV sales periode bulan berjalan.
2. Pastikan ada transaksi `completed` dan `refunded`.
3. Finance trigger calculate royalty.
4. Finance finalize royalty.

Expected:
- Hanya `completed` masuk perhitungan.
- Nilai sesuai formula: `qty * net_price * royalty_percentage/100`.

### Skenario 4: Invoice & Payment
1. Finance generate invoice dari royalty finalized.
2. Finance mark paid.

Expected:
- Invoice terbentuk.
- Status payment `paid`.
- Status royalty ikut `paid`.

### Skenario 5: Audit & Rekonsiliasi
1. Jalankan `php artisan audit:export YYYY-MM`.
2. Cek file CSV audit.
3. Rekonsiliasi total sales completed vs total royalty.

Expected:
- Semua aksi kritis terekam.
- Rekonsiliasi konsisten.

## Sign-off
- [ ] Legal sign-off
- [ ] Marketing sign-off
- [ ] Finance sign-off
- [ ] Admin/PM sign-off
