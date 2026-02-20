# Author Portal - Portal Penulis dengan Transparansi Royalti

**Tanggal:** 20 Februari 2026  
**Status:** ✅ COMPLETED

---

## 📋 RINGKASAN

Implementasi **Portal Penulis** dengan fitur transparansi royalti untuk Rizquna ERP. Portal ini memungkinkan penulis untuk:
- Memantau buku mereka
- Melihat kontrak penjualan
- Tracking royalti dengan detail breakdown
- Melihat data penjualan real-time dari semua marketplace

---

## 🎯 FITUR UTAMA

### 1. **Role & Permission System**
- ✅ Role: `Author`
- ✅ 9 permissions khusus penulis
- ✅ Auto-assign role saat user dibuat

### 2. **Author Dashboard**
- ✅ Statistik real-time (buku, kontrak, royalti, penjualan)
- ✅ Visual progress tracking
- ✅ Quick overview semua aktivitas

### 3. **Book Management**
- ✅ List semua buku penulis
- ✅ Status tracking (draft, production, published)
- ✅ Stock monitoring
- ✅ ISBN tracking

### 4. **Contract Transparency**
- ✅ Lihat semua kontrak aktif
- ✅ Status kontrak (pending, approved, rejected, expired)
- ✅ Royalty percentage disclosure
- ✅ Periode kontrak jelas

### 5. **Royalty Tracking**
- ✅ Perhitungan royalti detail
- ✅ Breakdown per marketplace
- ✅ Status pembayaran (calculated, paid, pending)
- ✅ Platform fee transparency
- ✅ Downloadable reports

### 6. **Sales Transparency**
- ✅ Real-time sales data
- ✅ Filter by periode & marketplace
- ✅ Revenue calculation visible
- ✅ Audit trail lengkap

---

## 🗂️ FILE YANG DIBUAT

### Backend

#### Seeder
```
database/seeders/AuthorRoleSeeder.php
```
- Create `Author` role
- Define 9 permissions
- Create test author user

#### Controller
```
app/Http/Controllers/Api/V1/AuthorPortalController.php
```
Methods:
- `dashboard()` - Dashboard statistics
- `books()` - List author's books
- `contracts()` - List author's contracts
- `royalties()` - List royalty calculations
- `sales()` - List sales (transparency)
- `royaltyReport()` - Detailed royalty breakdown

#### Routes
```php
// routes/api.php
Route::middleware('role:Author')->group(function () {
    Route::get('/author/dashboard', [AuthorPortalController::class , 'dashboard']);
    Route::get('/author/books', [AuthorPortalController::class , 'books']);
    Route::get('/author/contracts', [AuthorPortalController::class , 'contracts']);
    Route::get('/author/royalties', [AuthorPortalController::class , 'royalties']);
    Route::get('/author/royalties/{id}/report', [AuthorPortalController::class , 'royaltyReport']);
    Route::get('/author/sales', [AuthorPortalController::class , 'sales']);
});
```

### Frontend

```
admin-panel/src/pages/nre/AuthorDashboardPage.tsx
```
- Dashboard dengan 4 statistic cards
- Tabs system (Buku, Kontrak, Royalti, Penjualan)
- Modal detail royalti dengan breakdown
- Responsive design

---

## 🔐 PERMISSIONS

### Author Permissions (9 permissions):

```php
$authorPermissions = [
    // Contract
    'author_contracts_read',      // Baca kontrak
    'author_contracts_sign',      // Tanda tangan kontrak
    
    // Books
    'author_books_read',          // Baca data buku
    'author_books_write',         // Edit buku sendiri
    
    // Royalties
    'author_royalties_read',      // Baca royalti
    'author_royalty_reports_read', // Baca laporan royalti
    
    // Sales (transparency)
    'author_sales_read',          // Baca penjualan (transparansi)
    
    // Profile
    'author_profile_write',       // Edit profil sendiri
];
```

---

## 📊 DATABASE SCHEMA

### Authors Table (sudah ada)
```php
Schema::create('authors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->text('bio')->nullable();
    $table->string('photo_path')->nullable();
    $table->string('bank_name')->nullable();
    $table->string('bank_account')->nullable();
    $table->decimal('royalty_percentage', 5, 2)->default(10);
    $table->timestamps();
});
```

