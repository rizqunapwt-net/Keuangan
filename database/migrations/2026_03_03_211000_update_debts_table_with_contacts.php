<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->foreignId('contact_id')->nullable()->after('id')->constrained('contacts')->nullOnDelete();
        });
    }
 
    public function down(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('contact_id');
        });
    }
};
