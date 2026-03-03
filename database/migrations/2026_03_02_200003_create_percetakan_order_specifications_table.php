<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('percetakan_order_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('percetakan_orders')->cascadeOnDelete();
            $table->string('size')->nullable();
            $table->string('paper_type')->nullable();
            $table->string('paper_weight')->nullable();
            $table->string('colors_inside')->nullable();
            $table->string('colors_outside')->nullable();
            $table->string('binding_type')->nullable();
            $table->string('finishing')->nullable();
            $table->integer('pages_count')->nullable();
            $table->integer('print_run')->nullable();
            $table->decimal('waste_allowance', 5, 2)->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('percetakan_order_specifications');
    }
};
