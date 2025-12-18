# FLOW – Alur Sistem Absensi

## 1. Check-in

1. User login
2. Sistem validasi role & kategori
3. Validasi lokasi
4. (Jika KEBUN) validasi foto
5. Simpan attendance record

## 2. Check-out

1. User pilih check-out
2. Validasi lokasi
3. (Jika KEBUN) upload foto pulang
4. Simpan waktu pulang

## 3. Pengajuan

### Izin / Lembur / Koreksi

1. Karyawan submit
2. Status: PENDING
3. OWNER approve / reject (izin & lembur)
4. ADMIN proses koreksi teknis

## 4. Koreksi oleh ADMIN

1. Cek payroll period
2. Jika unlocked → boleh koreksi
3. Simpan audit trail
4. Update data absensi

## 5. Payroll Period

1. OWNER lock period
2. Semua data jadi read-only
3. Digunakan untuk rekap gaji
