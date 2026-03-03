<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('sales_imports');
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Tables cannot be restored — recreate manually if needed.
    }
};
