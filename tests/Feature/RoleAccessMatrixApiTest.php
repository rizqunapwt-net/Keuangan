<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessMatrixApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_user_cannot_access_finance_summary_without_permission(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('User'); // User role doesn't have finance permissions by default in our seeder
        $this->actingAs($user); // Use actingAs which defaults to web/sanctum as configured

        $response = $this->getJson('/api/v1/finance/summary');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_finance_summary(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $this->actingAsWithRole($admin, 'Admin');

        $response = $this->getJson('/api/v1/finance/summary');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_user_with_permission_can_access_finance_summary(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        foreach (['web', 'sanctum'] as $guard) {
            $user->givePermissionTo(\Spatie\Permission\Models\Permission::findByName('finance.view_reports', $guard));
        }
        $this->actingAs($user);

        $response = $this->getJson('/api/v1/finance/summary');

        $response->assertOk();
    }
}
