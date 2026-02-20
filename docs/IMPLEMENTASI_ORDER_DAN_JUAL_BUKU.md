# Implementasi Order dan Jual Buku - Rizquna ERP

**Tanggal:** 20 Februari 2026  
**Status:** ✅ COMPLETED

---

## 📋 RINGKASAN

Implementasi fitur **Order Cetak** dan **Penjualan Buku** untuk Rizquna ERP berdasarkan dokumen `desain order dan jual buku.docx`.

### Fitur yang Diimplementasikan:

1. **Order Cetak Buku (Print Orders)**
   - Buat order cetak ke vendor
   - Tracking status produksi (pending → approved → in_production → qc → delivered)
   - Auto-update stock saat order delivered
   - Multi-vendor support

2. **Penjualan Buku (Sales)**
   - Catat penjualan per marketplace
   - Tracking per periode bulan
   - Auto-decrease stock saat ada penjualan
   - Sales statistics & reporting

---

## 🗂️ FILE YANG DIBUAT

### Backend (Laravel)

#### Controllers
```
app/Http/Controllers/Api/V1/BookOrderController.php
```
- `orders()` - List print orders dengan filter & pagination
- `storeOrder()` - Buat order cetak baru
- `updateOrderStatus()` - Update status order
- `sales()` - List penjualan dengan filter & pagination
- `storeSale()` - Catat penjualan baru
- `salesStats()` - Statistik penjualan

#### Form Requests
```
app/Http/Requests/StorePrintOrderRequest.php
```
Validasi:
- book_id (required)
- vendor_name (required)
- quantity (required, min: 1)
- unit_cost (required, numeric)
- paper_type, binding_type, cover_type (optional dengan default)
- status (enum: pending, approved, in_production, qc, delivered, cancelled)

```
app/Http/Requests/StoreSaleRequest.php
```
Validasi:
- book_id (required)
- marketplace_id (required)
- period_month (required, format: YYYY-MM)
- quantity (required, min: 1)
- net_price (required, numeric)

#### Routes
```php
// routes/api.php (updated)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Print Orders
    Route::get('/print-orders', [BookOrderController::class , 'orders']);
    Route::post('/print-orders', [BookOrderController::class , 'storeOrder']);
    Route::patch('/print-orders/{order}/status', [BookOrderController::class , 'updateOrderStatus']);

    // Sales
    Route::get('/sales', [BookOrderController::class , 'sales']);
    Route::post('/sales', [BookOrderController::class , 'storeSale']);
    Route::get('/sales/stats', [BookOrderController::class , 'salesStats']);
});
```

### Frontend (React + Ant Design)

```
admin-panel/src/pages/nre/OrderDanJualBukuPage.tsx
```

**Fitur Frontend:**
- ✅ Tabs untuk Order Cetak & Penjualan
- ✅ Table dengan pagination & sorting
- ✅ Modal form untuk create order/sale
- ✅ Status badge dengan warna
- ✅ Action buttons untuk update status
- ✅ Statistics cards (total sales, revenue, transactions)
- ✅ Auto-refresh data
- ✅ Error handling & loading states
- ✅ Responsive design

---

## 📊 DATABASE SCHEMA

### Print Orders Table
```php
Schema::create('print_orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('book_id')->constrained()->cascadeOnDelete();
    $table->string('order_number')->unique(); // Auto-generated: PO-20260220-ABCD
    $table->string('vendor_name');
    $table->string('vendor_contact')->nullable();
    $table->integer('quantity');
    $table->decimal('unit_cost', 12, 2)->default(0);
    $table->decimal('total_cost', 14, 2)->default(0); // Auto-calculated
    $table->string('paper_type')->default('HVS 80gsm');
    $table->string('binding_type')->default('Perfect Binding');
    $table->string('cover_type')->default('Soft Cover');
    $table->integer('page_count')->nullable();
    $table->string('size')->default('A5');
    $table->string('status')->default('pending');
    $table->foreignId('ordered_by')->nullable()->constrained('users')->nullOnDelete();
    $table->date('ordered_at')->nullable();
    $table->date('expected_delivery')->nullable();
    $table->date('delivered_at')->nullable(); // Auto-set saat delivered
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

### Sales Table (sudah ada)
```php
Schema::create('sales', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sales_import_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('marketplace_id')->constrained()->cascadeOnDelete();
    $table->foreignId('book_id')->constrained()->cascadeOnDelete();
    $table->string('transaction_id')->nullable();
    $table->string('period_month'); // Format: YYYY-MM
    $table->integer('quantity');
    $table->decimal('net_price', 12, 2);
    $table->string('status')->default('completed'); // completed, refunded
    $table->foreignId('imported_by')->constrained('users')->cascadeOnDelete();
    $table->timestamps();
});
```

---

## 🔄 WORKFLOW

### Order Cetak Workflow

```
1. User membuat order cetak
   └─> Status: pending
   
