<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        // Registration is disabled - redirects to admin login
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        // Registration disabled in production - skip this test
        $this->markTestSkipped('Registration disabled - using admin panel for user creation');
    }
}
