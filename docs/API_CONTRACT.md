**API Contract — Absensi Online (FASE D)**

Ringkasan

- Scope: satu endpoint inti untuk integrasi frontend sebagai pegangan pasti.
- Hanya dokumentasi; tidak menambah endpoint, tidak mengubah backend, tidak menulis kode.

# API CONTRACT – SISTEM ABSENSI

Dokumen ini adalah kontrak resmi antara Backend dan Frontend.
Dokumen ini TIDAK menambah fitur dan TIDAK mengubah aturan bisnis.

---

## 1. Authentication

### POST /auth/login

Digunakan untuk login user (OWNER / ADMIN / KARYAWAN).

**Request Body**

```json
{
  "username": "string",
  "password": "string"
}
```

Response 200

```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "budi",
    "role": "KARYAWAN"
  }
}
```

Error

`401 Unauthorized` → username/password salah

## 2. Attendance

### POST /attendance/check-in

Digunakan oleh KARYAWAN untuk melakukan absensi masuk.

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "attendance_date": "YYYY-MM-DD",
  "location": "string | null",
  "photo": "string | null"
}
```

Catatan:

- `location` dan `photo` WAJIB untuk kategori KEBUN

Untuk kategori lain boleh null

Response 201

```json
{
  "id": 10,
  "attendance_date": "2025-12-18",
  "check_in_time": "2025-12-18T07:10:00Z",
  "status": "HADIR"
}
```

Error

- `401 Unauthorized`
- `403 Forbidden` (bukan KARYAWAN)
- `409 Conflict` (sudah check-in)
- `423 Locked` (payroll period terkunci)

### POST /attendance/check-out

Digunakan oleh KARYAWAN untuk absensi pulang.

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "attendance_date": "YYYY-MM-DD",
  "location": "string | null",
  "photo": "string | null"
}
```

Response 200

```json
{
  "id": 10,
  "check_out_time": "2025-12-18T16:30:00Z"
}
```

Error

- `400 Bad Request` (belum check-in)
- `409 Conflict` (sudah check-out)
- `423 Locked` (payroll period terkunci)

## 3. Attendance Correction

### PUT /attendance/{id}/correct

Digunakan oleh ADMIN untuk koreksi teknis absensi.

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "attendance_date": "YYYY-MM-DD",
  "changes": {
    "check_in_time": "2025-12-18T07:00:00Z"
  },
  "reason": "Jam masuk salah input"
}
```

Response 200

```json
{
  "id": 10,
  "updated": true
}
```

Error

- `403 Forbidden` (bukan ADMIN)
- `400 Bad Request` (reason kosong)
- `423 Locked` (payroll period terkunci)

---

## 🔴 STOP POINT (WAJIB)

- `docs/API_CONTRACT.md` dibuat
- Minimal 1 endpoint absensi terdokumentasi
- Tidak ada kode backend/frontend berubah
- Tidak ada fitur baru
- **STOP**

---

## 📄 LAPORAN (WAJIB)

Buat file:

`docs/LAPORAN_API_CONTRACT.md`

Isi singkat:

- Apa yang dibuat
- Endpoint apa saja
- Status fase (selesai / siap lanjut)

---

## 🧠 STATUS PROYEK SETELAH INI

- **FASE D berjalan**
- Belum lanjut frontend
- Belum OpenAPI YAML
- Backend tetap beku

---

Kalau kamu sudah:

- menyalin isi file
- membuat `LAPORAN_API_CONTRACT.md`

cukup bilang satu kata:

> **STOP**

Saya **tidak akan lanjut fase berikutnya sebelum itu**.
