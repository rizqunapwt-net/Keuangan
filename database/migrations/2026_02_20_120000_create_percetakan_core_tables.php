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
        // Customers table (B2B + B2C)
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->default('retail'); // retail, corporate, reseller
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('company_name')->nullable();
            $table->string('npwp')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->integer('payment_terms_days')->default(0); // 0 = COD
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->string('status')->default('active'); // active, inactive, blacklisted
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            
            $table->index('type');
            $table->index('status');
        });

        // Product categories
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Products (printing products)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('category_id')->constrained('product_categories')->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->string('unit')->default('pcs'); // pcs, rim, pack
            $table->decimal('base_price', 15, 2)->default(0);
            $table->integer('lead_time_days')->default(3); // production lead time
            $table->boolean('is_active')->default(true);
            $table->json('specifications')->nullable(); // default specs
            $table->timestamps();
            
            $table->index('category_id');
            $table->index('is_active');
        });

        // Orders (printing jobs)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sales_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('inquiry'); 
            // inquiry, quoted, confirmed, in_production, completed, ready_delivery, delivered, cancelled
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->json('specifications'); // detailed specs
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0); // PPN 11%
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
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->boolean('is_rush_order')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('customer_id');
            $table->index('order_date');
            $table->index('deadline');
        });

        // Order specifications (detailed)
        Schema::create('order_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('size'); // A4, A3, F4, custom
            $table->string('paper_type'); // HVS, Art Paper, Ivory, etc
            $table->string('paper_weight'); // 70gsm, 80gsm, 120gsm, etc
            $table->string('colors_inside'); // 1/0, 4/0, 4/4
            $table->string('colors_outside'); // 1/0, 4/0, 4/4
            $table->string('binding_type')->nullable(); // staples, perfect binding, spiral
            $table->string('finishing')->nullable(); // laminate, UV spot, emboss
            $table->integer('pages_count')->nullable();
            $table->integer('print_run')->default(1);
            $table->decimal('waste_allowance', 5, 2)->default(5); // percentage
            $table->json('custom_fields')->nullable();
            $table->timestamps();
        });

        // Production jobs
        Schema::create('production_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('stage'); // pre-press, printing, finishing, qc, packaging
            $table->string('status')->default('pending');
            // pending, in_progress, completed, on_hold, rejected
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

        // Job cards (detailed work instructions)
        Schema::create('job_cards', function (Blueprint $table) {
            $table->id();
            $table->string('card_number')->unique();
            $table->foreignId('production_job_id')->constrained()->cascadeOnDelete();
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

        // Materials (raw materials & consumables)
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category'); // paper, ink, plate, consumable, packaging
            $table->string('type')->nullable(); // HVS, Art Paper, Cyan ink, etc
            $table->string('specification')->nullable(); // 70gsm, A4, 1L, etc
            $table->string('unit')->default('pcs'); // ream, sheet, liter, kg, pcs
            $table->decimal('current_stock', 12, 2)->default(0);
            $table->decimal('min_stock', 12, 2)->default(0);
            $table->decimal('max_stock', 12, 2)->default(0);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('last_purchase_price', 15, 2)->default(0);
            $table->foreignId('supplier_id')->nullable();
            $table->date('last_purchase_date')->nullable();
            $table->string('location')->nullable(); // warehouse location
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('category');
            $table->index('is_active');
        });

        // Machines
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type'); // offset, digital, cutting, binding, laminating
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->integer('capacity_per_hour')->nullable();
            $table->string('status')->default('operational');
            // operational, maintenance, broken, decommissioned
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

        // Material usage (per job)
        Schema::create('material_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_planned', 12, 2);
            $table->decimal('quantity_actual', 12, 2);
            $table->decimal('quantity_waste', 12, 2)->default(0);
            $table->decimal('unit_cost', 15, 2);
            $table->decimal('total_cost', 15, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // proforma, final, deposit
            $table->date('invoice_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->string('status')->default('unpaid');
            // unpaid, partial, paid, overdue, cancelled
            $table->text('notes')->nullable();
            $table->date('paid_at')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('invoice_date');
            $table->index('due_date');
        });

        // Payments - Skip if already exists
        if (!Schema::hasTable('percetakan_payments')) {
            Schema::create('percetakan_payments', function (Blueprint $table) {
                $table->id();
                $table->string('payment_number')->unique();
                $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
                $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
                $table->date('payment_date');
                $table->decimal('amount', 15, 2);
                $table->string('payment_method'); // cash, transfer, card, cheque
                $table->string('reference_number')->nullable(); // transfer ref, cheque no
                $table->text('notes')->nullable();
                $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('material_usage');
        Schema::dropIfExists('machines');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('job_cards');
        Schema::dropIfExists('production_jobs');
        Schema::dropIfExists('order_specifications');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('customers');
    }
};
