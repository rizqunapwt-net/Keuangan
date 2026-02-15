# Backlog MVP - Rizquna ERP

Backlog ini diturunkan dari `4.md` (Rizquna ERP Master Spec v1).
Skala estimasi:
- S: <= 2 hari
- M: 3-5 hari
- L: 6-10 hari

Prioritas:
- P0: wajib untuk go-live MVP
- P1: penting tapi bisa menyusul jika waktu mepet
- P2: nice-to-have

## Epic 0 - Foundation

### Story FND-01
Sebagai Admin, saya ingin sistem berjalan stabil di server agar tim dapat mulai operasional.

- Task FND-01-01: Setup Docker Compose (app, postgres, redis, nginx). `M` `P0`
- Task FND-01-02: Setup environment variable dan secret baseline. `S` `P0`
- Task FND-01-03: Setup HTTPS (SSL) dan hardening Nginx dasar. `S` `P0`
- Task FND-01-04: Setup health check endpoint. `S` `P1`
- DoD: Aplikasi dapat diakses via HTTPS dan service lulus health check.

### Story FND-02
Sebagai Admin, saya ingin user dan role terkelola agar akses sesuai tugas.

- Task FND-02-01: Install dan konfigurasi role-permission package. `S` `P0`
- Task FND-02-02: Seeder role default (Admin, Legal, Marketing, Finance). `S` `P0`
- Task FND-02-03: User CRUD di Filament + assign role. `M` `P0`
- Task FND-02-04: Policy dasar per modul. `M` `P0`
- DoD: User bisa login dan hak akses mengikuti role.

### Story FND-03
Sebagai Auditor internal, saya ingin semua aksi kritis tercatat agar dapat ditelusuri.

- Task FND-03-01: Pasang audit log untuk model kritis. `S` `P0`
- Task FND-03-02: Simpan metadata log (user, ip, old/new values). `S` `P0`
- Task FND-03-03: Buat halaman read-only audit di admin. `M` `P1`
- DoD: Create/update/delete/status change tercatat otomatis.

## Epic 1 - Master Data

### Story MD-01
Sebagai Legal, saya ingin mengelola data penulis agar pembayaran royalti valid.

- Task MD-01-01: Migration + model `authors`. `S` `P0`
- Task MD-01-02: Filament Resource Author (CRUD + validasi). `M` `P0`
- Task MD-01-03: Upload KTP (file storage S3-compatible). `S` `P1`
- Task MD-01-04: Enkripsi field sensitif (rekening/NPWP bila diperlukan). `M` `P1`
- DoD: Author dapat dibuat, diubah, dicari, dan disimpan valid.

### Story MD-02
Sebagai Legal, saya ingin mengelola data buku agar siap dikontrakkan dan didistribusikan.

- Task MD-02-01: Migration + model `books`. `S` `P0`
- Task MD-02-02: Constraint ISBN unique (nullable). `S` `P0`
- Task MD-02-03: Filament Resource Book (CRUD + upload cover). `M` `P0`
- Task MD-02-04: Relasi buku-penulis via `book_author`. `M` `P0`
- DoD: Buku dapat dikelola dan terhubung ke penulis.

### Story MD-03
Sebagai Marketing, saya ingin master marketplace agar assignment konsisten.

- Task MD-03-01: Migration + model `marketplaces`. `S` `P0`
- Task MD-03-02: Filament Resource Marketplace (CRUD). `S` `P0`
- DoD: Marketplace aktif/nonaktif dapat dikelola.

## Epic 2 - Legal & Permission

### Story LGL-01
Sebagai Legal, saya ingin upload kontrak agar legalitas buku terdokumentasi.

- Task LGL-01-01: Migration + model `contracts`. `S` `P0`
- Task LGL-01-02: Upload PDF kontrak ke S3-compatible storage. `M` `P0`
- Task LGL-01-03: Validasi tanggal kontrak dan royalty_percentage. `S` `P0`
- DoD: Kontrak tersimpan valid dan terkait buku.

### Story LGL-02
Sebagai Legal, saya ingin approve/reject kontrak agar hanya buku legal yang diproses.

- Task LGL-02-01: Action approve/reject di UI. `S` `P0`
- Task LGL-02-02: Simpan approver, approved_at, notes rejection. `S` `P0`
- Task LGL-02-03: Cegah multi kontrak approved aktif di buku yang sama. `M` `P0`
- DoD: Workflow status kontrak berjalan dan ter-log.

### Story LGL-03
Sebagai Legal, saya ingin pengingat kontrak habis agar tidak lewat masa berlaku.

- Task LGL-03-01: Job harian cek kontrak mendekati `end_date`. `S` `P1`
- Task LGL-03-02: Trigger notifikasi email via n8n webhook. `M` `P1`
- DoD: Pengingat kontrak muncul/sampai ke penerima.

## Epic 3 - Marketplace Distribution

### Story MKT-01
Sebagai Marketing, saya ingin assign buku approved ke marketplace.

- Task MKT-01-01: Migration + model `assignments`. `S` `P0`
- Task MKT-01-02: Form assignment dengan filter buku approved saja. `M` `P0`
- Task MKT-01-03: Simpan product_url dan posting_status. `S` `P0`
- DoD: Assignment berhasil, buku non-approved ditolak.

