<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('percetakan_material_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('material_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->enum('type', ['in', 'out', 'adjustment'])->default('out');
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('note')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->foreign('material_id')->references('id')->on('percetakan_materials')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('percetakan_orders')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('percetakan_material_logs');
    }
};
