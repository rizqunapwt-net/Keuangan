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
        // 1. Chart of Accounts (COA)
        Schema::create('accounting_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., 1001, 4001
            $table->string('name');
            $table->enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Journals (Headers)
        Schema::create('accounting_journals', function (Blueprint $table) {
            $table->id();
            $table->string('journal_number')->unique();
            $table->date('date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->enum('status', ['draft', 'posted'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 3. Journal Entries (Lines)
        Schema::create('accounting_journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained('accounting_journals')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('accounting_accounts')->onDelete('restrict');
            $table->enum('type', ['debit', 'credit']);
            $table->decimal('amount', 15, 2);
            $table->string('memo')->nullable();
            $table->timestamps();

            // Index for faster reporting
            $table->index(['account_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounting_journal_entries');
        Schema::dropIfExists('accounting_journals');
        Schema::dropIfExists('accounting_accounts');
    }
};
