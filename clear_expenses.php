<?php
// /tmp/delete_expenses.php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Route::get('/', function() {}); // needed to prevent error in route booting optionally
$controller = app()->make(App\Http\Controllers\Api\V1\Finance\ExpenseController::class);
$expenses = App\Models\Expense::all();

foreach ($expenses as $expense) {
    echo "Deleting expense ID: {$expense->id} - {$expense->description}\n";
    try {
        $controller->destroy($expense);
    } catch (\Exception $e) {
        // Fallback directly delete if the controller fails
        echo "Error deleting via controller: " . $e->getMessage() . "\n";
        $expense->delete();
    }
}

echo count($expenses) . " expenses processed.\n";
