<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('percetakan_orders', function (Blueprint $table) {
            // Link ke master produk
            $table->unsignedBigInteger('percetakan_product_id')->nullable()->after('product_id');
            $table->foreign('percetakan_product_id')->references('id')->on('percetakan_products')->nullOnDelete();

            // Detail finishing yang dipilih (JSON)
            $table->json('finishing_details')->nullable()->after('specifications');
            // contoh: {"lamination":"matte","folding":"fold_3","hotprint":true,"emboss":false}

            // Dimensi untuk area-based (spanduk)
            $table->decimal('width_cm', 10, 2)->nullable()->after('quantity');
            $table->decimal('height_cm', 10, 2)->nullable()->after('width_cm');
            $table->decimal('area_m2', 10, 4)->nullable()->after('height_cm');

            // Info cetak
            $table->string('print_method')->nullable()->after('area_m2'); // digital / offset
            $table->string('paper_type')->nullable()->after('print_method');
            $table->string('paper_size')->nullable()->after('paper_type');      // A3, A4, A5, dll
            $table->string('color_mode')->nullable()->after('paper_size');      // fullcolor / bw
            $table->string('print_sides')->nullable()->after('color_mode');     // 1_side / 2_sides
            $table->integer('page_count')->nullable()->after('print_sides');    // jumlah halaman (buku)
            $table->string('binding_type')->nullable()->after('page_count');    // perfect / saddle / wire_o
            $table->decimal('weight_kg', 10, 3)->nullable()->after('binding_type');

            // Sticker layout
            $table->decimal('sticker_unit_w', 10, 2)->nullable()->after('weight_kg');
            $table->decimal('sticker_unit_h', 10, 2)->nullable()->after('sticker_unit_w');
            $table->integer('sticker_per_sheet')->nullable()->after('sticker_unit_h');
            $table->integer('sheet_count')->nullable()->after('sticker_per_sheet');
            $table->string('cutting_method')->nullable()->after('sheet_count'); // no_cut / square / kiss_cut / die_cut
        });
    }

    public function down(): void
    {
        Schema::table('percetakan_orders', function (Blueprint $table) {
            $table->dropForeign(['percetakan_product_id']);
            $table->dropColumn([
                'percetakan_product_id', 'finishing_details',
                'width_cm', 'height_cm', 'area_m2',
                'print_method', 'paper_type', 'paper_size', 'color_mode',
                'print_sides', 'page_count', 'binding_type', 'weight_kg',
                'sticker_unit_w', 'sticker_unit_h', 'sticker_per_sheet',
                'sheet_count', 'cutting_method',
            ]);
        });
    }
};
