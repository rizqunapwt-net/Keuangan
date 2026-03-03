<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan role 'User' ada
        Role::firstOrCreate(
            ['name' => 'User', 'guard_name' => 'web'],
            ['created_at' => now(), 'updated_at' => now()]
        );

        $this->command->info('✅ Role "User" berhasil dibuat/dipastikan ada.');
    }
}
