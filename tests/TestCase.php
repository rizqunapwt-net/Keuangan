<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Disable Vite in tests — avoids manifest not found errors
        // when assets haven't been built (CI, local dev, macOS permission issues)
        $this->withoutVite();

        // Clear permission cache before each test to avoid SQLite locks
        if (class_exists(\Spatie\Permission\Models\Role::class)) {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        }

        // Flush application cache to ensure test isolation (especially for array driver)
        \Illuminate\Support\Facades\Cache::flush();
    }

    /**
     * Assign a role (web guard) and actAs the user via web and sanctum guards.
     */
    protected function actingAsWithRole(\App\Models\User $user, string $role): static
    {
        $guards = ['web', 'sanctum'];
        foreach ($guards as $guard) {
            try {
                $user->assignRole(\Spatie\Permission\Models\Role::findByName($role, $guard));
            } catch (\Exception $e) {
                // Skip if role doesn't exist for this guard
            }
        }

        \Laravel\Sanctum\Sanctum::actingAs($user);

        return $this->actingAs($user);
    }
}
