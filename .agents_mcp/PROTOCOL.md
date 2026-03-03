# Protocol Komunikasi Antar Agent (V1.0)

Sebagai AI Agent yang bekerja pada proyek **Rizquna Kasir - ERP Finance**, kita wajib mengikuti aturan berikut untuk mencegah kesalahan koordinasi, redundansi, dan halusinasi:

## 1. Aturan Emas (The Golden Rule)
Setiap AI Agent **WAJIB** membaca file `PROJECT_STATE.md` dan `ARCHITECTURE_MAP.md` sebelum melakukan perubahan apapun.

## 2. Aturan Perubahan Database (Database Mutations)
- Dilarang membuat tabel baru tanpa mendiskusikan relasi dengan modul keuangan utama.
- Setiap migrasi Laravel baru harus dicatat dalam `ARCHITECTURE_MAP.md`.
- Wajib menggunakan `DB::transaction()` untuk operasi yang melibatkan saldo kas/bank.

## 3. Standar Frontend (UI/UX)
- Gunakan **Ant Design** sebagai framework UI utama.
- Gunakan **React Query (TanStack Query)** untuk sinkronisasi data API.
- Konsistensi warna: Hijau (`#10b981`) untuk pemasukan/kredit, Merah (`#ef4444`) untuk pengeluaran/debet.

## 4. Pelaporan Setiap Tugas
Setiap kali operasi selesai (misalnya: menambah fitur invoice), Agent harus memperbarui `PROJECT_STATE.md` untuk memberitahu Agent lain apa yang telah diselesaikan dan apa langkah selanjutnya.

## 5. Koordinasi 7 Agent (The Seven Pillars)
Untuk memastikan 6 agent lainnya bekerja selaras, berikut adalah pembagian peran (Role):
1. **Agent Finance**: Fokus pada invoice, hutang, dan piutang.
2. **Agent Treasury**: Fokus pada buku kas, bank, dan saldo.
3. **Agent Percetakan**: Fokus pada order cetakan dan material.
4. **Agent UI/UX**: Fokus pada estetika, Ant Design, dan CSS.
5. **Agent Security**: Fokus pada Auth, Sanctum, dan Audit Log.
6. **Agent Data**: Fokus pada export Excel/PDF dan statistik.
7. **Agent Lead (Antigravity)**: Penanggung jawab arsitektur dan koordinasi MCP.

## 6. Prosedur "Handshake" Setiap Sesi
Setiap kali agent baru masuk:
1. **READ**: Panggil `project://state` untuk tahu apa yang terakhir dikerjakan agent lain.
2. **ALIGN**: Panggil `project://map` agar tidak salah menebak folder/tabel.
3. **WORK**: Mulai modifikasi kode.
4. **REPORT**: Panggil tool `report_progress` dengan detail apa yang diubah.

## 7. Penanganan Konflik (Anti-Ego)
- Jika dua agent harus mengedit file yang sama (misal `App.tsx`), agent harus memeriksa `logs/activity.log` terlebih dahulu.
- Selalu gunakan `render_diffs` atau tool visual sebelum menyetujui perubahan besar.
