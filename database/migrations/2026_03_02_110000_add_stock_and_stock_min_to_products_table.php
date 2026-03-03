<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'stock_qty') && ! Schema::hasColumn('products', 'stock')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->renameColumn('stock_qty', 'stock');
            });
        }

        if (Schema::hasColumn('products', 'stock_min_qty') && ! Schema::hasColumn('products', 'stock_min')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->renameColumn('stock_min_qty', 'stock_min');
            });
        }

        if (! Schema::hasColumn('products', 'stock')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->integer('stock')->default(0)->after('cost_price');
            });
        }

        if (! Schema::hasColumn('products', 'stock_min')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->integer('stock_min')->default(10)->after('stock');
            });
        }

        if (Schema::hasColumn('products', 'quantity_on_hand') && Schema::hasColumn('products', 'stock')) {
            DB::table('products')->update(['stock' => DB::raw('quantity_on_hand')]);
        }

        if (Schema::hasColumn('products', 'reorder_level') && Schema::hasColumn('products', 'stock_min')) {
            DB::table('products')->update(['stock_min' => DB::raw('reorder_level')]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'stock') && ! Schema::hasColumn('products', 'stock_qty')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->renameColumn('stock', 'stock_qty');
            });
        }

        if (Schema::hasColumn('products', 'stock_min') && ! Schema::hasColumn('products', 'stock_min_qty')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->renameColumn('stock_min', 'stock_min_qty');
            });
        }
    }
};
