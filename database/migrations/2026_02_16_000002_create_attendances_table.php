<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id');
            $table->date('attendance_date');
            $table->timestamp('check_in_time')->nullable();
            $table->timestamp('check_out_time')->nullable();
            $table->string('check_in_location')->nullable();
            $table->string('check_out_location')->nullable();
            $table->text('check_in_photo')->nullable();
            $table->text('check_out_photo')->nullable();
            $table->integer('late_minutes')->default(0);
            $table->string('status')->default('HADIR'); // HADIR, ABSEN, IZIN, WFH
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->index(['employee_id', 'attendance_date']);
        });

        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('attendance_id');
            $table->foreignId('corrected_by_user_id')->constrained('users');
            $table->string('field_name');
            $table->text('before_value')->nullable();
            $table->text('after_value')->nullable();
            $table->text('reason');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('attendance_id')->references('id')->on('attendances')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('attendances');
    }
};