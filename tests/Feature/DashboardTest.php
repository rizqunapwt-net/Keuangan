<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_can_be_rendered()
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $response = $this->actingAs($user)->get('/panel');

        $response->assertStatus(200);

        // Assert that our custom dashboard title is present
        $response->assertSee('Command Center');

        // Assert that widgets are present (using e() to match HTML encoding)
        $response->assertSee('Cash Position');
        $response->assertSee('New Sale');
        $response->assertSee('Aktivitas Sistem Terbaru');
    }
}