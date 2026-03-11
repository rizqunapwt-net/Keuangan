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

            // GROUP BY kodeinvoice (or a unique order identifier)
            // If kodeinvoice is empty, we use a combination of id/client/date to avoid grouping everything together.
            $grouped = collect($invoices)->groupBy(function($item) {
                return $item['kodeinvoice'] ?: ('TMP-' . $item['id']);
            });

            $count = 0;
            foreach ($grouped as $kode => $rows) {
                $first = $rows->first();
                $items = [];
                $totalAmount = 0;

                foreach ($rows as $row) {
                    if (!empty($row['nama_produk'])) {
                        $items[] = [
                            'nama_produk' => $row['nama_produk'],
                            'jumlah' => $row['jumlah'] ?: 1,
                            'satuan' => 'Pcs',
                            'harga' => (float) ($row['htm'] ?: 0),
                            'diskon' => (float) ($row['diskon'] ?: 0),
                        ];
                    }
                    // Accumulate price if the source provides per-item price
                    // Usually 'harga' in the export-sync might be the TOTAL or the ITEM price.
                    // If multiple rows have the same kodeinvoice, it's likely item prices.
                    $totalAmount += (float) ($row['harga'] ?? 0);
                }

                $status = (strtolower($first['statusbayar']) === 'lunas') ? 'paid' : 'unpaid';
                $paidAmount = ($status === 'paid') ? $totalAmount : 0;
                $date = $first['tanggal'] ? Carbon::parse($first['tanggal']) : now();

                // Check if already exists to avoid duplicates
                $invoiceNumber = $kode;
                if (strpos($invoiceNumber, 'TMP-') === 0) {
                    $invoiceNumber = sprintf('%d-%s-%s-%s', $first['id'], strtolower(Str::random(3)), $date->format('m'), $date->format('Y'));
                }

                DB::table('debts')->updateOrInsert(
                    ['kodeinvoice' => $invoiceNumber],
                    [
                        'type' => 'receivable',
                        'client_name' => $first['nama'] ?? 'Umum',
                        'amount' => $totalAmount,
                        'paid_amount' => $paidAmount,
                        'status' => $status,
                        'date' => $date->toDateString(),
                        'description' => "Sinkronisasi dari App Lama (" . count($rows) . " item)",
                        'items' => json_encode($items),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );

                $lastSyncId = max($lastSyncId, ...$rows->pluck('id')->toArray());
                $count++;
            }

            cache()->put('last_invoice_sync_id', $lastSyncId, now()->addYear());
            $this->info("Berhasil sinkronisasi {$count} invoice baru. Last ID: {$lastSyncId}");

        } catch (\Exception $e) {
            $this->error("Terjadi kesalahan: " . $e->getMessage());
        }
    }
}
