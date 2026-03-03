<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode')->unique()->nullable()->after('sku');

            // Rename columns to match blueprint if they exist from previous migration
            if (Schema::hasColumn('products', 'quantity_on_hand')) {
                $table->renameColumn('quantity_on_hand', 'stock_qty');
            }
            if (Schema::hasColumn('products', 'reorder_level')) {
                $table->renameColumn('reorder_level', 'stock_min_qty');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('barcode');
            $table->renameColumn('stock_qty', 'quantity_on_hand');
            $table->renameColumn('stock_min_qty', 'reorder_level');
        });
    }
};
