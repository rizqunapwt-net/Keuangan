<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@rizquna.id'],
            [
                'name' => 'Rizquna Finance Admin',
                'username' => 'admin',
                'password' => 'password',
                'is_active' => true,
                'must_change_password' => false,
            ],
        );

        $role = Role::query()->firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $admin->syncRoles([$role->name]);
    }
}
