<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']); // pemasukan / pengeluaran
            $table->foreignId('bank_id')->nullable()->constrained()->onDelete('set null'); // Sumber Kas/Bank
            $table->date('date');
            $table->time('time')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->decimal('running_balance', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
