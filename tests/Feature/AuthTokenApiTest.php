<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTokenApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_issues_token_for_active_user_with_valid_credentials(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        $payload = [
            'username' => $user->username,
            'password' => 'secret123',
            'device_name' => 'postman',
        ];

        $response = $this->postJson('/api/v1/auth/login', $payload);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'Bearer');

        $this->assertNotEmpty($response->json('data.access_token'));
    }

    public function test_it_issues_token_with_username_field(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'username' => 'finance',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'finance',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['access_token', 'token', 'token_type', 'user']]);
    }

    public function test_it_returns_user_data_with_role_admin(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'username' => 'financeuser',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.role', 'Admin')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'username', 'role']]]);
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'username' => 'financeuser',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_it_rejects_inactive_user(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@rizquna.id',
            'username' => 'inactiveuser',
            'password' => Hash::make('secret123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }
}
