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
        Schema::create('sales_imports', function (Blueprint $table) {
            $table->id();
            $table->string('period_month', 7);
            $table->string('marketplace_code');
            $table->string('file_name');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('imported_rows')->default(0);
            $table->unsignedInteger('failed_rows')->default(0);
            $table->string('status')->default('processing');
            $table->string('error_report_path')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['period_month', 'marketplace_code']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_imports');
    }
};
