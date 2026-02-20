# 📝 PANDUAN LENGKAP - AKUN PENULIS

**Tanggal:** 20 Februari 2026  
**Status:** ✅ COMPLETED

---

## 🚀 CARA PENULIS MENDAPATKAN AKUN

### **Metode 1: Registrasi Mandiri (ONLINE)**

Penulis dapat mendaftar sendiri melalui halaman registrasi:

**URL:** `http://localhost:8000/authors/register`

#### **Langkah-langkah:**

1. **Buka Halaman Registrasi**
   - Akses URL: `/authors/register`
   - Atau klik tombol "Daftar" di halaman login

2. **Langkah 1: Informasi Akun**
   ```
   - Nama Lengkap (wajib, min 3 karakter)
   - Username (wajib, unik, hanya huruf/angka/underscore)
   - Email (wajib, valid email)
   - Password (wajib, min 8 karakter)
   - Konfirmasi Password
   ```

3. **Langkah 2: Profil Penulis**
   ```
   - Nomor Telepon/WhatsApp (wajib)
   - Biografi Singkat (opsional, max 500 karakter)
   ```

4. **Langkah 3: Informasi Bank**
   ```
   - Nama Bank (wajib)
   - Nomor Rekening (wajib, hanya angka)
   - Nama Pemilik Rekening (wajib)
   ```

5. **Selesai!**
   - Akun otomatis dibuat
   - Role "Author" otomatis di-assign
   - Token login diberikan
   - Redirect ke halaman login

#### **Validasi:**

```javascript
// Frontend validation
- Nama: min 3 karakter
- Username: min 3 karakter, unik, regex /^[a-zA-Z0-9_]+$/
- Email: valid email format, unik
- Password: min 8 karakter, harus match confirmation
- Phone: format nomor valid
- Bio: min 10 karakter (opsional)
- Bank: semua field wajib
```

---

### **Metode 2: Didaftarkan oleh Admin**

Admin dapat mendaftarkan penulis secara manual melalui:

1. **Filament Admin Panel**
   - Menu: Authors → Add Author
   - Isi data penulis
   - Sistem otomatis:
     - Create User account
     - Create Author profile
     - Assign "Author" role

2. **Bulk Import** (Future feature)
   - Upload CSV dengan data penulis
   - Sistem create multiple accounts

---

## 🔐 CARA LOGIN

**URL:** `http://localhost:8000/admin/login`

**Credentials:**
- Email atau Username
- Password

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "Bearer TOKEN_HERE",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["Author"]
    }
  }
}
```

---

## 🔄 CARA RESET PASSWORD

### **Jika Lupa Password:**

**URL:** `http://localhost:8000/admin/forgot-password`

#### **Langkah-langkah:**

1. **Buka Halaman Forgot Password**
   - Klik "Lupa Password?" di halaman login
   - Atau akses langsung: `/admin/forgot-password`

2. **Masukkan Email**
   - Gunakan email yang terdaftar
   - Klik "Kirim Link Reset"

3. **Cek Email**
   - Email reset password akan dikirim
   - Berlaku selama 60 menit
   - Cek folder spam jika tidak ada di inbox

4. **Klik Link Reset**
   - URL format: `/authors/reset-password?token=TOKEN&email=EMAIL`
   - Akan redirect ke halaman reset password

5. **Reset Password**
   - Masukkan password baru (min 8 karakter)
   - Konfirmasi password
   - Klik "Reset Password"

6. **Selesai!**
   - Password berhasil direset
   - Redirect ke login
   - Login dengan password baru

---

### **API Endpoints:**

#### **1. Forgot Password**
```bash
POST /api/v1/authors/forgot-password

Request:
{
  "email": "author@example.com"
}

Response:
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda"
}
```

#### **2. Reset Password**
```bash
POST /api/v1/authors/reset-password

Request:
{
  "token": "RESET_TOKEN",
  "email": "author@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password berhasil direset"
}
```

---

## 📋 DATA YANG DISIMPAN

### **Table: users**
```sql
- id
- name
- username (unique)
- email (unique)
- password (hashed)
- is_active (boolean)
- created_at
- updated_at
```

### **Table: authors**
```sql
- id
- user_id (foreign key)
- name
- email
- phone
- bio
- bank_name
- bank_account
- bank_account_name
- status (active/inactive)
- created_at
- updated_at
```

### **Table: model_has_roles**
```sql
- role_id
- model_type (App\Models\User)
- model_id (user_id)
```

---

## 🎯 FITUR YANG DIDAPAT PENULIS

Setelah registrasi, penulis mendapat akses ke:

