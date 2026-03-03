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
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->index();
            $table->string('gateway_id')->nullable()->unique();
            $table->string('gateway_type')->default('unknown');
            $table->json('payload');
            $table->string('signature')->nullable();
            $table->timestamp('processed_at')->index();
            $table->timestamps();

            $table->index(['gateway_type', 'processed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
    }
};
