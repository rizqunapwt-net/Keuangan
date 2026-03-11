<?php

use App\Models\Debt;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$debts = Debt::where('description', 'like', 'Sinkronisasi dari App Lama%')->get();

foreach ($debts as $debt) {
    if (empty($debt->items)) continue;
    
    $items = is_array($debt->items) ? $debt->items : json_decode($debt->items, true);
    if (empty($items)) continue;
    
    $changed = false;
    foreach ($items as &$item) {
        if (isset($item['nama']) && !isset($item['nama_produk'])) {
            $item['nama_produk'] = $item['nama'];
            unset($item['nama']);
            $changed = true;
        }
        if (!isset($item['satuan'])) {
            $item['satuan'] = 'Pcs';
            $changed = true;
        }
    }
    
    if ($changed) {
        $debt->items = $items;
        $debt->save();
        echo "Updated invoice: {$debt->kodeinvoice}\n";
    }
}

echo "Done fixing items format.\n";
