<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add HR-specific columns to existing users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('name');
            $table->string('role')->default('KARYAWAN')->after('password');
            $table->text('face_descriptor')->nullable()->after('role');
        });

        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('employee_code')->nullable();
            $table->string('category')->default('REGULER'); // REGULER, MAHASISWA, KEBUN
            $table->decimal('base_salary', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role', 'face_descriptor']);
        });
    }
};