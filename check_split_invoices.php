<?php

use App\Models\Debt;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Look for invoices with the same description "Sinkronisasi dari App Lama (ID: ...)"
// Wait, if it's the SAME ID, then it definitely should be grouped.
// But some old systems use ID as unique per ITEM, not per order.
// Let's look for same client + same date + same total or something.

$duplicates = DB::table('debts')
    ->select('client_name', 'date', 'status', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
    ->where('description', 'like', 'Sinkronisasi from%')
    ->groupBy('client_name', 'date', 'status')
    ->havingRaw('count(*) > 1')
    ->limit(10)
    ->get();

foreach ($duplicates as $dup) {
    echo "Client: {$dup->client_name} | Date: {$dup->date} | Count: {$dup->count} | Total: {$dup->total}\n";
}

echo "Done.\n";
