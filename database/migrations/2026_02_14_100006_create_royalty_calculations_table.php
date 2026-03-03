<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('royalty_calculations', function (Blueprint $table) {
            $table->id();
            $table->string('period_month', 7);
            $table->foreignId('author_id')->constrained()->onDelete('cascade');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('status')->default('draft');
            $table->foreignId('finalized_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();

            $table->index(['period_month', 'author_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('royalty_calculations');
    }
};
