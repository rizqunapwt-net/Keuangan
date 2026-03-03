<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            // Identifiers
            $table->string('sku')->unique();
            $table->string('product_code')->unique();
            $table->string('name');
            $table->text('description')->nullable();

            // Classification
            $table->string('category')->nullable();
            $table->string('unit')->default('pcs'); // pieces, kg, liter, etc

            // Pricing
            $table->decimal('unit_price', 15, 2);
            $table->decimal('cost_price', 15, 2)->nullable();

            // Inventory
            $table->integer('quantity_on_hand')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->integer('reorder_quantity')->default(50);
            $table->datetime('last_stock_update')->nullable();

            // Foreign keys
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');

            // Status
            $table->enum('status', ['active', 'inactive', 'discontinued', 'out_of_stock'])->default('active');

            // Additional info
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('sku');
            $table->index('warehouse_id');
            $table->index('supplier_id');
            $table->index('status');
            $table->index('category');

            if (config('database.default') !== 'sqlite') {
                $table->fullText(['sku', 'name', 'description']);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
