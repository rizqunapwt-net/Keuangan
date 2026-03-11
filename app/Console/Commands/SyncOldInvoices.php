<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\Debt;
use Carbon\Carbon;
use Illuminate\Support\Str;

class SyncOldInvoices extends Command
{
    protected $signature = 'sync:old-invoices';
    protected $description = 'Sinksronisasi data invoice baru dari sistem lawas (8089) ke sistem kasir baru (8000)';

    public function handle()
    {
        $this->info("Memulai sinkronisasi invoice dari sistem lawas...");

        // Ambil ID tertinggi dari referensi lama (asumsi kodeinvoice menggunakan ID lama)
        // Kita bisa menyimpan last state ID di file atau DB. 
        // Berhubung migrations tidak punya kolom "old_id", kita cari aja dari "refNumber" atau kodeinvoice.
        // Tapi old invoices di DB itu ada yang ID-nya sampe 1770 ke atas dan sudah di-seed.
        // Mari kita cari data source old app dari HTTP param.
        
        // Paling aman: kita simpan 'last_sync_id' di file cache, jika belum ada set 1770
        $lastSyncId = cache()->get('last_invoice_sync_id', 1770);
        $this->info("Mengambil tagihan dari Invoice App mulai ID > {$lastSyncId}");

        try {
            // Karena command ini jalan di docker container keuangan_app yg satu host dengan invoice_app di cloudflare/network, 
            // kita gunakan API URL `http://192.168.18.210:8089/api/export-sync` (karena dari host yang sama)
            // Sebaiknya baca dari env, tapi hardcode saja juga bisa untuk environment lokal server
            $response = Http::timeout(30)->get("http://192.168.18.210:8089/api/export-sync", [
                'last_id' => $lastSyncId
            ]);

            if (!$response->successful()) {
                $this->error("Gagal terhubung ke API sistem lama.");
                return;
            }

            $invoices = $response->json();
            if (empty($invoices)) {
                $this->info("Tidak ada invoice baru ditemukan.");
                return;
            }

            $count = 0;
            foreach ($invoices as $inv) {
                // Tentukan data berdasarkan kolom lama
                $items = [];
                if (!empty($inv['nama_produk'])) {
                    $items[] = [
                        'nama' => $inv['nama_produk'],
                        'jumlah' => $inv['jumlah'] ?: 1,
                        'harga' => $inv['htm'] ?: 0,
                        'diskon' => $inv['diskon'] ?: 0,
                    ];
                }

                $totalAmount = $inv['harga'] ?? 0;
                // Old app sets statusbayar = 'lunas' or 'belum'
                $isLunas = strtolower($inv['statusbayar']) === 'lunas' || strtolower($inv['statusbayar']) === 'piutang'; // menyesuaikan old
                $status = ($inv['statusbayar'] === 'lunas') ? 'paid' : 'unpaid';
                $paidAmount = $status === 'paid' ? $totalAmount : 0;

                // Create date
                $date = $inv['tanggal'] ? Carbon::parse($inv['tanggal']) : now();

                // Kita bypass logic 'creating' di Debt model sejenak agar bisa set kodeinvoice custom
                DB::table('debts')->insert([
                    'type' => 'receivable',
                    'client_name' => $inv['nama'] ?? 'Umum',
                    'amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'status' => $status,
                    'date' => $date->toDateString(),
                    'description' => "Sinkronisasi dari App Lama (ID: {$inv['id']})",
                    // Use their exact kodeinvoice or generate our standard
                    'kodeinvoice' => $inv['kodeinvoice'] ?: sprintf('%d-%s-%s-%s', $inv['id'], strtolower(Str::random(3)), $date->format('m'), $date->format('Y')),
                    'items' => json_encode($items),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Update last sync ID
                $lastSyncId = $inv['id'];
                $count++;
            }

            cache()->put('last_invoice_sync_id', $lastSyncId, now()->addYear());
            $this->info("Berhasil sinkronisasi {$count} invoice baru. Last ID: {$lastSyncId}");

        } catch (\Exception $e) {
            $this->error("Terjadi kesalahan: " . $e->getMessage());
        }
    }
}
