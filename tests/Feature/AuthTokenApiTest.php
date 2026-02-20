<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTokenApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_issues_token_for_active_user_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/token', [
            'login' => $user->email,
            'password' => 'secret123',
            'device_name' => 'postman',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'Bearer');

        $this->assertNotEmpty($response->json('data.access_token'));
        $this->assertNotEmpty($response->json('data.token')); // alias
        $this->assertEquals($response->json('data.access_token'), $response->json('data.token'));
    }

    public function test_it_issues_token_with_username_field(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'username' => 'finance',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/token', [
            'username' => 'finance',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['access_token', 'token', 'token_type', 'user']]);
    }

    public function test_it_returns_user_data_with_role_and_employee(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/token', [
            'login' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'username', 'role']]]);
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/token', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_it_rejects_missing_login_field(): void
    {
        $response = $this->postJson('/api/v1/auth/token', [
            'password' => 'secret123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_it_rejects_inactive_user(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@rizquna.id',
            'password' => Hash::make('secret123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/token', [
            'login' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }
}