2. Admin menyetujui order
   └─> Status: approved
   
3. Vendor mulai produksi
   └─> Status: in_production
   
4. Quality Control
   └─> Status: qc
   
5. Buku diterima di gudang
   └─> Status: delivered
   └─> Stock buku bertambah otomatis
```

### Penjualan Workflow

```
1. User mencatat penjualan
   └─> Validasi: buku harus punya kontrak approved
   
2. Sistem menyimpan penjualan
   └─> Stock buku berkurang otomatis
   
3. Data masuk ke statistik bulanan
   └─> Digunakan untuk kalkulasi royalti
```

---

## 🎯 API ENDPOINTS

### Print Orders

#### GET /api/v1/print-orders
```bash
curl -X GET "/api/v1/print-orders?status=pending&book_id=1&per_page=15" \
  -H "Authorization: Bearer {token}"
```

Response:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

#### POST /api/v1/print-orders
```bash
curl -X POST /api/v1/print-orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "vendor_name": "PT. Gramedia",
    "quantity": 1000,
    "unit_cost": 15000,
    "paper_type": "HVS 80gsm",
    "binding_type": "Perfect Binding",
    "cover_type": "Soft Cover"
  }'
```

#### PATCH /api/v1/print-orders/{id}/status
```bash
curl -X PATCH /api/v1/print-orders/1/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### Sales

#### GET /api/v1/sales
```bash
curl -X GET "/api/v1/sales?book_id=1&period_month=2026-02" \
  -H "Authorization: Bearer {token}"
```

#### POST /api/v1/sales
```bash
curl -X POST /api/v1/sales \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "marketplace_id": 2,
    "period_month": "2026-02",
    "quantity": 50,
    "net_price": 85000
  }'
```

#### GET /api/v1/sales/stats
```bash
curl -X GET "/api/v1/sales/stats?period_month=2026-02" \
  -H "Authorization: Bearer {token}"
```

Response:
```json
{
  "success": true,
  "data": {
    "period_month": "2026-02",
    "total_sales": 1500,
    "total_revenue": 127500000,
    "total_transactions": 45,
    "top_books": [...],
    "sales_by_marketplace": [...]
  }
}
```

---

## 🎨 FRONTEND UI

### Tab 1: Order Cetak
- Table dengan kolom:
  - Order Number
  - Judul Buku
  - Vendor
  - Quantity
  - Total Biaya
  - Status (dengan badge warna)
  - Tanggal Order
  - Aksi (Approve, Cancel, QC, Selesai)

### Tab 2: Penjualan
- Statistics Cards:
  - Total Terjual (buku)
  - Total Revenue (Rp)
  - Total Transaksi
  - Periode Bulan
- Table dengan kolom:
  - Judul Buku
  - Marketplace
  - Periode
  - Quantity
  - Harga Satuan
  - Total
  - Tanggal

### Modal Form
- **Order Cetak:**
  - Pilih Buku (dropdown searchable)
  - Nama Vendor
  - Kontak Vendor
  - Jumlah Cetak
  - Harga Satuan (format Rupiah)
  - Jenis Kertas (dropdown)
  - Jenis Binding (dropdown)
  - Jenis Cover (dropdown)
  - Tanggal Order & Estimasi Pengiriman
  - Catatan

- **Catat Penjualan:**
  - Pilih Buku (dropdown searchable)
  - Pilih Marketplace (dropdown)
  - Periode Bulan (month picker)
  - Jumlah Terjual
  - Harga Bersih per Unit (format Rupiah)
  - ID Transaksi (opsional)

---

## ✅ VALIDATION & BUSINESS LOGIC

### Print Order Validation
- ✅ book_id harus ada di database
- ✅ quantity minimal 1
- ✅ unit_cost harus angka >= 0
- ✅ expected_delivery harus >= ordered_at
- ✅ Auto-generate order_number (PO-YYYYMMDD-XXXX)
- ✅ Auto-calculate total_cost (quantity * unit_cost)

