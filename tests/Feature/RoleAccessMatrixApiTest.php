<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessMatrixApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_user_cannot_access_books_endpoint(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('User');
        $this->actingAs($user);

        $response = $this->getJson('/api/v1/books');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_books_endpoint(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $this->actingAsWithRole($admin, 'Admin');

        $response = $this->getJson('/api/v1/books');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_default_user_cannot_access_authors_endpoint(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('User');
        $this->actingAs($user);

        $response = $this->getJson('/api/v1/authors');

        $response->assertStatus(403);
    }
}
