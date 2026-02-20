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
        // Customers table (B2B + B2C) - percetakan specific
        if (!Schema::hasTable('percetakan_customers')) {
            Schema::create('percetakan_customers', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->string('type')->default('retail');
                $table->string('email')->nullable()->unique();
                $table->string('phone')->nullable();
                $table->string('company_name')->nullable();
                $table->string('npwp')->nullable();
                $table->text('address')->nullable();
                $table->string('city')->nullable();
                $table->string('province')->nullable();
                $table->string('postal_code')->nullable();
                $table->decimal('credit_limit', 15, 2)->default(0);
                $table->integer('payment_terms_days')->default(0);
                $table->decimal('discount_percentage', 5, 2)->default(0);
                $table->string('status')->default('active');
                $table->text('notes')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                
                $table->index('type');
                $table->index('status');
            });
        }

        // Product categories
        if (!Schema::hasTable('percetakan_product_categories')) {
            Schema::create('percetakan_product_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Products (printing products)
        if (!Schema::hasTable('percetakan_products')) {
            Schema::create('percetakan_products', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->foreignId('category_id')->constrained('percetakan_product_categories')->cascadeOnDelete();
                $table->text('description')->nullable();
                $table->string('unit')->default('pcs');
                $table->decimal('base_price', 15, 2)->default(0);
                $table->integer('lead_time_days')->default(3);
                $table->boolean('is_active')->default(true);
                $table->json('specifications')->nullable();
                $table->timestamps();
                
                $table->index('category_id');
                $table->index('is_active');
            });
        }

        // Orders (printing jobs)
        if (!Schema::hasTable('percetakan_orders')) {
            Schema::create('percetakan_orders', function (Blueprint $table) {
                $table->id();
                $table->string('order_number')->unique();
                $table->foreignId('customer_id')->constrained('percetakan_customers')->cascadeOnDelete();
                $table->foreignId('sales_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status')->default('inquiry');
                $table->foreignId('product_id')->constrained('percetakan_products')->cascadeOnDelete();
                $table->json('specifications');
                $table->integer('quantity');
                $table->decimal('unit_price', 15, 2);
                $table->decimal('subtotal', 15, 2);
                $table->decimal('discount_amount', 15, 2)->default(0);
                $table->decimal('tax_amount', 15, 2)->default(0);
                $table->decimal('total_amount', 15, 2);
                $table->decimal('deposit_percentage', 5, 2)->default(50);
                $table->decimal('deposit_amount', 15, 2);
                $table->decimal('deposit_paid', 15, 2)->default(0);
                $table->decimal('balance_due', 15, 2);
                $table->date('order_date');
                $table->date('deadline')->nullable();
                $table->date('completed_at')->nullable();
                $table->date('delivered_at')->nullable();
                $table->text('production_notes')->nullable();
                $table->text('customer_notes')->nullable();
                $table->string('priority')->default('normal');
                $table->boolean('is_rush_order')->default(false);
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->timestamps();
                
                $table->index('status');
                $table->index('customer_id');
                $table->index('order_date');
                $table->index('deadline');
            });
        }

        // Order specifications
        if (!Schema::hasTable('percetakan_order_specifications')) {
            Schema::create('percetakan_order_specifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('percetakan_orders')->cascadeOnDelete();
                $table->string('size');
                $table->string('paper_type');
                $table->string('paper_weight');
                $table->string('colors_inside');
                $table->string('colors_outside');
                $table->string('binding_type')->nullable();
                $table->string('finishing')->nullable();
                $table->integer('pages_count')->nullable();
                $table->integer('print_run')->default(1);
                $table->decimal('waste_allowance', 5, 2)->default(5);
                $table->json('custom_fields')->nullable();
                $table->timestamps();
            });
        }

        // Production jobs
        if (!Schema::hasTable('percetakan_production_jobs')) {
            Schema::create('percetakan_production_jobs', function (Blueprint $table) {
                $table->id();
                $table->string('job_number')->unique();
                $table->foreignId('order_id')->constrained('percetakan_orders')->cascadeOnDelete();
                $table->string('stage');
                $table->string('status')->default('pending');
                $table->foreignId('machine_id')->nullable();
                $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->integer('quantity_good')->nullable();
                $table->integer('quantity_waste')->nullable();
                $table->text('instructions')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                
                $table->index('stage');
                $table->index('status');
                $table->index('order_id');
            });
        }

        // Job cards
        if (!Schema::hasTable('percetakan_job_cards')) {
            Schema::create('percetakan_job_cards', function (Blueprint $table) {
                $table->id();
                $table->string('card_number')->unique();
                $table->foreignId('production_job_id')->constrained('percetakan_production_jobs')->cascadeOnDelete();
                $table->json('instructions');
                $table->integer('setup_time_minutes')->default(0);
                $table->integer('run_time_minutes')->default(0);
                $table->timestamp('actual_start')->nullable();
                $table->timestamp('actual_end')->nullable();
                $table->integer('actual_quantity')->nullable();
                $table->integer('waste_quantity')->nullable();
                $table->json('material_used')->nullable();
                $table->text('operator_notes')->nullable();
                $table->text('qc_notes')->nullable();
                $table->boolean('qc_passed')->nullable();
                $table->foreignId('qc_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('qc_at')->nullable();
                $table->timestamps();
            });
        }

        // Materials
        if (!Schema::hasTable('percetakan_materials')) {
            Schema::create('percetakan_materials', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->string('category');
                $table->string('type')->nullable();
                $table->string('specification')->nullable();
                $table->string('unit')->default('pcs');
                $table->decimal('current_stock', 12, 2)->default(0);
                $table->decimal('min_stock', 12, 2)->default(0);
                $table->decimal('max_stock', 12, 2)->default(0);
                $table->decimal('unit_cost', 15, 2)->default(0);
                $table->decimal('last_purchase_price', 15, 2)->default(0);
                $table->foreignId('supplier_id')->nullable();
                $table->date('last_purchase_date')->nullable();
                $table->string('location')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->index('category');
                $table->index('is_active');
            });
        }

        // Machines
        if (!Schema::hasTable('percetakan_machines')) {
            Schema::create('percetakan_machines', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->string('type');
                $table->string('brand')->nullable();
                $table->string('model')->nullable();
                $table->integer('capacity_per_hour')->nullable();
                $table->string('status')->default('operational');
                $table->date('purchase_date')->nullable();
                $table->decimal('purchase_price', 15, 2)->nullable();
                $table->integer('warranty_months')->nullable();
                $table->date('last_maintenance')->nullable();
                $table->date('next_maintenance')->nullable();
                $table->decimal('total_operating_hours', 10, 2)->default(0);
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->index('type');
                $table->index('status');
            });
        }

        // Material usage
        if (!Schema::hasTable('percetakan_material_usage')) {
            Schema::create('percetakan_material_usage', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_card_id')->constrained('percetakan_job_cards')->cascadeOnDelete();
                $table->foreignId('material_id')->constrained('percetakan_materials')->cascadeOnDelete();
                $table->decimal('quantity_planned', 12, 2);
                $table->decimal('quantity_actual', 12, 2);
                $table->decimal('quantity_waste', 12, 2)->default(0);
                $table->decimal('unit_cost', 15, 2);
                $table->decimal('total_cost', 15, 2);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Invoices
        if (!Schema::hasTable('percetakan_invoices')) {
            Schema::create('percetakan_invoices', function (Blueprint $table) {
                $table->id();
                $table->string('invoice_number')->unique();
                $table->foreignId('order_id')->constrained('percetakan_orders')->cascadeOnDelete();
                $table->foreignId('customer_id')->constrained('percetakan_customers')->cascadeOnDelete();
                $table->string('type');
                $table->date('invoice_date');
                $table->date('due_date');
                $table->decimal('subtotal', 15, 2);
                $table->decimal('discount_amount', 15, 2)->default(0);
                $table->decimal('tax_amount', 15, 2)->default(0);
                $table->decimal('total_amount', 15, 2);
                $table->decimal('paid_amount', 15, 2)->default(0);
                $table->decimal('balance', 15, 2);
                $table->string('status')->default('unpaid');
                $table->text('notes')->nullable();
                $table->date('paid_at')->nullable();
                $table->timestamps();
                
                $table->index('status');
                $table->index('invoice_date');
                $table->index('due_date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('percetakan_material_usage');
        Schema::dropIfExists('percetakan_invoices');
        Schema::dropIfExists('percetakan_machines');
        Schema::dropIfExists('percetakan_materials');
        Schema::dropIfExists('percetakan_job_cards');
        Schema::dropIfExists('percetakan_production_jobs');
        Schema::dropIfExists('percetakan_order_specifications');
        Schema::dropIfExists('percetakan_orders');
        Schema::dropIfExists('percetakan_products');
        Schema::dropIfExists('percetakan_product_categories');
        Schema::dropIfExists('percetakan_customers');
    }
};
