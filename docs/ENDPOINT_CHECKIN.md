**Endpoint: POST /attendance/check-in**

Ringkasan singkat

- Tujuan: Merekam aksi check-in (mulai hari kerja) untuk pengguna yang terautentikasi.
- Scope: Hanya dokumentasi; tidak mengubah perilaku backend.

Prasyarat

- User harus terautentikasi menggunakan header `Authorization: Bearer <token>` (JWT).
- Server mengambil `employeeId` dari token — frontend tidak boleh mengirim `employeeId`.

Path & Method

- POST /attendance/check-in

Headers

- Authorization: Bearer <token>  (required)
- Content-Type: application/json

Request body (JSON)

- Optional payload; semua field optional:
  - lat: number — latitude lokasi check-in (mis. -6.200000)
  - lng: number — longitude lokasi check-in (mis. 106.816666)
  - note: string — catatan singkat (maks. 500 karakter)

Validation (ringkas dan deterministik)

- Jika `lat` atau `lng` diberi, harus bertipe number.
- `note` jika diberi harus berupa string dan panjang ≤ 500.

Behavior / Side effects (yang mesti dipegang frontend)

- Server mencatat timestamp check-in (`checkInAt`) saat menerima request.
- Server menyimpan lokasi jika disediakan (`checkInLocation`).
- Server menentukan `employeeId` dari token; frontend tidak mengirimnya.
- Server membuat baris baru pada tabel attendance dan mengembalikan resource yang dibuat.
- Jika pengguna sudah dalam kondisi "sudah check-in" (mis. terdapat record terbuka tanpa `checkOutAt`), server akan menolak request sebagai kondisi konflik.
- Jika periode/payroll untuk tanggal terkait terkunci, server menolak (forbidden) — frontend harus menampilkan pesan tindakan tidak diperbolehkan.

Responses (deterministik, ringkas)

- 201 Created
  - Body: attendance object (JSON) minimal berisi:
    - id: string
    - employeeId: string
    - checkInAt: string (ISO 8601 datetime)
    - checkOutAt: null
    - checkInLocation: { lat: number, lng: number } | null
    - category: string (jika backend mengisi)
  - Note: frontend menampilkan data dari objek ini untuk konfirmasi.

- 400 Bad Request
  - Ketika payload tidak valid (tipe/format salah) — body: { message: string }

- 401 Unauthorized
  - Ketika token tidak ada atau tidak valid — body: { message: string }

- 403 Forbidden
  - Ketika payroll/date lock mencegah perubahan pada tanggal tersebut — body: { message: string }

- 409 Conflict
  - Ketika pengguna sudah ter-check-in dan tidak boleh check-in ganda — body: { message: string }

Contoh permintaan (JSON)
{
  "lat": -6.200000,
  "lng": 106.816666,
  "note": "Datang pagi, rapat tim"
}

Contoh respons sukses (201)
{
  "id": "att_01H...",
  "employeeId": "emp_123",
  "checkInAt": "2025-12-18T07:45:00.000Z",
  "checkOutAt": null,
  "checkInLocation": { "lat": -6.2, "lng": 106.816666 },
  "category": "karyawan"
}

Deterministic guidance untuk frontend integrasi

- Selalu sertakan header `Authorization`.
- Jangan kirim `employeeId` atau `checkInAt` dari klien — server yang mengatur.
- Tangani status 409 sebagai indikasi user sudah check-in; tawarkan tombol "Check-out" atau pesan yang sesuai.
- Tangani 403 dengan pesan bahwa periode/harinya terkunci dan minta user menghubungi admin.
- Tampilkan pesan kesalahan dari body `{ message }` untuk 400/401/403/409.

Jika ada ketidakpastian teknis lebih spesifik (mis. format field `category` yang diharapkan), sebutkan titik yang perlu dikonfirmasi ke tim backend; bila tidak ada, dokumen ini adalah pegangan deterministik untuk frontend.
