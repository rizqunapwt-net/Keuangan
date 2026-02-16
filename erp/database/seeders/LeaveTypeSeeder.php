<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'code' => 'TAHUNAN',
                'name' => 'Cuti Tahunan',
                'description' => 'Cuti tahunan sesuai UU Ketenagakerjaan (12 hari/tahun)',
                'max_days' => 12,
                'requires_doc' => false,
                'color' => '#6366f1',
            ],
            [
                'code' => 'SAKIT',
                'name' => 'Cuti Sakit',
                'description' => 'Cuti sakit dengan surat keterangan dokter',
                'max_days' => 14,
                'requires_doc' => true,
                'color' => '#ef4444',
            ],
            [
                'code' => 'MELAHIRKAN',
                'name' => 'Cuti Melahirkan',
                'description' => 'Cuti melahirkan sesuai UU (3 bulan)',
                'max_days' => 90,
                'requires_doc' => true,
                'color' => '#ec4899',
            ],
            [
                'code' => 'MENIKAH',
                'name' => 'Cuti Menikah',
                'description' => 'Cuti pernikahan karyawan',
                'max_days' => 3,
                'requires_doc' => true,
                'color' => '#f59e0b',
            ],
            [
                'code' => 'KELUARGA',
                'name' => 'Cuti Keluarga',
                'description' => 'Cuti karena urusan keluarga (meninggal, menikah anak, dll)',
                'max_days' => 3,
                'requires_doc' => false,
                'color' => '#8b5cf6',
            ],
            [
                'code' => 'PENTING',
                'name' => 'Izin Keperluan Penting',
                'description' => 'Izin untuk keperluan penting tak terduga',
                'max_days' => 5,
                'requires_doc' => false,
                'color' => '#06b6d4',
            ],
        ];

        foreach ($types as $type) {
            LeaveType::updateOrCreate(
            ['code' => $type['code']],
                $type
            );
        }
    }
}