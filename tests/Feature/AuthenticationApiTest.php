<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->withoutMiddleware();
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        Role::query()->firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->json('data.access_token'));
        $this->assertEquals('Admin', $response->json('data.user.role'));
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $user->assignRole('Admin');

        $response = $this->actingAs($user)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200);
        $response->assertJsonPath('data.user.email', 'test@example.com');
        $response->assertJsonPath('data.user.role', 'Admin');
    }

    public function test_unauthenticated_user_cannot_get_profile(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
    }

    public function test_registration_is_disabled(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_forgot_password_always_returns_success(): void
    {
        // Email does not exist
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // Email exists
        User::factory()->create(['email' => 'exists@example.com']);
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'exists@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_login_with_username_works_if_supported(): void
    {
        Role::query()->firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'testuser',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
    }
}
