<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('npwp')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_phone')->nullable();
            $table->integer('payment_terms_days')->default(0);
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->string('product_specialty')->nullable(); // e.g., "Kertas", "Tinta", "Plate"
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
