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
        Schema::create('accounting_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('ref_number')->unique();
            $table->date('date');
            $table->nullableMorphs('contact'); // For Author or Supplier
            $table->foreignId('account_id')->constrained('accounting_accounts'); // Expense category
            $table->foreignId('pay_from_account_id')->constrained('accounting_accounts'); // Bank/Cash
            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();
            $table->enum('status', ['recorded', 'void'])->default('recorded');
            $table->foreignId('journal_id')->nullable()->constrained('accounting_journals')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounting_expenses');
    }
};
