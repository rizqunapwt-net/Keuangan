<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTokenRateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_token_rate_limit_blocks_after_threshold(): void
    {
        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);

        // Isolate rate limit counters from other tests.
        $client = $this->withServerVariables(['REMOTE_ADDR' => '10.10.10.10']);

        for ($i = 0; $i < 10; $i++) {
            $client->postJson('/api/v1/auth/token', [
                'email' => $user->email,
                'password' => 'secret123',
                'device_name' => 'test-client',
            ])->assertOk();
        }

        $client->postJson('/api/v1/auth/token', [
            'email' => $user->email,
            'password' => 'secret123',
            'device_name' => 'test-client',
        ])->assertStatus(429);
    }
}