### Contracts Table (sudah ada)
```php
Schema::create('contracts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('book_id')->constrained()->cascadeOnDelete();
    $table->foreignId('marketplace_id')->constrained()->cascadeOnDelete();
    $table->string('contract_number')->unique();
    $table->date('start_date');
    $table->date('end_date');
    $table->decimal('royalty_percentage', 5, 2);
    $table->string('status'); // pending, approved, rejected, expired
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

### Royalty Calculations Table (sudah ada)
```php
Schema::create('royalty_calculations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('book_id')->constrained()->cascadeOnDelete();
    $table->string('period_month'); // YYYY-MM
    $table->integer('total_sales');
    $table->decimal('total_revenue', 15, 2);
    $table->decimal('royalty_rate', 5, 2);
    $table->decimal('platform_fee', 15, 2)->default(0);
    $table->decimal('total_royalty', 15, 2);
    $table->string('status'); // calculated, paid, pending
    $table->timestamps();
});
```

---

## 🎯 API ENDPOINTS

### Authentication
Sebelum akses API, user harus login dan dapat token:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "password"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "YOUR_TOKEN_HERE",
    "user": {
      "id": 1,
      "name": "Test Author",
      "email": "author@example.com",
      "role": "Author"
    }
  }
}
```

### Dashboard Statistics

```bash
curl -X GET http://localhost:8000/api/v1/author/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "author": {
      "id": 1,
      "name": "Test Author",
      "email": "author@example.com",
      "bio": "Test author bio",
      "royalty_percentage": 10.00
    },
    "statistics": {
      "total_books": 5,
      "published_books": 3,
      "in_production_books": 1,
      "active_contracts": 4,
      "pending_contracts": 1,
      "total_royalties": 15000000,
      "paid_royalties": 10000000,
      "pending_royalties": 5000000,
      "monthly_sales": 150,
      "monthly_revenue": 12750000
    }
  }
}
```

### Author's Books

