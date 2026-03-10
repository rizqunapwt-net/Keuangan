<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================
        // 1. DROP ORPHAN PUBLISHING TABLES
        //    Menu Penerbitan sudah dihapus, tabel ini kosong
        //    Using CASCADE for PostgreSQL FK dependencies
        // =====================================================
        $tablesToDrop = [
            'payments',              // depends on royalty_calculations
            'assignments',           // depends on books, marketplaces
            'contracts',             // depends on books
            'royalty_calculations',  // depends on authors
            'books',                 // depends on authors
            'authors',
            'marketplaces',
        ];
        foreach ($tablesToDrop as $table) {
            DB::statement("DROP TABLE IF EXISTS \"{$table}\" CASCADE");
        }

        // =====================================================
        // 2. DROP DUPLICATE accounting_expenses TABLE
        //    Keep 'expenses' (26 cols, more complete)
        // =====================================================
        DB::statement('DROP TABLE IF EXISTS "accounting_expenses" CASCADE');

        // =====================================================
        // 3. FIX PRICE TIERS — Buku Softcover
        //    Currently all Rp 0, replace with correct prices
        // =====================================================
        $softcoverId = DB::table('percetakan_products')
            ->where('name', 'Buku Softcover')
            ->value('id');

        if ($softcoverId) {
            // Delete broken tiers
            DB::table('percetakan_price_tiers')
                ->where('product_id', $softcoverId)
                ->delete();

            // Insert correct tiers with volume discounts
            DB::table('percetakan_price_tiers')->insert([
                ['product_id' => $softcoverId, 'size' => 'default', 'min_qty' => 100,  'max_qty' => 299,  'price_per_unit' => 15000, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $softcoverId, 'size' => 'default', 'min_qty' => 300,  'max_qty' => 499,  'price_per_unit' => 13500, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $softcoverId, 'size' => 'default', 'min_qty' => 500,  'max_qty' => 999,  'price_per_unit' => 12000, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $softcoverId, 'size' => 'default', 'min_qty' => 1000, 'max_qty' => 1999, 'price_per_unit' => 10500, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $softcoverId, 'size' => 'default', 'min_qty' => 2000, 'max_qty' => null, 'price_per_unit' => 9000,  'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // =====================================================
        // 4. FIX PRICE TIERS — Brosur A4
        //    Currently all same price, add volume discounts
        // =====================================================
        $brosurA4Id = DB::table('percetakan_products')
            ->where('name', 'Brosur A4')
            ->value('id');

        if ($brosurA4Id) {
            DB::table('percetakan_price_tiers')
                ->where('product_id', $brosurA4Id)
                ->delete();

            DB::table('percetakan_price_tiers')->insert([
                ['product_id' => $brosurA4Id, 'size' => 'default', 'min_qty' => 100,  'max_qty' => 499,  'price_per_unit' => 2500, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA4Id, 'size' => 'default', 'min_qty' => 500,  'max_qty' => 999,  'price_per_unit' => 2200, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA4Id, 'size' => 'default', 'min_qty' => 1000, 'max_qty' => 1999, 'price_per_unit' => 1800, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA4Id, 'size' => 'default', 'min_qty' => 2000, 'max_qty' => 3999, 'price_per_unit' => 1500, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA4Id, 'size' => 'default', 'min_qty' => 4000, 'max_qty' => 5999, 'price_per_unit' => 1300, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA4Id, 'size' => 'default', 'min_qty' => 6000, 'max_qty' => null, 'price_per_unit' => 1100, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // =====================================================
        // 5. FIX PRICE TIERS — Brosur A3
        //    Currently all same price, add volume discounts
        // =====================================================
        $brosurA3Id = DB::table('percetakan_products')
            ->where('name', 'Brosur A3')
            ->value('id');

        if ($brosurA3Id) {
            DB::table('percetakan_price_tiers')
                ->where('product_id', $brosurA3Id)
                ->delete();

            DB::table('percetakan_price_tiers')->insert([
                ['product_id' => $brosurA3Id, 'size' => 'default', 'min_qty' => 50,   'max_qty' => 249,  'price_per_unit' => 5000, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA3Id, 'size' => 'default', 'min_qty' => 250,  'max_qty' => 499,  'price_per_unit' => 4500, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA3Id, 'size' => 'default', 'min_qty' => 500,  'max_qty' => 999,  'price_per_unit' => 3800, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA3Id, 'size' => 'default', 'min_qty' => 1000, 'max_qty' => 1999, 'price_per_unit' => 3200, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA3Id, 'size' => 'default', 'min_qty' => 2000, 'max_qty' => 2999, 'price_per_unit' => 2800, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $brosurA3Id, 'size' => 'default', 'min_qty' => 3000, 'max_qty' => null, 'price_per_unit' => 2500, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // =====================================================
        // 6. FIX PRICE TIERS — Kartu Nama
        //    Currently all same price, add volume discounts
        // =====================================================
        $kartuNamaId = DB::table('percetakan_products')
            ->where('name', 'Kartu Nama')
            ->value('id');

        if ($kartuNamaId) {
            DB::table('percetakan_price_tiers')
                ->where('product_id', $kartuNamaId)
                ->delete();

            DB::table('percetakan_price_tiers')->insert([
                ['product_id' => $kartuNamaId, 'size' => 'default', 'min_qty' => 2,  'max_qty' => 9,   'price_per_unit' => 85000, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $kartuNamaId, 'size' => 'default', 'min_qty' => 10, 'max_qty' => 14,  'price_per_unit' => 75000, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $kartuNamaId, 'size' => 'default', 'min_qty' => 15, 'max_qty' => 24,  'price_per_unit' => 68000, 'created_at' => now(), 'updated_at' => now()],
                ['product_id' => $kartuNamaId, 'size' => 'default', 'min_qty' => 25, 'max_qty' => null, 'price_per_unit' => 60000, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // =====================================================
        // 7. CLEAN UP COA — Remove publishing-related accounts
        //    4001 "Pendapatan Penjualan Buku (Publishing)"
        //    5101 "Beban Royalti Penulis"
        //    2101 "Hutang Royalti Penulis"
        // =====================================================
        // Only remove if no journal entries reference them
        $unusedPublishingAccounts = ['4001', '5101', '2101'];
        foreach ($unusedPublishingAccounts as $code) {
            $accountId = DB::table('accounting_accounts')->where('code', $code)->value('id');
            if ($accountId) {
                $hasEntries = DB::table('accounting_journal_entries')
                    ->where('account_id', $accountId)
                    ->exists();
                if (!$hasEntries) {
                    DB::table('accounting_accounts')->where('id', $accountId)->delete();
                }
            }
        }
    }

    public function down(): void
    {
        // Restore publishing tables (structure only)
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('marketplaces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained();
            $table->string('title');
            $table->string('isbn')->unique()->nullable();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained();
            $table->foreignId('marketplace_id')->constrained();
            $table->string('posting_status')->default('pending');
            $table->timestamps();
        });

        Schema::create('royalty_calculations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained();
            $table->string('period_month');
            $table->timestamps();
        });

        // Restore accounting_expenses
        Schema::create('accounting_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('ref_number')->unique();
            $table->date('date');
            $table->string('contact_type')->nullable();
            $table->foreignId('contact_id')->nullable();
            $table->foreignId('account_id')->constrained('accounting_accounts');
            $table->foreignId('pay_from_account_id')->constrained('accounting_accounts');
            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('journal_id')->nullable()->constrained('accounting_journals');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // Restore publishing COA accounts
        DB::table('accounting_accounts')->insert([
            ['code' => '4001', 'name' => 'Pendapatan Penjualan Buku (Publishing)', 'type' => 'revenue', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '5101', 'name' => 'Beban Royalti Penulis', 'type' => 'expense', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '2101', 'name' => 'Hutang Royalti Penulis', 'type' => 'liability', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
};
