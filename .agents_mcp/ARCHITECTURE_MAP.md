# Arsitektur Proyek (Reality Map)

Visi: Menjadi sistem ERP keuangan terpadu untuk Penerbitan & Percetakan Rizquna.

## 1. Modul Inti (CORE)
- **Auth**: Laravel Sanctum (Roles: Admin Only).
- **Core Finance**: `FinancialController`, `FinanceReportController`, `DebtController`.
- **Cash Ledger**: `CashTransactionController` (Manajemen Buku Kas & Saldo Bank).

## 2. Struktur Database (Current Migration State)
Tabel-tabel utama yang AKTIF:
- `users`: Administrator.
- `banks`: Akun Kas/Bank (Saldo berjalan).
- `accounting_accounts`: Chart of Accounts (COA).
- `accounting_expenses`: Pencatatan biaya operasional.
- `contacts`: Data Customer/Vendor (Modul Percetakan & Penjualan).
- `debts` & `debt_payments`: Manajemen Utang/Piutang.
- `cash_transactions`: Central Ledger (Buku Kas).
- `percetakan_orders`: Pesanan cetak.

## 3. Fitur yang SUDAH DIHAPUS (Do Not Re-implement)
- **POS**: Fitur Point of Sale (v1) telah dihapus.
- **Inventory/Gudang**: Fitur manajemen stok dan gudang fisik telah dihapus untuk fokus pada arus kas.
- **Product**: Model `Product` telah dihapus. Detail pesanan sekarang langsung di modul Percetakan/Invoice.

## 4. Lokasi File Utama
- **Frontend**: `admin-panel/src/pages/finance/`
- **Backend**: `app/Http/Controllers/Api/V1/`
- **Log Jurnal**: `.agents_mcp/logs/` (Di sinilah agent saling bercerita).