```bash
curl -X GET "http://localhost:8000/api/v1/author/books?per_page=15&status=published" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Judul Buku 1",
      "isbn": "978-602-1234-56-7",
      "status": "published",
      "price": 85000,
      "stock": 150,
      "published_year": 2025
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

### Author's Contracts

```bash
curl -X GET http://localhost:8000/api/v1/author/contracts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book": {
        "id": 1,
        "title": "Judul Buku 1"
      },
      "marketplace": {
        "id": 1,
        "name": "Tokopedia"
      },
      "contract_number": "CTR-2026-001",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31",
      "royalty_percentage": 10.00,
      "status": "approved"
    }
  ]
}
```

### Author's Royalties

```bash
curl -X GET "http://localhost:8000/api/v1/author/royalties?period_month=2026-02" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book": {
        "title": "Judul Buku 1"
      },
      "period_month": "2026-02",
      "total_sales": 150,
      "total_revenue": 12750000,
      "royalty_rate": 10.00,
      "platform_fee": 500000,
      "total_royalty": 1225000,
      "status": "calculated"
    }
  ]
}
```

### Royalty Detail Report

```bash
curl -X GET http://localhost:8000/api/v1/author/royalties/1/report \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "royalty": {
      "id": 1,
      "book": { "title": "Judul Buku 1" },
      "period_month": "2026-02",
      "total_sales": 150,
      "total_revenue": 12750000,
      "royalty_rate": 10.00,
      "platform_fee": 500000,
      "total_royalty": 1225000
    },
    "breakdown": {
      "total_sales": 150,
      "total_revenue": 12750000,
      "royalty_rate": 10.00,
      "calculated_royalty": 1275000,
      "platform_fee": 500000,
      "net_royalty": 1225000
    },
    "sales_breakdown": [
      {
        "marketplace": "Tokopedia",
        "quantity": 80,
        "net_price": 85000,
        "subtotal": 6800000
      },
      {
        "marketplace": "Shopee",
        "quantity": 70,
        "net_price": 85000,
        "subtotal": 5950000
      }
    ]
  }
}
```

### Author's Sales (Transparency)

```bash
curl -X GET http://localhost:8000/api/v1/author/sales \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book": {
        "title": "Judul Buku 1"
      },
      "marketplace": {
        "name": "Tokopedia"
      },
      "period_month": "2026-02",
      "quantity": 80,
      "net_price": 85000,
      "created_at": "2026-02-15T10:30:00Z"
    }
  ]
}
```

---

## 🎨 FRONTEND UI

### Dashboard Overview
```
┌─────────────────────────────────────────────────────┐
│  📚 Portal Penulis                                  │
│  Dashboard transparansi untuk penulis               │
└─────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Kontrak  │ │ Total    │ │ Penjualan│
│ Buku     │ │ Aktif    │ │ Royalti  │ │ Bulan Ini│
│    5     │ │    4     │ │ 15.0jt   │ │   150    │
│ 3 terbit │ │ 1 pending│ │ 10jt cair│ │ 12.75jt  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────┐
│ [📚 Buku Saya] [📄 Kontrak] [💰 Royalti] [📊 Penjualan] │
└─────────────────────────────────────────────────────┘
```

### Tab 1: Buku Saya
- Table dengan kolom: Judul, ISBN, Status, Harga, Stock
- Status badge: Published (hijau), Production (biru), Draft (abu)

### Tab 2: Kontrak
- Alert info tentang transparansi
- Table: Judul Buku, Marketplace, Royalti %, Periode, Status

### Tab 3: Royalti
- Alert success tentang transparansi
- Table: Buku, Periode, Total Penjualan, Royalti, Status, Aksi
- Button "Detail" untuk lihat breakdown

### Tab 4: Penjualan
- Alert success tentang data real-time
- Table: Buku, Marketplace, Periode, Jumlah, Harga, Total

### Royalty Detail Modal
```
┌─────────────────────────────────────────────────────┐
│ Detail Perhitungan Royalti               [Tutup]    │
├─────────────────────────────────────────────────────┤
│ Buku: Judul Buku 1                                   │
│ Periode: 2026-02                                     │
│ Total Penjualan: 150 buku                            │
│ Total Revenue: Rp 12.750.000                         │
│ Royalti Rate: 10%                                    │
│ Platform Fee: Rp 500.000                             │
│ Royalti Kotor: Rp 1.275.000                          │
│ Royalti Bersih: Rp 1.225.000                         │
├─────────────────────────────────────────────────────┤
│ Breakdown per Marketplace                            │
│ ┌────────────┬─────────┬──────────┬───────────────┐ │
│ │ Marketplace│ Quantity│ Harga    │ Subtotal      │ │
│ ├────────────┼─────────┼──────────┼───────────────┤ │
│ │ Tokopedia  │   80    │ Rp 85rb  │ Rp 6.800.000  │ │
│ │ Shopee     │   70    │ Rp 85rb  │ Rp 5.950.000  │ │
│ └────────────┴─────────┴──────────┴───────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 TESTING

### 1. Setup Test Author

```bash
php artisan db:seed --class=AuthorRoleSeeder
```

Output:
```
Author role and permissions created successfully!
Test author user created:
  Email: author@example.com
  Password: password
  Role: Author
```

### 2. Test Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "password"
  }'
```

### 3. Test Dashboard Access

```bash
curl -X GET http://localhost:8000/api/v1/author/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Frontend Testing

1. Login sebagai author:
   - Email: `author@example.com`
   - Password: `password`

2. Akses menu "Portal Penulis"

3. Verifikasi:
   - ✅ Dashboard statistics muncul
   - ✅ Tab Buku Saya menampilkan data
   - ✅ Tab Kontrak menampilkan kontrak aktif
   - ✅ Tab Royalti menampilkan perhitungan
   - ✅ Tab Penjualan menampilkan data real-time
   - ✅ Click "Detail" di royalti menampilkan breakdown

---

## 🔒 SECURITY

### Authorization
- ✅ User harus memiliki role `Author`
- ✅ Token-based authentication (Sanctum)
- ✅ Middleware `role:Author` di semua routes

### Data Isolation
- ✅ Author hanya bisa lihat buku mereka sendiri
- ✅ Filter by `author_id` di semua query
- ✅ Contract hanya untuk buku author tersebut
- ✅ Royalty hanya untuk buku author tersebut

### Permission Checks
```php
// Di controller
if (!$user->hasRole('Author')) {
    return null;
}

// Di requests
public function authorize(): bool
{
    return auth()->check() && auth()->user()->hasRole('Author');
}
```

---

## 📝 WORKFLOW

### Author Journey

