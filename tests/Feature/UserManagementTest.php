<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);
    }

    /** @test */
    public function test_user_can_login_with_valid_credentials()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin@test.com',
            'password' => 'password',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('message', $response->json('data'));
    }

    /** @test */
    public function test_user_login_fails_with_invalid_password()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'wrong-password',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function test_user_login_fails_with_invalid_email()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@test.com',
            'password' => 'password',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function test_authenticated_user_can_access_profile()
    {
        $response = $this->actingAs($this->user)->getJson('/api/v1/auth/me');

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
        $response = $this->actingAs($this->user)->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
    }

    /** @test */
    public function test_user_can_update_profile()
    {
        $response = $this->actingAs($this->user)->putJson('/api/v1/auth/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@test.com',
        ]);

        $response->assertStatus(200);
        $this->user->refresh();
        $this->assertEquals('Updated Name', $this->user->name);
    }

    /** @test */
    public function test_user_cannot_update_profile_with_duplicate_email()
    {
        User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->actingAs($this->user)->putJson('/api/v1/auth/profile', [
            'name' => 'Updated Name',
            'email' => 'existing@test.com',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_user_can_change_password()
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/auth/change-password', [
            'current_password' => 'password',
            'new_password' => 'New-Password123',
            'new_password_confirmation' => 'New-Password123',
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function test_user_cannot_change_password_with_wrong_current_password()
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/auth/change-password', [
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
    public function test_authenticated_user_can_list_users()
    {
        User::factory(5)->create();

        $response = $this->actingAs($this->user)->getJson('/api/v1/users');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(5, count($response->json('data')));
    }

    /** @test */
    public function test_user_creation_requires_valid_data()
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/users', [
            'name' => 'New User',
            // Missing email and password
        ]);

        $response->assertStatus(422);
        $this->assertArrayHasKey('email', $response->json('error.errors'));
        $this->assertArrayHasKey('password', $response->json('error.errors'));
    }

    /** @test */
    public function test_user_can_be_created_with_valid_data()
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/users', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'New-Password123',
            'password_confirmation' => 'New-Password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newuser@test.com']);
    }
}
