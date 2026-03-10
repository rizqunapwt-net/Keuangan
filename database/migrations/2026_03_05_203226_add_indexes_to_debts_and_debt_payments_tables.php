<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add indexes for better query performance on filtering and sorting.
     */
    public function up(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->index(['type', 'status'], 'debts_type_status_index');
            $table->index('client_name', 'debts_client_name_index');
            $table->index('date', 'debts_date_index');
            $table->index('due_date', 'debts_due_date_index');
            $table->index('status', 'debts_status_index');
        });

        Schema::table('debt_payments', function (Blueprint $table) {
            $table->index('debt_id', 'debt_payments_debt_id_index');
            $table->index('date', 'debt_payments_date_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->dropIndex('debts_type_status_index');
            $table->dropIndex('debts_client_name_index');
            $table->dropIndex('debts_date_index');
            $table->dropIndex('debts_due_date_index');
            $table->dropIndex('debts_status_index');
        });

        Schema::table('debt_payments', function (Blueprint $table) {
            $table->dropIndex('debt_payments_debt_id_index');
            $table->dropIndex('debt_payments_date_index');
        });
    }
};
