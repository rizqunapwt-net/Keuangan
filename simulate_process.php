<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\RoyaltyCalculation;
use App\Models\Accounting\Journal;
use App\Models\Marketplace;
use App\Enums\BookStatus;
use App\Enums\ContractStatus;
use App\Enums\RoyaltyStatus;
use Illuminate\Support\Facades\DB;

function log_sim($msg)
{
    echo "\n[SIMULASI] $msg\n";
}

try {
    DB::beginTransaction();

    // 1. Create Author
    log_sim("Membuat Author: Dr. Simulata...");
    $author = Author::create([
        'name' => 'Dr. Simulata',
        'email' => 'simulata@example.com',
        'phone' => '08123456789'
    ]);

    // 2. Create Book
    log_sim("Membuat Buku: Panduan Simulasi ERP...");
    $book = Book::create([
        'author_id' => $author->id,
        'title' => 'Panduan Simulasi ERP',
        'price' => 150000,
        'status' => BookStatus::DRAFT,
        'stock' => 100
    ]);

    // 3. Try to create Sale (Should Fail)
    log_sim("Mencoba mencatat penjualan TANPA kontrak approved (Harus Error)...");
    try {
        Sale::create([
            'book_id' => $book->id,
            'transaction_id' => 'TRX-ERR-001',
            'quantity' => 1,
            'net_price' => 150000,
            'period_month' => '2026-03'
        ]);
        echo "FAIL: Penjualan berhasil tanpa kontrak (Ini salah!)\n";
    }
    catch (\Exception $e) {
        echo "SUCCESS: Sistem menolak penjualan: " . $e->getMessage() . "\n";
    }

    // 4. Create Contract
    log_sim("Mendaftarkan Kontrak Approved (Royalti 10%)...");
    Contract::create([
        'book_id' => $book->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'royalty_percentage' => 10,
        'status' => ContractStatus::Approved,
        'contract_file_path' => 'contracts/sim.pdf'
    ]);

    // 5. Create Sale (Should Work Now)
    log_sim("Mencatat Penjualan 2 buku (Total Rp 300.000)...");
    $mp = Marketplace::firstOrCreate(['code' => 'SHOPEE'], ['name' => 'Shopee']);

    $sale = Sale::create([
        'book_id' => $book->id,
        'marketplace_id' => $mp->id,
        'transaction_id' => 'TRX-SIM-001',
        'quantity' => 2,
        'net_price' => 150000,
        'period_month' => '2026-03'
    ]);
    echo "SUCCESS: Penjualan berhasil dicatat.\n";

    // 6. Check Royalty
    log_sim("Mengecek modul Royalti secara otomatis...");
    $royalty = RoyaltyCalculation::where('author_id', $author->id)
        ->where('period_month', '2026-03')
        ->first();

    if ($royalty) {
        echo "Royalti Ditemukan: Rp " . number_format($royalty->total_amount, 0) . " (10% dari 300rb = 30rb)\n";
    }
    else {
        echo "FAIL: Royalti tidak terbuat otomatis.\n";
    }

    // 7. Finalize Royalty & Check Accounting
    log_sim("Finalisasi Royalti (Memicu Jurnal Akuntansi)...");
    $royalty->update(['status' => RoyaltyStatus::Finalized]);

    $journal = Journal::where('reference', 'ROYALTY-' . $royalty->id)->first();
    if ($journal) {
        echo "SUCCESS: Jurnal Akuntansi otomatis terbit (Nomor: $journal->journal_number)\n";
        echo "Total Jurnal: Rp " . number_format($journal->total_amount, 0) . "\n";
    }
    else {
        echo "FAIL: Jurnal Akuntansi tidak terbit.\n";
    }

    log_sim("=== SIMULASI SELESAI DENGAN SUKSES ===");

    DB::rollBack(); // Don't persist simulation data
}
catch (\Exception $e) {
    DB::rollBack();
    echo "\nFATAL ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}