<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            // Identifiers
            $table->string('expense_code')->unique();
            $table->enum('status', ['pending', 'approved', 'voided', 'rejected'])->default('pending');

            // Foreign keys
            $table->foreignId('account_id')->nullable()->constrained('accounting_accounts')->onDelete('set null');
            $table->foreignId('journal_entry_id')->nullable()->constrained('accounting_journal_entries')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('voided_by')->nullable()->constrained('users')->onDelete('set null');

            // Data
            $table->string('description');
            $table->string('category')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('IDR');
            $table->date('expense_date');
            $table->string('payment_method')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();

            // Approval/Void info
            $table->datetime('approved_at')->nullable();
            $table->datetime('voided_at')->nullable();
            $table->text('void_reason')->nullable();

            // Attachments & metadata
            $table->string('attachment_path')->nullable();
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('account_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('expense_date');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
