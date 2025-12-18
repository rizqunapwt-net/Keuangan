# SPEC – Sistem Absensi Online

## 1. Tujuan

Membangun sistem absensi online profesional untuk UMKM yang:

- audit-ready
- aturan bisnis jelas & ketat
- bisa dikembangkan bertahap
- tidak bergantung pada satu AI / tools

## 2. Ruang Lingkup

Termasuk:

- manajemen user & role (OWNER, ADMIN, KARYAWAN)
- absensi masuk & pulang
- izin, lembur, koreksi absensi
- payroll period (lock/unlock)
- audit trail

Tidak termasuk (sementara):

- fingerprint device
- face recognition otomatis
- integrasi mesin absensi fisik

## 3. Prinsip Besar

1. Aturan bisnis > kode
2. Payroll period lock = final
3. Audit trail wajib
4. Role separation ketat
5. Konsistensi > banyak fitur

## 4. Role Final

- OWNER
- ADMIN
- KARYAWAN

Tidak ada role lain.
Username ≠ role.

## 5. Kategori Karyawan

- REGULER
- MAHASISWA
- KEBUN

Kategori memengaruhi aturan absensi & validasi.

## 6. Status Dokumen

Dokumen ini adalah sumber kebenaran utama (single source of truth).
Perubahan harus sadar & terdokumentasi.