### **1. Dashboard Statistik**
- Total buku
- Buku published
- Kontrak aktif
- Total royalti
- Penjualan bulan ini

### **2. Manajemen Buku**
- Lihat semua buku
- Update metadata buku
- Tracking status

### **3. Kontrak**
- Lihat kontrak
- Tanda tangan digital (approve/reject)

### **4. Royalti**
- Lihat perhitungan royalti
- Detail breakdown per marketplace
- Tracking pembayaran

### **5. Transparansi Penjualan**
- Real-time sales data
- Filter by periode
- Filter by marketplace

### **6. Profil**
- Update data pribadi
- Update informasi bank

---

## 🔒 KEAMANAN

### **Password Requirements:**
- ✅ Min 8 karakter
- ✅ Hash dengan bcrypt (12 rounds)
- ✅ Confirmation required
- ✅ Token reset expired (60 menit)

### **Email Verification:**
- ⚠️ **NOT YET IMPLEMENTED**
- 📝 **TODO:** Add email verification after registration

### **Rate Limiting:**
- ✅ Forgot password: 3 requests per minute
- ✅ Register: 5 requests per minute
- ✅ Login: 10 requests per minute

---

## 📧 EMAIL TEMPLATES

### **1. Welcome Email (Future)**
```
Subject: Selamat Bergabung di Rizquna!

Halo [Nama],

Selamat! Akun penulis Anda telah berhasil dibuat.

Email: [email]
Username: [username]

Silakan login di: http://localhost:8000/admin/login

Salam,
Tim Rizquna
```

### **2. Reset Password Email**
```
Subject: Reset Password - Rizquna

Halo,

Anda menerima email ini karena ada permintaan reset password.

Klik link berikut untuk reset password:
[RESET_LINK]

Link ini berlaku selama 60 menit.

Jika Anda tidak meminta reset password, abaikan email ini.

Salam,
Tim Rizquna
```

---

## 🛠️ TROUBLESHOOTING

### **Masalah: Email reset tidak diterima**

**Solusi:**
1. Cek folder spam/junk
2. Pastikan email benar
3. Tunggu max 5 menit
4. Request ulang (max 3x)
5. Hubungi admin jika masih bermasalah

### **Masalah: Link reset expired**

**Solusi:**
1. Link hanya berlaku 60 menit
2. Request link baru di halaman forgot password
3. Gunakan link terbaru

### **Masalah: Registrasi gagal**

**Solusi:**
1. Pastikan semua field wajib terisi
2. Cek format email valid
3. Password min 8 karakter
4. Username belum digunakan
5. Cek koneksi internet

---

## 📊 STATISTIK REGISTRASI

**Database:**
```sql
-- Cek jumlah penulis terdaftar
SELECT COUNT(*) FROM authors;

-- Cek penulis aktif
SELECT COUNT(*) FROM authors WHERE status = 'active';

-- Cek user dengan role author
SELECT COUNT(*) FROM model_has_roles 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Author');
```

---

## 🚀 NEXT STEPS (Future Enhancements)

### **Short Term:**
- [ ] Email verification setelah registrasi
- [ ] Welcome email template
- [ ] Upload KTP/SK penulis
- [ ] Approval workflow untuk penulis baru

### **Medium Term:**
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Profile picture upload
- [ ] Portfolio/karya penulis

### **Long Term:**
- [ ] Mobile app untuk penulis
- [ ] Push notifications
- [ ] Chat support untuk penulis
- [ ] Analytics dashboard lebih detail

---

## 📞 KONTAK & SUPPORT

**Untuk bantuan:**
- Email: support@rizquna.id
- WhatsApp: 0812-XXXX-XXXX
- FAQ: `/authors/faq`

**Jam Operasional:**
- Senin - Jumat: 09:00 - 17:00 WIB
- Sabtu: 09:00 - 13:00 WIB
- Minggu: Libur

---

## ✅ CHECKLIST REGISTRASI

**Untuk Penulis:**
- [ ] Nama lengkap diisi
- [ ] Username unik dibuat
- [ ] Email valid dimasukkan
- [ ] Password kuat (min 8 karakter)
- [ ] Nomor telepon aktif
- [ ] Informasi bank lengkap

**Untuk Admin:**
- [ ] Verifikasi email (future)
- [ ] Approve penulis (optional)
- [ ] Send welcome kit
- [ ] Assign mentor (optional)

---

**Dokumentasi selesai!** ✅

**Penulis sekarang bisa:**
- ✅ Registrasi mandiri online
- ✅ Login dengan email/username
- ✅ Reset password jika lupa
- ✅ Akses semua fitur author portal

**Next:** Email verification & approval workflow
