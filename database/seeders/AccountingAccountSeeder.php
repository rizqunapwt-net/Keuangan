<?php

namespace Database\Seeders;

use App\Models\Accounting\Account;
use Illuminate\Database\Seeder;

class AccountingAccountSeeder extends Seeder
{
    /**
     * Run the standard Indonesia Chart of Accounts (COA) for SME/Kasir.
     */
    public function run(): void
    {
        $accounts = [
            // ASSETS (1000 - 1999)
            ['code' => '1101', 'name' => 'Kas di Tangan (Cash)', 'type' => 'asset'],
            ['code' => '1102', 'name' => 'Bank Utama', 'type' => 'asset'],
            ['code' => '1103', 'name' => 'Piutang Usaha', 'type' => 'asset'],
            ['code' => '1200', 'name' => 'Piutang Marketplace', 'type' => 'asset'],
            ['code' => '1201', 'name' => 'Persediaan Barang Dagang', 'type' => 'asset'],
            ['code' => '1301', 'name' => 'Aset Tetap - Peralatan Toko', 'type' => 'asset'],

            // LIABILITIES (2000 - 2999)
            ['code' => '2101', 'name' => 'Hutang Royalti Penulis', 'type' => 'liability'],
            ['code' => '2102', 'name' => 'Hutang Gaji', 'type' => 'liability'],
            ['code' => '2103', 'name' => 'Hutang Pajak', 'type' => 'liability'],

            // EQUITY (3000 - 3999)
            ['code' => '3101', 'name' => 'Modal Pemilik', 'type' => 'equity'],
            ['code' => '3201', 'name' => 'Laba Ditahan', 'type' => 'equity'],

            // REVENUE (4000 - 4999)
            ['code' => '4001', 'name' => 'Pendapatan Penjualan Buku (Publishing)', 'type' => 'revenue'],
            ['code' => '4101', 'name' => 'Pendapatan Penjualan (Kasir)', 'type' => 'revenue'],
            ['code' => '4102', 'name' => 'Pendapatan Jasa', 'type' => 'revenue'],
            ['code' => '4201', 'name' => 'Potongan Penjualan', 'type' => 'revenue'],

            // EXPENSES (5000 - 5999)
            ['code' => '5101', 'name' => 'Beban Royalti Penulis', 'type' => 'expense'],
            ['code' => '5102', 'name' => 'Biaya Gaji Karyawan', 'type' => 'expense'],
            ['code' => '5103', 'name' => 'Biaya Sewa Tempat', 'type' => 'expense'],
            ['code' => '5104', 'name' => 'Biaya Listrik, Air & Internet', 'type' => 'expense'],
            ['code' => '5105', 'name' => 'Biaya Marketing / Iklan', 'type' => 'expense'],
            ['code' => '5201', 'name' => 'Biaya Operasional Lainnya', 'type' => 'expense'],
            ['code' => '5301', 'name' => 'Beban Pokok Penjualan (HPP)', 'type' => 'expense'],
        ];

        foreach ($accounts as $account) {
            Account::updateOrCreate(
                ['code' => $account['code']],
                [
                    'name' => $account['name'],
                    'type' => $account['type'],
                    'is_active' => true,
                ]
            );
        }
    }
}
