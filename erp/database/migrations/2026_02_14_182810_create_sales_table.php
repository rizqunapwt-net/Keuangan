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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_import_id')->nullable()->constrained('sales_imports')->nullOnDelete();
            $table->foreignId('marketplace_id')->constrained()->restrictOnDelete();
            $table->foreignId('book_id')->constrained()->restrictOnDelete();
            $table->string('transaction_id');
            $table->string('period_month', 7);
            $table->unsignedInteger('quantity');
            $table->decimal('net_price', 14, 2);
            $table->string('status')->default('completed');
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['marketplace_id', 'transaction_id']);
            $table->index(['period_month', 'book_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