### Story MKT-02
Sebagai Marketing, saya ingin update status posting agar progres distribusi terlihat.

- Task MKT-02-01: Status flow `draft/posted/removed`. `S` `P0`
- Task MKT-02-02: Activity log untuk status update. `S` `P1`
- DoD: Status posting dapat diperbarui sesuai role.

## Epic 4 - Sales & Royalty

### Story FIN-01
Sebagai Finance, saya ingin impor sales CSV agar kalkulasi tidak manual.

- Task FIN-01-01: Migration + model `sales`. `S` `P0`
- Task FIN-01-02: Parser CSV + validator kolom wajib. `M` `P0`
- Task FIN-01-03: Reject row invalid dengan laporan error. `M` `P0`
- Task FIN-01-04: Proses import via queue untuk file besar. `M` `P1`
- DoD: CSV valid terimpor, CSV invalid memberi error jelas.

### Story FIN-02
Sebagai Finance, saya ingin hitung royalti per periode secara otomatis.

- Task FIN-02-01: Migration + model `royalty_calculations` dan `royalty_items`. `M` `P0`
- Task FIN-02-02: Service kalkulasi formula MVP (qty * net_price * rate). `M` `P0`
- Task FIN-02-03: Agregasi hasil per penulis per periode. `M` `P0`
- Task FIN-02-04: Lock status `finalized` agar tidak bisa diubah. `S` `P0`
- DoD: Hasil kalkulasi akurat dan dapat difinalisasi.

### Story FIN-03
Sebagai Finance, saya ingin menghasilkan dokumen royalti agar siap dibayar.

- Task FIN-03-01: Template PDF laporan royalti per penulis. `M` `P0`
- Task FIN-03-02: Endpoint/download dokumen hasil kalkulasi. `S` `P0`
- DoD: Laporan royalti PDF dapat diunduh per periode.

## Epic 5 - Payment

### Story PAY-01
Sebagai Finance, saya ingin membuat invoice dari royalti finalized.

- Task PAY-01-01: Migration + model `payments`. `S` `P0`
- Task PAY-01-02: Generate invoice PDF dari data finalized. `M` `P0`
- Task PAY-01-03: Simpan path invoice dan metadata pembayaran. `S` `P0`
- DoD: Invoice hanya bisa dibuat dari kalkulasi finalized.

### Story PAY-02
Sebagai Finance, saya ingin menandai pembayaran selesai.

- Task PAY-02-01: Aksi mark paid + `paid_at`. `S` `P0`
- Task PAY-02-02: Catat payment method dan reference. `S` `P1`
- DoD: Status pembayaran berubah dan tercatat di audit log.

## Epic 6 - Dashboard & Reporting

### Story RPT-01
Sebagai Manajemen, saya ingin dashboard KPI agar status operasional terlihat cepat.

- Task RPT-01-01: Widget total books/authors. `S` `P0`
- Task RPT-01-02: Widget pending contracts. `S` `P0`
- Task RPT-01-03: Widget expiring contracts. `S` `P1`
- Task RPT-01-04: Widget royalty outstanding. `S` `P1`
- DoD: Dashboard tampil cepat dan angka konsisten.

### Story RPT-02
Sebagai user operasional, saya ingin export laporan agar mudah dikirim.

- Task RPT-02-01: Export approved books (Excel). `S` `P1`
- Task RPT-02-02: Export payment status (Excel). `S` `P1`
- DoD: File export dapat diunduh sesuai filter periode.

## Epic 7 - QA, UAT, dan Go-Live

### Story QA-01
Sebagai tim QA, saya ingin regression test agar bug kritis tidak lolos.

- Task QA-01-01: Unit test service royalti. `M` `P0`
- Task QA-01-02: Feature test workflow kontrak. `M` `P0`
- Task QA-01-03: Feature test import sales CSV. `M` `P0`
- Task QA-01-04: Feature test payment lifecycle. `M` `P0`
- DoD: Semua test P0 lulus di CI.

### Story GO-01
Sebagai tim proyek, saya ingin cutover aman agar transisi ke sistem baru mulus.

- Task GO-01-01: Final data migration dari spreadsheet. `M` `P0`
- Task GO-01-02: Data validation sampling bersama user bisnis. `S` `P0`
- Task GO-01-03: Go-live checklist + rollback plan. `S` `P0`
- Task GO-01-04: Hypercare 14 hari + daily issue triage. `M` `P0`
- DoD: Sistem live, isu kritis ditangani dalam SLA.

## Ringkasan Prioritas
- Total task P0: baseline wajib go-live.
- Total task P1: ditargetkan selesai jika kapasitas sprint memungkinkan.
- Total task P2: ditunda ke fase pasca-MVP.

## Dependensi Kritis
- Epic 0 -> Epic 1 -> Epic 2 -> Epic 4 -> Epic 5 -> Epic 7.
- Epic 3 dapat paralel setelah Epic 2.
- Epic 6 berjalan setelah modul inti menghasilkan data.
