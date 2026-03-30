<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_npwp')->nullable();
            $table->string('company_website')->nullable();
            $table->string('company_ig')->nullable();
            $table->string('company_wa')->nullable();
            $table->longText('company_logo')->nullable();
            $table->string('director_name')->nullable();
            $table->string('director_title')->nullable();
            $table->string('invoice_bank_name')->nullable();
            $table->string('invoice_bank_account')->nullable();
            $table->string('invoice_bank_holder')->nullable();
            $table->string('currency')->default('IDR');
            $table->decimal('tax_rate', 5, 2)->default(11);
            $table->text('footer_note')->nullable();
            $table->timestamps();
        });

        // Insert default row
        DB::table('settings')->insert([
            'company_name' => 'RIZQUNA',
            'company_address' => 'Jl. KS. Tubun Gang Camar Rt 05/04, Karangsalam Kidul, Kedungbanteng, Banyumas – Purwokerto – Jawa Tengah',
            'company_phone' => '0812-9485-6272',
            'company_email' => 'cv.rizquna@gmail.com',
            'company_website' => 'www.rizquna.id',
            'company_ig' => '@penerbit_rizquna',
            'company_wa' => '0812-9485-6272',
            'company_logo' => '/admin/logo-nre.png',
            'director_name' => 'SUDARYONO',
            'director_title' => 'Direktur',
            'invoice_bank_name' => 'Bank BTPN / SMBC (kode 213)',
            'invoice_bank_account' => '902-4013-3956',
            'invoice_bank_holder' => 'FITRIANTO',
            'currency' => 'IDR',
            'tax_rate' => 11,
            'footer_note' => 'Terima kasih atas kepercayaan Anda kepada kami.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
