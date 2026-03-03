<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_imports', function (Blueprint $table) {
            $table->id();
            $table->string('period_month', 7);
            $table->string('marketplace_code');
            $table->string('file_name');
            $table->integer('total_rows')->default(0);
            $table->integer('imported_rows')->default(0);
            $table->integer('failed_rows')->default(0);
            $table->string('status')->default('pending');
            $table->string('error_report_path')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['period_month', 'marketplace_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_imports');
    }
};
