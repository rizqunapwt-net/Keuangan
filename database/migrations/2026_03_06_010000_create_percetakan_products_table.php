<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('percetakan_products')) {
            return; // table already exists (created by another agent)
        }
        Schema::create('percetakan_products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();       // SPD-VINYL-FL, FLY-A4, BK-SC, etc.
            $table->string('name');                   // Vinyl Frontlite 280g
            $table->string('category');               // spanduk, flyer, buku, kartu, sticker, dokumen, ncr
            $table->string('pricing_model');           // area_based, volume_tier, fixed_size, per_page
            $table->string('unit')->default('pcs');   // pcs, m2, box, lembar, meter
            $table->decimal('base_price', 15, 2)->default(0);
            $table->decimal('min_order_area', 10, 2)->nullable();  // minimal 1m2 untuk spanduk
            $table->integer('min_order_qty')->default(1);
            $table->string('default_paper')->nullable();           // HVS 70gsm, Artpaper 150gsm
            $table->integer('default_gsm')->nullable();
            $table->json('available_sizes')->nullable();            // ["A3","A4","A5","A6","DL","custom"]
            $table->json('available_papers')->nullable();           // ["HVS 70gsm","Artpaper 150gsm"]
            $table->json('available_sides')->nullable();            // ["1_side","2_sides"]
            $table->json('available_laminations')->nullable();      // ["none","matte","glossy"]
            $table->json('available_folds')->nullable();            // ["none","fold_2","fold_3","fold_4","fold_6"]
            $table->json('available_bindings')->nullable();         // ["perfect","saddle","wire_o","comb"]
            $table->json('available_finishings')->nullable();       // ["hotprint","emboss","rounded","die_cut"]
            $table->json('available_colors')->nullable();           // ["fullcolor","bw"]
            $table->string('cover_paper')->nullable();              // Artpaper 260gsm (fix untuk buku)
            $table->integer('min_pages')->nullable();               // 50 (perfect), 8 (saddle)
            $table->integer('max_pages')->nullable();               // 500
            $table->integer('digital_max_qty')->nullable();         // <= ini = digital printing
            $table->integer('offset_min_qty')->nullable();          // >= ini = offset printing
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('percetakan_products');
    }
};
