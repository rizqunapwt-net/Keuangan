<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTokenRateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_token_rate_limit_blocks_after_threshold(): void
    {
        Role::query()->firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'email' => 'finance@rizquna.id',
            'username' => 'financeuser',
            'password' => Hash::make('secret123'),
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        // Isolate rate limit counters from other tests.
        $client = $this->withServerVariables(['REMOTE_ADDR' => '10.10.10.10']);

        for ($i = 0; $i < 10; $i++) {
            // Use correct field name (username) for UnifiedLoginController
            $client->postJson('/api/v1/auth/login', [
                'username' => $user->username,
                'password' => 'secret123',
                'device_name' => 'test-client',
            ])->assertOk();
        }

        // 11th request should be rate limited (429)
        $client->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'secret123',
            'device_name' => 'test-client',
        ])->assertStatus(429);
    }
}
