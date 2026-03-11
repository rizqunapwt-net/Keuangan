<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Route::get('/', function() {});

$accounts = App\Models\Accounting\Account::all();
$deleted = 0;
foreach ($accounts as $account) {
    try {
        $account->delete();
        $deleted++;
    } catch (\Exception $e) {
        // ignore if bounded by foreign keys
    }
}
echo "Deleted {$deleted} out of " . count($accounts) . " accounts.\n";
