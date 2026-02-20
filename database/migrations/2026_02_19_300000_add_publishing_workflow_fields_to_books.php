<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('gdrive_link')->nullable()->after('cover_path');
            $table->string('surat_scan_path')->nullable()->after('gdrive_link');
            $table->string('surat_status')->nullable()->default('belum_kirim')->after('surat_scan_path');
            $table->string('revision_notes')->nullable()->after('surat_status');
            $table->string('cover_file_path')->nullable()->after('cover_path');
            $table->unsignedInteger('page_count')->nullable()->after('stock');
            $table->string('size')->nullable()->after('page_count');
            $table->unsignedSmallInteger('published_year')->nullable()->after('size');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'gdrive_link', 'surat_scan_path', 'surat_status',
                'revision_notes', 'cover_file_path', 'page_count',
                'size', 'published_year',
            ]);
        });
    }
};