```
1. Author mendaftar
   └─> Admin approve & assign role "Author"
   
2. Author login ke portal
   └─> Dashboard menampilkan statistik
   
3. Author upload naskah
   └─> Status: draft → review → production
   
4. Buku terbit
   └─> Status: published
   └─> Admin buat kontrak
   
5. Author tanda tangan kontrak
   └─> Status: approved
   
6. Buku dijual di marketplace
   └─> Sales data masuk real-time
   └─> Author bisa lihat di tab "Penjualan"
   
7. Akhir bulan
   └─> Sistem hitung royalti otomatis
   └─> Author dapat notifikasi
   
8. Author cek royalti
   └─> Lihat detail breakdown
   └─> Transparansi 100%
   
9. Admin bayar royalti
   └─> Status: paid
   └─> Author dapat konfirmasi
```

---

## 🚀 DEPLOYMENT

### 1. Run Seeder

```bash
php artisan db:seed --class=AuthorRoleSeeder
```

### 2. Clear Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 3. Build Frontend

```bash
cd admin-panel
npm install
npm run build
```

### 4. Test Access

```
http://localhost:8000/admin
→ Login: author@example.com / password
→ Menu: Portal Penulis
```

---

## 📊 ROYALTY CALCULATION FORMULA

### Transparansi Perhitungan:

```
Total Revenue = Σ(quantity × net_price) untuk semua sales
Calculated Royalty = Total Revenue × (royalty_rate / 100)
Platform Fee = fixed amount atau percentage (tergantung kontrak)
Net Royalty = Calculated Royalty - Platform Fee
```

### Contoh:

```
Buku: "Judul Buku 1"
Periode: Februari 2026

Penjualan:
- Tokopedia: 80 buku × Rp 85.000 = Rp 6.800.000
- Shopee: 70 buku × Rp 85.000 = Rp 5.950.000
Total Revenue: Rp 12.750.000

Royalty Rate: 10%
Calculated Royalty: Rp 12.750.000 × 10% = Rp 1.275.000
Platform Fee: Rp 500.000
Net Royalty: Rp 1.275.000 - Rp 500.000 = Rp 775.000
```

**Author bisa lihat semua detail ini di portal!**

---

## 🎯 BENEFITS

### Untuk Penulis:
1. ✅ **Transparansi 100%** - Semua data penjualan visible
2. ✅ **Real-time Tracking** - Pantau penjualan kapan saja
3. ✅ **Detail Royalti** - Breakdown jelas per marketplace
4. ✅ **Kontrak Jelas** - Status & periode kontrak terlihat
5. ✅ **Trust Building** - Tidak ada hidden fees

### Untuk Publisher:
1. ✅ **Automated Reporting** - Tidak perlu manual report
2. ✅ **Trust dari Author** - Transparansi bangun kepercayaan
3. ✅ **Reduced Disputes** - Semua data terbuka
4. ✅ **Professional Image** - Sistem modern & transparan

---

## 📞 NEXT STEPS (Optional)

### Short Term:
1. [ ] Email notification saat royalti dihitung
2. [ ] Download PDF royalty report
3. [ ] Author profile editing
4. [ ] Book submission form untuk author

### Medium Term:
1. [ ] Digital contract signing (e-signature)
2. [ ] Royalty payment via bank transfer (auto)
3. [ ] Sales analytics charts
4. [ ] Mobile app untuk author

### Long Term:
1. [ ] Multi-author books support
2. [ ] International royalty (multi-currency)
3. [ ] Blockchain-based royalty tracking
4. [ ] AI-powered sales forecasting

---

## 🔗 RELATED FILES

- Controller: `app/Http/Controllers/Api/V1/AuthorPortalController.php`
- Seeder: `database/seeders/AuthorRoleSeeder.php`
- Frontend: `admin-panel/src/pages/nre/AuthorDashboardPage.tsx`
- Routes: `routes/api.php` (lines 96-103)
- Models: `app/Models/Author.php`, `app/Models/Book.php`, `app/Models/Contract.php`, `app/Models/RoyaltyCalculation.php`

---

## ✅ CHECKLIST IMPLEMENTASI

- [x] Role & Permission seeder
- [x] Author Portal Controller
- [x] 6 API endpoints
- [x] Frontend Dashboard
- [x] 4 Tab navigation
- [x] Royalty detail modal
- [x] Sales transparency
- [x] Contract visibility
- [x] Book tracking
- [x] Documentation

---

**Implementasi selesai! Portal Penulis dengan transparansi royalti siap digunakan! 🎉**
