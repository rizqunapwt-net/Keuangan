<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('type')->default('publishing')->after('id');
            $table->index('type');
        });

        // Make author_id nullable for printing books (client may not be an author)
        // SQLite doesn't support ALTER COLUMN, so we handle this carefully
        if (config('database.default') !== 'sqlite') {
            Schema::table('books', function (Blueprint $table) {
                $table->foreignId('author_id')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn('type');
        });
    }
};
