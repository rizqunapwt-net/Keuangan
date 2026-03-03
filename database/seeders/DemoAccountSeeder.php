<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * Seeds demo accounts for active roles in the system.
 * All accounts use password: "password"
 *
 * Run: php artisan db:seed --class=DemoAccountSeeder
 */
class DemoAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'name' => 'Rizquna Admin',
                'username' => 'admin',
                'email' => 'admin@rizquna.id',
                'role' => 'Admin',
                'is_active' => true,
            ],
            [
                'name' => 'Test User',
                'username' => 'user',
                'email' => 'user@example.com',
                'role' => 'User',
                'is_active' => true,
            ],
        ];

        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════════════╗');
        $this->command->info('║           NRE Demo Accounts — Seeding Complete              ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════╣');

        // Ensure roles exist
        foreach (['Admin', 'User'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        foreach ($accounts as $data) {
            $role = $data['role'];
            unset($data['role']);

            $user = User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => 'password',
                    'email_verified_at' => now(),
                ])
            );

            $user->syncRoles([$role]);

            $this->command->info(
                sprintf('║  %-10s │ %-28s │ password  ║', $role, $data['email'])
            );
        }

        $this->command->info('╚══════════════════════════════════════════════════════════════╝');
        $this->command->info('');
    }
}
