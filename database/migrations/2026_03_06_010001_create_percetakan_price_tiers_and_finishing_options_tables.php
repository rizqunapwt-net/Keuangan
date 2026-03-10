<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('percetakan_price_tiers')) {
        Schema::create('percetakan_price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('percetakan_products')->cascadeOnDelete();
            $table->string('size')->nullable();           // A3, A4, A5, A6, DL (null = all sizes)
            $table->string('paper_type')->nullable();      // HVS 70gsm, Artpaper 150gsm (null = all)
            $table->integer('min_qty');                    // 100
            $table->integer('max_qty')->nullable();        // 499 (null = unlimited)
            $table->decimal('price_per_unit', 15, 2);      // Harga satuan di tier ini
            $table->decimal('discount_percent', 5, 2)->default(0); // atau diskon persen (0-40%)
            $table->string('print_method')->default('digital');    // digital / offset
            $table->timestamps();
            $table->index(['product_id', 'size', 'min_qty']);
        });
        }

        if (!Schema::hasTable('percetakan_finishing_options')) {
        Schema::create('percetakan_finishing_options', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();              // LAM_MATTE, LAM_GLOSSY, FOLD_2, HOTPRINT
            $table->string('name');                        // Laminasi Matte, Lipat 2, Hotprint
            $table->string('category');                    // lamination, folding, finishing, cutting, binding
            $table->string('pricing_type');                // flat_fee, per_unit, per_m2, percentage
            $table->decimal('price', 15, 2)->default(0);   // Biaya tambahan
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index('category');
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('percetakan_finishing_options');
        Schema::dropIfExists('percetakan_price_tiers');
    }
};
