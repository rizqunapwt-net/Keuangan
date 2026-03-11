<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\CashTransaction;
use App\Models\Contact;
use App\Models\Bank;
use App\Models\Memo;
use App\Models\Accounting\JournalEntry;
use App\Models\Accounting\Journal;

echo "Memulai proses pembersihan sisa data...\n";

try {
    // Nonaktifkan Foreign Key Check sementara (jika didukung) 
    // Walaupun DB PostgreSQL akan pakai DB::statement('SET session_replication_role = \'replica\';');
    // Untuk amannya, kita set relasi yang terkait jadi NULL
    
    DB::table('debts')->update(['bank_id' => null, 'contact_id' => null]);
    DB::table('debt_payments')->update(['bank_id' => null]);
    
    $deletedJournals = Journal::query()->delete();
    $deletedJournalEntries = JournalEntry::query()->delete();
    echo "- Jurnal Akuntansi dihapus.\n";

    $deletedCash = CashTransaction::query()->delete();
    echo "- Transaksi Kas dihapus: {$deletedCash}\n";

    $deletedBanks = Bank::query()->delete();
    echo "- Data Rekening dihapus: {$deletedBanks}\n";

    $deletedContacts = Contact::query()->delete();
    echo "- Data Kontak dihapus: {$deletedContacts}\n";

    $deletedMemos = Memo::query()->delete();
    echo "- Memo dihapus: {$deletedMemos}\n";

    echo "\nSelesai! Database kini bersih total, HANYA menyisakan User dan Invoice lama.\n";
} catch (\Exception $e) {
    echo "Terjadi Error:\n" . $e->getMessage() . "\n";
}
