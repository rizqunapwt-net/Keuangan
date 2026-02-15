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
            'email' => $user->email,
            'password' => 'secret123',
            'device_name' => 'postman',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'Bearer');

        $this->assertNotEmpty($response->json('data.access_token'));
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/token', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
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
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }
}
