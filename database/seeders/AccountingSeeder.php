<?php

namespace Database\Seeders;

use App\Models\Accounting\Account;
use Illuminate\Database\Seeder;

class AccountingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Source: ECOUNT ERP / Standar Akuntansi Indonesia
        $accounts = [
            // ASSETS (1000 - 1999)
            ['code' => '1000', 'name' => 'KAS', 'type' => 'asset', 'description' => 'Uang tunai di tangan'],
            ['code' => '1100', 'name' => 'BANK BCA', 'type' => 'asset', 'description' => 'Rekening Operasional'],
            ['code' => '1200', 'name' => 'PIUTANG USAHA', 'type' => 'asset', 'description' => 'Tagihan ke marketplace/distributor'],
            ['code' => '1300', 'name' => 'PERSEDIAAN BUKU', 'type' => 'asset', 'description' => 'Nilai stok buku jadi'],

            // LIABILITIES (2000 - 2999)
            ['code' => '2000', 'name' => 'HUTANG USAHA', 'type' => 'liability', 'description' => 'Hutang ke supplier cetak'],
            ['code' => '2100', 'name' => 'HUTANG ROYALTI', 'type' => 'liability', 'description' => 'Kewajiban pembayaran ke penulis'],
            ['code' => '2200', 'name' => 'HUTANG GAJI', 'type' => 'liability', 'description' => 'Gaji karyawan belum dibayar'],
            ['code' => '2300', 'name' => 'HUTANG PAJAK', 'type' => 'liability', 'description' => 'PPN/PPh terhutang'],

            // EQUITY (3000 - 3999)
            ['code' => '3000', 'name' => 'MODAL RISEL', 'type' => 'equity', 'description' => 'Modal disetor pemilik'],
            ['code' => '3100', 'name' => 'LABA DITAHAN', 'type' => 'equity', 'description' => 'Akumulasi laba tahun lalu'],

            // REVENUE (4000 - 4999)
            ['code' => '4000', 'name' => 'PENJUALAN BUKU', 'type' => 'revenue', 'description' => 'Pendapatan dari penjualan buku fisik'],
            ['code' => '4100', 'name' => 'PENDAPATAN LAIN', 'type' => 'revenue', 'description' => 'Pendapatan jasa/event'],

            // EXPENSES (5000 - 9999)
            ['code' => '5000', 'name' => 'HARGA POKOK PENJUALAN', 'type' => 'expense', 'description' => 'Biaya cetak buku terjual'],
            ['code' => '6000', 'name' => 'BEBAN GAJI', 'type' => 'expense', 'description' => 'Gaji pokok dan tunjangan'],
            ['code' => '6100', 'name' => 'BEBAN ROYALTI', 'type' => 'expense', 'description' => 'Biaya royalti penulis'],
            ['code' => '6200', 'name' => 'BEBAN PEMASARAN', 'type' => 'expense', 'description' => 'Iklan dan promosi'],
            ['code' => '6300', 'name' => 'BEBAN OPERASIONAL', 'type' => 'expense', 'description' => 'Listrik, internet, sewa'],
        ];

        foreach ($accounts as $acc) {
            Account::updateOrCreate(['code' => $acc['code']], $acc);
        }
    }
}