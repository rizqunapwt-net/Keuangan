<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('sales')) {
            Schema::create('sales', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained();
                $table->foreignId('marketplace_id')->nullable()->constrained()->nullOnDelete();
                $table->string('transaction_id')->nullable()->unique();
                $table->integer('quantity')->default(1);
                $table->string('status')->nullable();
                $table->string('customer_name')->nullable();
                $table->string('period_month', 7)->nullable();
                $table->decimal('net_price', 15, 2)->default(0);
                $table->foreignId('sales_import_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('book_id')->nullable()->constrained()->nullOnDelete();
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->string('payment_method')->nullable();
                $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
                $table->text('notes')->nullable();
                $table->string('midtrans_snap_token')->nullable();
                $table->string('midtrans_transaction')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
            });

            return;
        }

        if (Schema::hasColumn('sales', 'user_id')) {
            try {
                Schema::table('sales', function (Blueprint $table) {
                    $table->foreignId('user_id')->nullable()->change();
                });
            } catch (\Throwable) {
                // Some drivers need DBAL for change(); keep existing nullability if unavailable.
            }
        }

        Schema::table('sales', function (Blueprint $table) {
            if (! Schema::hasColumn('sales', 'marketplace_id')) {
                $table->foreignId('marketplace_id')->nullable()->constrained()->nullOnDelete()->after('user_id');
            }
            if (! Schema::hasColumn('sales', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->unique()->after('marketplace_id');
            }
            if (! Schema::hasColumn('sales', 'quantity')) {
                $table->integer('quantity')->default(1)->after('transaction_id');
            }
            if (! Schema::hasColumn('sales', 'status')) {
                $table->string('status')->nullable()->after('quantity');
            }
            if (! Schema::hasColumn('sales', 'period_month')) {
                $table->string('period_month', 7)->nullable()->after('customer_name');
            }
            if (! Schema::hasColumn('sales', 'net_price')) {
                $table->decimal('net_price', 15, 2)->default(0)->after('period_month');
            }
            if (! Schema::hasColumn('sales', 'sales_import_id')) {
                $table->foreignId('sales_import_id')->nullable()->constrained()->cascadeOnDelete()->after('net_price');
            }
            if (! Schema::hasColumn('sales', 'book_id')) {
                $table->foreignId('book_id')->nullable()->constrained()->nullOnDelete()->after('sales_import_id');
            }
            if (! Schema::hasColumn('sales', 'midtrans_snap_token')) {
                $table->string('midtrans_snap_token')->nullable()->after('notes');
            }
            if (! Schema::hasColumn('sales', 'midtrans_transaction')) {
                $table->string('midtrans_transaction')->nullable()->after('midtrans_snap_token');
            }
            if (! Schema::hasColumn('sales', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('midtrans_transaction');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('sales')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'marketplace_id')) {
                $table->dropConstrainedForeignId('marketplace_id');
            }
            if (Schema::hasColumn('sales', 'sales_import_id')) {
                $table->dropConstrainedForeignId('sales_import_id');
            }
            if (Schema::hasColumn('sales', 'book_id')) {
                $table->dropConstrainedForeignId('book_id');
            }
            if (Schema::hasColumn('sales', 'transaction_id')) {
                $table->dropColumn('transaction_id');
            }
            if (Schema::hasColumn('sales', 'quantity')) {
                $table->dropColumn('quantity');
            }
            if (Schema::hasColumn('sales', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('sales', 'period_month')) {
                $table->dropColumn('period_month');
            }
            if (Schema::hasColumn('sales', 'net_price')) {
                $table->dropColumn('net_price');
            }
            if (Schema::hasColumn('sales', 'midtrans_snap_token')) {
                $table->dropColumn('midtrans_snap_token');
            }
            if (Schema::hasColumn('sales', 'midtrans_transaction')) {
                $table->dropColumn('midtrans_transaction');
            }
            if (Schema::hasColumn('sales', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
        });
    }
};
