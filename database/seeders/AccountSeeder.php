<?php

namespace Database\Seeders;

use App\Models\Accounting\Account;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // Aset (asset)
            ['code' => '1-10001', 'name' => 'Kas', 'type' => 'asset'],
            ['code' => '1-10002', 'name' => 'Bank BCA', 'type' => 'asset'],
            ['code' => '1-10003', 'name' => 'Bank Mandiri', 'type' => 'asset'],
            ['code' => '1-10100', 'name' => 'Piutang Usaha', 'type' => 'asset'],
            ['code' => '1-10200', 'name' => 'Persediaan Kertas & Tinta', 'type' => 'asset'],
            ['code' => '1-10201', 'name' => 'Persediaan Buku', 'type' => 'asset'],
            ['code' => '1-10300', 'name' => 'Peralatan Cetak', 'type' => 'asset'],
            ['code' => '1-10301', 'name' => 'Mesin Cetak', 'type' => 'asset'],
            ['code' => '1-10400', 'name' => 'Perlengkapan Kantor', 'type' => 'asset'],
            // Kewajiban (liability)
            ['code' => '2-20001', 'name' => 'Utang Usaha', 'type' => 'liability'],
            ['code' => '2-20002', 'name' => 'Utang Pajak', 'type' => 'liability'],
            ['code' => '2-20003', 'name' => 'Utang Gaji', 'type' => 'liability'],
            // Modal (equity)
            ['code' => '3-30001', 'name' => 'Modal Pemilik', 'type' => 'equity'],
            ['code' => '3-30002', 'name' => 'Laba Ditahan', 'type' => 'equity'],
            // Pendapatan (revenue)
            ['code' => '4-40001', 'name' => 'Penjualan Buku', 'type' => 'revenue'],
            ['code' => '4-40002', 'name' => 'Jasa Cetak', 'type' => 'revenue'],
            ['code' => '4-40003', 'name' => 'Jasa Penerbitan', 'type' => 'revenue'],
            ['code' => '4-40004', 'name' => 'Royalti Penulis Masuk', 'type' => 'revenue'],
            // Beban (expense)
            ['code' => '5-50001', 'name' => 'Bahan Baku (Kertas, Tinta)', 'type' => 'expense'],
            ['code' => '5-50002', 'name' => 'Gaji & Upah Karyawan', 'type' => 'expense'],
            ['code' => '5-50003', 'name' => 'Biaya Listrik & Air', 'type' => 'expense'],
            ['code' => '5-50004', 'name' => 'Biaya Pengiriman', 'type' => 'expense'],
            ['code' => '5-50005', 'name' => 'Biaya Perawatan Mesin', 'type' => 'expense'],
            ['code' => '5-60001', 'name' => 'Biaya Admin Bank', 'type' => 'expense'],
        ];

        foreach ($accounts as $data) {
            Account::firstOrCreate(['code' => $data['code']], $data);
        }
    }
}
