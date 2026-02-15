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
        Schema::create('royalty_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('royalty_calculation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->restrictOnDelete();
            $table->foreignId('book_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('net_price', 14, 2);
            $table->decimal('royalty_percentage', 5, 2);
            $table->decimal('amount', 14, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('royalty_items');
    }
};
