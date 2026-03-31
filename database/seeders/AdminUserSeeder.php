<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'rizqunapwt@gmail.com'],
            [
                'name' => 'Rizquna Admin',
                'username' => 'rizqunaid',
                'password' => Hash::make('rizqunaid2026'),
                'is_active' => true,
                'must_change_password' => false,
            ],
        );

        $admin->syncRoles(Role::where('name', 'Admin')->get());
    }
}
