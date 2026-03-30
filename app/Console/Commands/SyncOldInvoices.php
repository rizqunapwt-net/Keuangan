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
    protected $signature = 'sync:old-invoices {--force : Sinkronisasi ulang semua data}';
    protected $description = 'Sinksronisasi data invoice baru dari sistem lawas (8089) ke sistem kasir baru (8000)';

    public function handle()
    {
        $this->info("Memulai sinkronisasi invoice dari sistem lawas...");

        // Jika force, mulai dari ID kecil.
        $lastSyncId = $this->option('force') ? 0 : cache()->get('last_invoice_sync_id', 1770);
        
        // Catch up sedikit IDs untuk update status
        $fetchId = max(0, $lastSyncId - 100);

        $this->info("Mengambil tagihan dari Invoice App mulai ID > {$fetchId}");

        try {
            $response = Http::timeout(30)->get("http://192.168.18.210:8089/api/export-sync", [
                'last_id' => $fetchId
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

            $grouped = collect($invoices)->groupBy(function($item) {
                return $item['kodeinvoice'] ?: ('TMP-' . $item['id']);
            });

            $count = 0;
            $maxId = $lastSyncId;

            foreach ($grouped as $kode => $rows) {
                $first = $rows->first();
                $items = [];
                $totalAmount = 0;
                $totalDiscount = 0;

                foreach ($rows as $row) {
                    $maxId = max($maxId, (int)$row['id']);
                    $qty = (int)($row['jumlah'] ?: 1);
                    $unitPrice = (float)($row['htm'] ?: $row['harga'] ?: 0);
                    $itemDiscount = (float)($row['diskon'] ?: 0);

                    if (!empty($row['nama_produk'])) {
                        $items[] = [
                            'nama_produk' => $row['nama_produk'],
                            'jumlah' => $qty,
                            'satuan' => $row['satuan'] ?: 'Pcs',
                            'harga' => $unitPrice,
                            'diskon' => $itemDiscount,
                        ];
                    }
                    
                    // Kalkulasi Total: (Qty * Harga Satuan)
                    $totalAmount += ($qty * $unitPrice);
                    
                    // Diskon di sistem lama biasanya per BARIS atau global per invoice tapi terekam di baris.
                    // Jika satu invoice memiliki multiple rows dengan diskon yang sama (misal 200rb) di tiap baris, 
                    // ini bisa menjebak. Tapi biasanya diskon akumulatif atau diletakkan di satu baris.
                    // Namun di API Bapak, diskon di record per row (id 1776 diskon 200rb, id 1777 diskon 200rb).
                    // Tunggu, mari kita cek apakah diskon itu per invoice atau per item.
                    // Di data moa: id 1773 diskon 250rb.
                    // Di data xhf: id 1776, 1777, 1778 diskon 200rb (tengah), 200rb (tengah), 0 (bawah).
                    // Ini menandakan diskon mungkin PER BARIS.
                    $totalDiscount += $itemDiscount;
                }

                $finalAmount = max(0, $totalAmount - $totalDiscount);
                
                $status = (strtolower($first['statusbayar']) === 'lunas') ? 'paid' : 'unpaid';
                $paidAmount = ($status === 'paid') ? $finalAmount : 0;
                $date = $first['tanggal'] ? Carbon::parse($first['tanggal']) : now();

                $invoiceNumber = $kode;
                if (strpos($invoiceNumber, 'TMP-') === 0) {
                    $invoiceNumber = sprintf('%d-%s-%s-%s', $first['id'], strtolower(Str::random(3)), $date->format('m'), $date->format('Y'));
                }

                DB::table('debts')->updateOrInsert(
                    ['kodeinvoice' => $invoiceNumber],
                    [
                        'type' => 'receivable',
                        'client_name' => $first['nama'] ?? 'Umum',
                        'amount' => $finalAmount,
                        'paid_amount' => $paidAmount,
                        'status' => $status,
                        'date' => $date->toDateString(),
                        'description' => "Sinkronisasi dari App Lama (" . count($rows) . " item)",
                        'items' => json_encode($items),
                        'updated_at' => now(),
                        'created_at' => DB::raw("COALESCE((SELECT created_at FROM debts d2 WHERE d2.kodeinvoice = '" . $invoiceNumber . "' LIMIT 1), '" . now() . "')"),
                    ]
                );

                $count++;
            }

            cache()->put('last_invoice_sync_id', $maxId, now()->addYear());
            $this->info("Berhasil sinkronisasi/update {$count} invoice. Last ID: {$maxId}");

        } catch (\Exception $e) {
            $this->error("Terjadi kesalahan: " . $e->getMessage());
        }
    }
}
