<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            // Identifiers
            $table->string('warehouse_code')->unique();
            $table->string('name');

            // Location
            $table->string('location');
            $table->text('address');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code', 10)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Capacity
            $table->float('capacity')->comment('Total capacity in cubic meters');
            $table->float('capacity_used')->default(0)->comment('Used capacity in cubic meters');

            // Facilities
            $table->boolean('temperature_controlled')->default(false);
            $table->boolean('humidity_controlled')->default(false);

            // Management
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['active', 'inactive', 'maintenance', 'closed'])->default('active');

            // Contact
            $table->string('contact_person')->nullable();
            $table->string('contact_phone', 15)->nullable();
            $table->string('contact_email')->nullable();

            // Additional info
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('manager_id');
            $table->index('status');
            $table->index('city');
            $table->index('temperature_controlled');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
