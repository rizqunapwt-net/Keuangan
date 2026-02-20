<?php

namespace Tests\Feature;

// https://laravel.com/docs/11.x/starter-kits
// This is a default Breeze test. Since our app has Filament as admin panel
// the root URL (/) redirects to /admin or /login, not 200 OK.
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        // Root URL redirects to login or admin panel
        $response = $this->get('/');

        $response->assertRedirect();
    }
}