<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            // Identifiers
            $table->string('bank_code')->unique();
            $table->string('bank_name');
            $table->string('branch_name')->nullable();

            // Account details
            $table->string('account_number')->unique();
            $table->string('account_holder');
            $table->string('account_type')->default('current'); // current, saving, etc
            $table->string('currency', 3)->default('IDR');

            // Balance info
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->date('opening_date');
            $table->decimal('balance', 15, 2)->default(0);

            // Foreign keys
            $table->foreignId('account_id')->nullable()->constrained('accounting_accounts')->onDelete('set null');
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');

            // Status
            $table->enum('status', ['active', 'inactive', 'suspended', 'closed'])->default('active');
            $table->boolean('is_primary')->default(false);

            // Additional info
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('account_id');
            $table->index('manager_id');
            $table->index('status');
            $table->index('is_primary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
