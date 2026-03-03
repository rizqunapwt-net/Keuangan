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
        // Use correct field name (username, not login) for UnifiedLoginController
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'nobody@example.com',
            'password' => 'wrong-password',
        ]);

        // API returns 401 for invalid credentials (or 422 for validation errors)
        // We just check headers are present regardless of status
        $response->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }
}
