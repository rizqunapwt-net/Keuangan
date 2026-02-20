<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        // GET /login now redirects to React SPA login
        $response = $this->get('/login');

        $response->assertRedirect('/admin/login');
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $this->seed(RolePermissionSeeder::class);

        // Create an Admin user — Karyawan users redirect to frontend URL, not dashboard
        $user = User::factory()->create(['is_active' => true, 'role' => 'ADMIN']);
        $user->assignRole('Admin');

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        // After session login, admin users redirect to React SPA dashboard
        $response->assertRedirect('/admin/dashboard');
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/admin/login');
    }
}