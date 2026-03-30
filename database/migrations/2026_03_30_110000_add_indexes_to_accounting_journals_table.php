<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounting_journals', function (Blueprint $table) {
            $table->index('date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('accounting_journals', function (Blueprint $table) {
            $table->dropIndex(['date']);
            $table->dropIndex(['status']);
        });
    }
};
