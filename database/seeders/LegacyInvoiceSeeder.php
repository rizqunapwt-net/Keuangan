<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * LegacyInvoiceSeeder
 * 
 * Import data dari tabel `pemesanan` (invoice lama) ke tabel `debts`.
 * Data dikelompokkan per `kodeinvoice`, setiap group menjadi 1 invoice.
 * Item-item per invoice disimpan di kolom JSON `items`.
 * 
 * Source: invoice_rizquna_dump.sql dari repo rizqunapwt-net/invoice
 */
class LegacyInvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $sqlFile = base_path('invoice_rizquna_dump.sql');

        if (!file_exists($sqlFile)) {
            $this->command->error("File invoice_rizquna_dump.sql tidak ditemukan di root project!");
            $this->command->info("Pastikan file ada di: {$sqlFile}");
            return;
        }

        $this->command->info("📦 Parsing invoice_rizquna_dump.sql...");

        $content = file_get_contents($sqlFile);

        // Extract INSERT INTO `pemesanan` VALUES block
        if (!preg_match('/INSERT INTO `pemesanan` VALUES\s*(.*?);/s', $content, $matches)) {
            $this->command->error("Tidak ditemukan data INSERT INTO `pemesanan` di SQL dump.");
            return;
        }

        $valuesBlock = $matches[1];

        // Parse each row: (id,'nama',user_id,'nama_produk','jumlah','satuan','htm',slug,harga,diskon,'statusbayar',paket_id,'tanggal',remember_token,'created_at','updated_at','kodeinvoice')
        preg_match_all('/\((\d+),\'((?:[^\']|\'\')*)\',([^,]*),\'((?:[^\']|\'\')*)\',\'((?:[^\']|\'\')*)\',\'((?:[^\']|\'\')*)\',\'((?:[^\']|\'\')*)\',([^,]*),(\d+),(\d+),\'((?:[^\']|\'\')*)\',([^,]*),\'((?:[^\']|\'\')*)\',([^,]*),(?:\'((?:[^\']|\'\')*)\'),(?:\'((?:[^\']|\'\')*)\'),(?:\'((?:[^\']|\'\')*)\')?\)/s', $valuesBlock, $rows, PREG_SET_ORDER);

        if (empty($rows)) {
            $this->command->error("Gagal parsing data pemesanan. Mencoba metode alternatif...");
            $this->parseAlternative($content);
            return;
        }

        $this->command->info("✅ Ditemukan " . count($rows) . " baris pemesanan.");

        // Group by kodeinvoice
        $invoiceGroups = [];
        foreach ($rows as $row) {
            $kodeinvoice = $row[17] ?? 'UNKNOWN-' . $row[1];
            $kodeinvoice = str_replace("''", "'", $kodeinvoice);

            $invoiceGroups[$kodeinvoice][] = [
                'id'           => (int)$row[1],
                'nama'         => str_replace("''", "'", $row[2]),
                'nama_produk'  => str_replace("''", "'", $row[4]),
                'jumlah'       => $row[5],
                'satuan'       => str_replace("''", "'", $row[6]),
                'harga'        => (int)$row[9],
                'diskon'       => (int)$row[10],
                'statusbayar'  => str_replace("''", "'", $row[11]),
                'tanggal'      => $row[13],
                'created_at'   => $row[15] !== 'NULL' ? $row[15] : null,
                'updated_at'   => $row[16] !== 'NULL' ? $row[16] : null,
            ];
        }

        $this->importGroups($invoiceGroups);
    }

    /**
     * Metode alternatif jika regex gagal - parse line by line
     */
    private function parseAlternative(string $content): void
    {
        $this->command->info("🔄 Menggunakan metode parsing alternatif...");

        $inBlock = false;
        $invoiceGroups = [];
        $count = 0;

        foreach (explode("\n", $content) as $line) {
            $line = trim($line);

            if (str_starts_with($line, "INSERT INTO `pemesanan`")) {
                $inBlock = true;
                continue;
            }

            if (!$inBlock) continue;

            if ($line === '' || str_starts_with($line, '/*!') || str_starts_with($line, 'UNLOCK') || str_starts_with($line, 'COMMIT')) {
                $inBlock = false;
                continue;
            }

            // Remove trailing comma or semicolon 
            $line = rtrim($line, ',;');

            // Each line is a row like (id,'nama',...)
            if (!str_starts_with($line, '(')) continue;

            // Simple CSV parse within parentheses
            $inner = substr($line, 1, -1); // strip ( and )

            $fields = $this->parseSqlRow($inner);
            if (count($fields) < 17) continue;

            $kodeinvoice = trim($fields[16] ?? 'UNKNOWN', "'");
            $nama = trim($fields[1], "'");
            $nama_produk = trim($fields[3], "'");
            $jumlah = trim($fields[4], "'");
            $satuan = trim($fields[5], "'");
            $harga = (int)$fields[8];
            $diskon = (int)$fields[9];
            $statusbayar = trim($fields[10], "'");
            $tanggal = trim($fields[12], "'");
            $created_at = trim($fields[14] ?? '', "'");
            $updated_at = trim($fields[15] ?? '', "'");

            $invoiceGroups[$kodeinvoice][] = [
                'nama'         => str_replace("''", "'", $nama),
                'nama_produk'  => str_replace("''", "'", $nama_produk),
                'jumlah'       => $jumlah,
                'satuan'       => $satuan,
                'harga'        => $harga,
                'diskon'       => $diskon,
                'statusbayar'  => $statusbayar,
                'tanggal'      => $tanggal,
                'created_at'   => $created_at ?: null,
                'updated_at'   => $updated_at ?: null,
            ];
            $count++;
        }

        $this->command->info("✅ Ditemukan {$count} baris pemesanan dari {" . count($invoiceGroups) . "} invoice.");
        $this->importGroups($invoiceGroups);
    }

    /**
     * Parse a single SQL row value string (handling quoted strings with commas)
     */
    private function parseSqlRow(string $row): array
    {
        $fields = [];
        $current = '';
        $inQuote = false;
        $len = strlen($row);

        for ($i = 0; $i < $len; $i++) {
            $char = $row[$i];

            if ($char === "'" && !$inQuote) {
                $inQuote = true;
                $current .= $char;
            } elseif ($char === "'" && $inQuote) {
                // Check for escaped quote ''
                if ($i + 1 < $len && $row[$i + 1] === "'") {
                    $current .= "''";
                    $i++;
                } else {
                    $inQuote = false;
                    $current .= $char;
                }
            } elseif ($char === ',' && !$inQuote) {
                $fields[] = $current;
                $current = '';
            } else {
                $current .= $char;
            }
        }
        $fields[] = $current;

        return $fields;
    }

    /**
     * Import grouped invoice data into debts table
     */
    private function importGroups(array $invoiceGroups): void
    {
        $imported = 0;
        $skipped = 0;

        foreach ($invoiceGroups as $kodeinvoice => $items) {
            // Skip if already imported
            $exists = DB::table('debts')->where('kodeinvoice', $kodeinvoice)->exists();
            if ($exists) {
                $skipped++;
                continue;
            }

            $firstItem = $items[0];
            $clientName = $firstItem['nama'];

            // Calculate total: sum(harga * jumlah) - sum(diskon)
            $totalAmount = 0;
            $itemsJson = [];

            foreach ($items as $item) {
                $qty = is_numeric($item['jumlah']) ? (float)$item['jumlah'] : 1;
                $subtotal = $item['harga'] * $qty;
                $totalAmount += $subtotal - $item['diskon'];

                $itemsJson[] = [
                    'nama_produk' => $item['nama_produk'],
                    'jumlah'      => $qty,
                    'satuan'      => $item['satuan'],
                    'harga'       => $item['harga'],
                    'diskon'      => $item['diskon'],
                ];
            }

            // Determine status
            $status = match (strtolower($firstItem['statusbayar'])) {
                'lunas'  => 'paid',
                'cicil'  => 'partial',
                default  => 'unpaid',
            };

            $paidAmount = $status === 'paid' ? $totalAmount : 0;

            // Parse date
            try {
                $date = Carbon::parse($firstItem['tanggal']);
            } catch (\Exception $e) {
                $date = Carbon::now();
            }

            $createdAt = null;
            try {
                if (!empty($firstItem['created_at']) && $firstItem['created_at'] !== 'NULL') {
                    $createdAt = Carbon::parse($firstItem['created_at']);
                }
            } catch (\Exception $e) {}

            DB::table('debts')->insert([
                'type'          => 'receivable',
                'status'        => $status,
                'date'          => $date->toDateString(),
                'due_date'      => $date->copy()->addDays(30)->toDateString(),
                'client_name'   => $clientName,
                'client_phone'  => null,
                'description'   => collect($items)->pluck('nama_produk')->implode(', '),
                'amount'        => max(0, $totalAmount),
                'paid_amount'   => $paidAmount,
                'kodeinvoice'   => $kodeinvoice,
                'items'         => json_encode($itemsJson),
                'bank_id'       => null,
                'created_at'    => $createdAt ?? $date,
                'updated_at'    => now(),
            ]);

            $imported++;
        }

        $this->command->info("🎉 Import selesai! {$imported} invoice imported, {$skipped} skipped (sudah ada).");
    }
}
