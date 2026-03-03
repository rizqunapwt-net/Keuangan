<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            // Identifiers
            $table->string('delivery_code')->unique();
            $table->string('tracking_number')->unique();

            // Foreign keys
            $table->unsignedBigInteger('order_id')->nullable();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');

            // Shipping info
            $table->string('courier');
            $table->text('origin_address');
            $table->text('destination_address');

            // Recipient details
            $table->string('recipient_name');
            $table->string('recipient_phone', 15);
            $table->string('recipient_email')->nullable();

            // Status & Dates
            $table->enum('status', ['pending', 'in_transit', 'delivered', 'failed', 'cancelled'])->default('pending');
            $table->date('scheduled_date');
            $table->datetime('picked_up_at')->nullable();
            $table->datetime('delivered_at')->nullable();

            // Costs
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('actual_cost', 10, 2)->nullable();

            // Files & notes
            $table->string('signature_path')->nullable();
            $table->text('notes')->nullable();

            // Metadata
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('order_id');
            $table->index('warehouse_id');
            $table->index('tracking_number');
            $table->index('status');
            $table->index('courier');
            $table->index('scheduled_date');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
