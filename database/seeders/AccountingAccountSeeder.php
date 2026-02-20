<?php

namespace Database\Seeders;

use App\Models\Accounting\Account;
use Illuminate\Database\Seeder;

class AccountingAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // ASSETS (1000)
            ['code' => '1101', 'name' => 'Kas Besar', 'type' => 'asset'],
            ['code' => '1102', 'name' => 'Bank BCA', 'type' => 'asset'],
            ['code' => '1103', 'name' => 'Bank Mandiri', 'type' => 'asset'],
            ['code' => '1200', 'name' => 'Piutang Usaha', 'type' => 'asset'],
            ['code' => '1300', 'name' => 'Persediaan Buku', 'type' => 'asset'],

            // LIABILITIES (2000)
            ['code' => '2100', 'name' => 'Hutang Usaha', 'type' => 'liability'],
            ['code' => '2101', 'name' => 'Hutang Royalti Penulis', 'type' => 'liability'],
            ['code' => '2102', 'name' => 'Hutang Gaji', 'type' => 'liability'],

            // EQUITY (3000)
            ['code' => '3000', 'name' => 'Modal Disetor', 'type' => 'equity'],
            ['code' => '3100', 'name' => 'Laba Ditahan', 'type' => 'equity'],

            // REVENUE (4000)
            ['code' => '4000', 'name' => 'Penjualan Buku - Retail', 'type' => 'revenue'],
            ['code' => '4001', 'name' => 'Penjualan Buku - Marketplace', 'type' => 'revenue'],
            ['code' => '4100', 'name' => 'Pendapatan Jasa Lainnya', 'type' => 'revenue'],

            // EXPENSES (5000)
            ['code' => '5000', 'name' => 'Beban Pokok Penjualan (HPP)', 'type' => 'expense'],
            ['code' => '5100', 'name' => 'Beban Gaji Karyawan', 'type' => 'expense'],
            ['code' => '5101', 'name' => 'Beban Royalti Penulis', 'type' => 'expense'],
            ['code' => '5200', 'name' => 'Beban Operasional Kantor', 'type' => 'expense'],
            ['code' => '5201', 'name' => 'Beban Listrik & Internet', 'type' => 'expense'],
        ];

        foreach ($accounts as $account) {
            Account::updateOrCreate(['code' => $account['code']], $account);
        }
    }
}