<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present_on_web_response(): void
    {
        // GET / may redirect (302) if Breeze login is default — check headers on any response
        $response = $this->get('/');

        $response->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(self)');
    }

    public function test_security_headers_are_present_on_api_response(): void
    {
        $response = $this->postJson('/api/v1/auth/token', [
            'login' => 'nobody@example.com',
            'password' => 'wrong-password',
        ]);

        // Returns 401 for invalid credentials
        $response->assertStatus(401)
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }
}