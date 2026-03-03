<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Audit Logs untuk mencatat setiap aktivitas sensitif:
     * - Delete transaksi
     * - Void transaksi
     * - Perubahan saldo kas/bank
     * - Akses menu sensitif oleh non-admin
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('event_type'); // deleted, voided, balance_changed, unauthorized_access
            $table->string('auditable_type'); // Model class yang diaudit
            $table->unsignedBigInteger('auditable_id');
            $table->string('table_name'); // Nama tabel untuk referensi
            $table->text('description');
            $table->json('old_values')->nullable(); // Data sebelum perubahan
            $table->json('new_values')->nullable(); // Data setelah perubahan
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Index untuk query cepat
            $table->index(['auditable_type', 'auditable_id']);
            $table->index('event_type');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
