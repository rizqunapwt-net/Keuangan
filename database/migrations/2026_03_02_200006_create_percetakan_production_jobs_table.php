<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('percetakan_production_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique();
            $table->foreignId('order_id')->constrained('percetakan_orders')->cascadeOnDelete();
            $table->string('stage')->default('pre-press'); // pre-press, printing, finishing, qc, packaging
            $table->string('status')->default('pending'); // pending, in_progress, completed, on_hold
            $table->foreignId('machine_id')->nullable()->constrained('percetakan_machines')->nullOnDelete();
            $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('instructions')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index('stage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('percetakan_production_jobs');
    }
};
