<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add bank_id foreign key constraint to debt_payments table
     * to ensure referential integrity with banks table.
     */
    public function up(): void
    {
        Schema::table('debt_payments', function (Blueprint $table) {
            // Add bank_id column if not exists (it should exist in newer installs)
            if (!Schema::hasColumn('debt_payments', 'bank_id')) {
                $table->foreignId('bank_id')->nullable()->after('debt_id')->constrained('banks')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debt_payments', function (Blueprint $table) {
            $table->dropForeign(['bank_id']);
            $table->dropColumn('bank_id');
        });
    }
};
