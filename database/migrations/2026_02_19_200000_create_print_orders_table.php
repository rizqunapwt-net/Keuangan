<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('print_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->string('vendor_name');
            $table->string('vendor_contact')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('total_cost', 14, 2)->default(0);
            $table->string('paper_type')->default('HVS 80gsm');
            $table->string('binding_type')->default('Perfect Binding');
            $table->string('cover_type')->default('Soft Cover');
            $table->integer('page_count')->nullable();
            $table->string('size')->default('A5');
            $table->string('status')->default('pending'); // pending, approved, in_production, qc, delivered, cancelled
            $table->foreignId('ordered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('ordered_at')->nullable();
            $table->date('expected_delivery')->nullable();
            $table->date('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_orders');
    }
};