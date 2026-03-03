<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        // GET /login now serves React SPA (returns 200 in testing)
        $response = $this->get('/login');

        $response->assertOk();
    }

    public function test_users_can_authenticate_via_api(): void
    {
        Role::query()->firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'is_active' => true,
            'username' => 'testadmin',
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'ADMIN')
            ->assertJsonStructure(['data' => ['access_token', 'user']]);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'username' => 'testuser',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_non_admin_users_are_rejected_even_with_valid_credentials(): void
    {
        Role::query()->firstOrCreate(['name' => 'User', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'username' => 'regularuser',
            'is_active' => true,
        ]);
        $user->assignRole('User');

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.message', 'Akses ditolak. Hanya admin yang dapat login.');
    }

    public function test_users_can_logout_via_api(): void
    {
        Role::query()->firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'username' => 'logoutuser',
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        // Login via API to get token
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);
        $token = $loginResponse->json('data.access_token');

        // Logout via API
        $response = $this->withToken($token)->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }
}
