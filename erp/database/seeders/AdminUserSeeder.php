<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@rizquna.id'],
            [
                'name' => 'Rizquna Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
            ],
        );

        $admin->syncRoles(['Admin']);
    }
}
