<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_books(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        Book::factory()->count(5)->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/books');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_author_cannot_access_admin_books_list(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create(['is_verified_author' => true]);
        $user->assignRole('User');

        $response = $this->actingAs($user)->getJson('/api/v1/books');

        $response->assertForbidden();
    }

    public function test_admin_can_list_authors(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        Author::factory()->count(3)->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/authors');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_unauthenticated_cannot_access_admin_routes(): void
    {
        $response = $this->getJson('/api/v1/books');

        $response->assertUnauthorized();
    }

    public function test_admin_dashboard_books_stats(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/dashboard/books/stats');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_dashboard_authors_stats(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/dashboard/authors/stats');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }
}
