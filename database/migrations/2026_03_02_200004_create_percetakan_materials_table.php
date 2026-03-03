<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('percetakan_materials', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category'); // paper, ink, plate, consumable, packaging
            $table->string('type')->nullable();
            $table->string('specification')->nullable();
            $table->string('unit')->default('pcs'); // ream, sheet, liter, kg, pcs, roll, box
            $table->decimal('current_stock', 15, 2)->default(0);
            $table->decimal('min_stock', 15, 2)->default(0);
            $table->decimal('max_stock', 15, 2)->default(0);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('last_purchase_price', 15, 2)->default(0);
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('percetakan_materials');
    }
};
