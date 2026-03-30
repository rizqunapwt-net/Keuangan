<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('percetakan_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('percetakan_price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('percetakan_products')->onDelete('cascade');
            $table->string('size')->default('default');
            $table->integer('min_qty');
            $table->integer('max_qty')->nullable();
            $table->decimal('price_per_unit', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('percetakan_price_tiers');
        Schema::dropIfExists('percetakan_products');
    }
};
