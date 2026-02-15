<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_security_headers_are_present_on_web_response(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }

    public function test_security_headers_are_present_on_api_response(): void
    {
        $response = $this->postJson('/api/v1/auth/token', [
            'email' => 'nobody@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }
}

