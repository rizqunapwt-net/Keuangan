<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessMatrixApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_marketing_cannot_import_sales(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $marketing = User::factory()->create();
        $marketing->assignRole('Marketing');
        Sanctum::actingAs($marketing);

        $response = $this->postJson('/api/v1/sales/import', []);

        $response->assertStatus(403);
    }

    public function test_finance_can_access_royalty_calculation_endpoint(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $finance = User::factory()->create();
        $finance->assignRole('Finance');
        Sanctum::actingAs($finance);

        $response = $this->postJson('/api/v1/royalties/calculate', [
            'period_month' => '2026-02',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_legal_cannot_mark_payment_paid(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $legal = User::factory()->create();
        $legal->assignRole('Legal');
        Sanctum::actingAs($legal);

        $payment = Payment::factory()->create();

        $response = $this->putJson("/api/v1/payments/{$payment->id}/mark-paid", [
            'payment_reference' => 'REF-001',
        ]);

        $response->assertStatus(403);
    }
}
