<?php

namespace Tests\Concerns;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

trait SeedsRolesAndPermissions
{
    /**
     * Create an Admin user with all permissions seeded.
     */
    protected function createAdminUser(array $attributes = []): User
    {
        $this->seedRolesOnce();

        $user = User::factory()->create(array_merge([
            'is_active' => true,
        ], $attributes));

        $user->assignRole('Admin');

        return $user;
    }

    /**
     * Create a regular User with limited permissions.
     */
    protected function createRegularUser(array $attributes = []): User
    {
        $this->seedRolesOnce();

        $user = User::factory()->create(array_merge([
            'is_active' => true,
        ], $attributes));

        $user->assignRole('User');

        return $user;
    }

    /**
     * Seed roles and permissions (idempotent).
     */
    protected function seedRolesOnce(): void
    {
        static $seeded = false;

        if (! $seeded) {
            $this->seed(RolePermissionSeeder::class);
            $seeded = true;
        }
    }
}
