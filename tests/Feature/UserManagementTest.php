<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);
    }

    /** @test */
    public function test_user_can_login_with_valid_credentials()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $this->user->username,
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->json('data.access_token'));
    }

    /** @test */
    public function test_user_login_fails_with_invalid_password()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $this->user->username,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function test_user_login_fails_with_invalid_email()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'nonexistent',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function test_authenticated_user_can_access_profile()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200);
        $response->assertJsonPath('data.user.email', 'admin@test.com');
    }

    /** @test */
    public function test_unauthenticated_user_cannot_access_profile()
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    /** @test */
    public function test_user_can_logout()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
    }

    /** @test */
    public function test_user_can_update_profile()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@test.com',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['name' => 'Updated Name', 'email' => 'updated@test.com']);
    }

    /** @test */
    public function test_user_cannot_update_profile_with_existing_email()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'Updated Name',
            'email' => 'existing@test.com',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_user_can_change_password()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->postJson('/api/v1/auth/change-password', [
            'current_password' => 'password',
            'new_password' => 'New-Password123',
            'new_password_confirmation' => 'New-Password123',
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function test_user_cannot_change_password_with_wrong_current_password()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->postJson('/api/v1/auth/change-password', [
            'current_password' => 'wrong-password',
            'new_password' => 'New-Password123',
            'new_password_confirmation' => 'New-Password123',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_user_list_requires_authentication()
    {
        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(401);
    }

    /** @test */
    public function test_admin_can_list_users()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        User::factory(5)->create();

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(5, count($response->json('data')));
    }

    /** @test */
    public function test_user_creation_requires_valid_data()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->postJson('/api/v1/users', [
            'name' => 'New User',
            // Missing email and password
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_user_can_be_created_with_valid_data()
    {
        $this->actingAsWithRole($this->user, 'Admin');
        $response = $this->postJson('/api/v1/users', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'New-Password123',
            'password_confirmation' => 'New-Password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newuser@test.com']);
    }
}
