<?php

use App\Models\Debt;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$invalidDebts = Debt::whereNull('amount')
    ->orWhereNull('paid_amount')
    ->orWhere('amount', 0) // some might be 0 which is suspicious if items exist
    ->get();

foreach ($invalidDebts as $debt) {
    echo "ID: {$debt->id} | Invoice: {$debt->kodeinvoice} | Amount: " . ($debt->amount ?? 'NULL') . " | Paid: " . ($debt->paid_amount ?? 'NULL') . "\n";
    
    // Attempt to recalculate from items
    if (!empty($debt->items)) {
        $items = is_array($debt->items) ? $debt->items : json_decode($debt->items, true);
        if ($items) {
            $total = 0;
            foreach ($items as $item) {
                $total += (($item['harga'] ?? 0) * ($item['jumlah'] ?? 0)) - ($item['diskon'] ?? 0);
            }
            if ($total > 0 && ($debt->amount === null || $debt->amount == 0)) {
                $debt->amount = $total;
                $debt->save();
                echo "  -> Recalculated amount: {$total}\n";
            }
        }
    }
    
    // Ensure paid_amount is not null
    if ($debt->paid_amount === null) {
        $debt->paid_amount = ($debt->status === 'paid') ? $debt->amount : 0;
        $debt->save();
        echo "  -> Set paid_amount to: {$debt->paid_amount}\n";
    }
}

echo "Done checking data.\n";