### Sale Validation
- ✅ book_id harus ada di database
- ✅ marketplace_id harus ada di database
- ✅ period_month format YYYY-MM
- ✅ quantity minimal 1
- ✅ net_price harus angka >= 0
- ✅ Validasi kontrak approved aktif (dari Sale model)
- ✅ Auto-decrement book stock

---

## 🔐 PERMISSIONS

Required permissions:
- `publishing_write` - Untuk membuat order dan penjualan
- `publishing_read` - Untuk melihat data

Middleware:
```php
// Di StorePrintOrderRequest & StoreSaleRequest
public function authorize(): bool
{
    return auth()->check() && auth()->user()->hasPermissionTo('publishing_write');
}
```

---

## 🧪 TESTING

### Manual Testing Checklist

#### Order Cetak:
- [ ] Buat order cetak baru
- [ ] Verifikasi auto-generate order_number
- [ ] Verifikasi auto-calculate total_cost
- [ ] Approve order (pending → approved)
- [ ] Update status ke in_production
- [ ] Update status ke qc
- [ ] Update status ke delivered
- [ ] Verifikasi stock bertambah saat delivered
- [ ] Filter by status
- [ ] Filter by book_id
- [ ] Pagination bekerja

#### Penjualan:
- [ ] Catat penjualan baru
- [ ] Verifikasi stock berkurang
- [ ] Validasi kontrak approved (coba buku tanpa kontrak)
- [ ] Lihat statistics cards
- [ ] Filter by period_month
- [ ] Filter by marketplace
- [ ] Export data (jika ada)

### Automated Testing (Optional)
```bash
# Buat test file
php artisan make:test BookOrderApiTest
```

Contoh test:
```php
public function test_can_create_print_order()
{
    $user = User::factory()->create();
    $user->givePermissionTo('publishing_write');
    
    $book = Book::factory()->create();
    
    $response = $this->actingAs($user)->postJson('/api/v1/print-orders', [
        'book_id' => $book->id,
        'vendor_name' => 'PT. Gramedia',
        'quantity' => 1000,
        'unit_cost' => 15000,
    ]);
    
    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Print order created successfully',
        ]);
    
    $this->assertDatabaseHas('print_orders', [
        'book_id' => $book->id,
        'vendor_name' => 'PT. Gramedia',
        'quantity' => 1000,
    ]);
}
```

---

## 📱 MOBILE RESPONSIVE

Frontend sudah responsive dengan:
- ✅ Table scrollable horizontal
- ✅ Modal form adaptive width
- ✅ Form layout dengan Row/Col
- ✅ Touch-friendly buttons

---

## 🚀 DEPLOYMENT

### 1. Run Migrations
```bash
php artisan migrate
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

### 4. Test API
```bash
# Test endpoint
curl http://localhost:8000/api/v1/print-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 NEXT STEPS (Optional Enhancements)

### Short Term:
1. [ ] Export to Excel/PDF untuk order & sales
2. [ ] Email notification saat order status berubah
3. [ ] Upload file attachment untuk order
4. [ ] Print label untuk order delivered

### Medium Term:
1. [ ] Vendor management (dedicated table)
2. [ ] Purchase order automation
3. [ ] Integration dengan marketplace API (Tokopedia, Shopee, etc.)
4. [ ] Sales forecasting

### Long Term:
1. [ ] Barcode scanning untuk inventory
2. [ ] Multi-warehouse support
3. [ ] Production cost tracking
4. [ ] Royalty calculation integration

---

## 🔗 RELATED FILES

- Model: `app/Models/PrintOrder.php`
- Model: `app/Models/Sale.php`
- Model: `app/Models/Book.php`
- Migration: `database/migrations/2026_02_19_200000_create_print_orders_table.php`
- Frontend: `admin-panel/src/pages/nre/OrderDanJualBukuPage.tsx`
- Frontend: `admin-panel/src/pages/nre/PenjualanBukuPage.tsx` (old - bisa dihapus)

---

## 📞 SUPPORT

Untuk pertanyaan atau issue:
1. Check dokumentasi API di `docs/`
2. Test dengan Postman collection (jika ada)
3. Check Laravel logs: `storage/logs/laravel.log`
4. Frontend console: Browser DevTools

---

**Implementasi selesai dan siap digunakan! 🎉**
