<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('percetakan_products', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable()->after('category');
            $table->foreign('material_id')->references('id')->on('percetakan_materials')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('percetakan_products', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->dropColumn('material_id');
        });
    }
};
