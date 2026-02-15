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
        Schema::create('royalty_calculations', function (Blueprint $table) {
            $table->id();
            $table->string('period_month', 7);
            $table->foreignId('author_id')->constrained()->restrictOnDelete();
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->string('status')->default('draft');
            $table->foreignId('calculated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('calculated_at')->nullable();
            $table->foreignId('finalized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();

            $table->unique(['period_month', 'author_id']);
            $table->index(['period_month', 'author_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('royalty_calculations');
    }
};
