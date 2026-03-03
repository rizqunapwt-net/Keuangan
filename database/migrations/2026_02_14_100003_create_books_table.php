<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('publishing');
            $table->foreignId('author_id')->constrained()->onDelete('restrict');
            $table->string('title');
            $table->string('slug')->nullable()->unique();
            $table->string('isbn')->nullable()->unique();
            $table->decimal('price', 15, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->string('status')->default('draft');
            $table->boolean('is_published')->default(false);
            $table->boolean('is_digital')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->integer('page_count')->nullable();
            $table->string('size')->nullable();
            $table->integer('published_year')->nullable();
            $table->string('publisher')->nullable();
            $table->string('publisher_city')->nullable();
            $table->text('description')->nullable();
            $table->string('tracking_code')->nullable()->unique();
            $table->string('cover_path')->nullable();
            $table->string('pdf_full_path')->nullable();
            $table->string('pdf_preview_path')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('tracking_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
