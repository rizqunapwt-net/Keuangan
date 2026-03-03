<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class PercetakanTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_percetakan_customers(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $admin = User::factory()->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/percetakan/customers');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_author_cannot_access_percetakan(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('User');

        $response = $this->actingAs($user)
            ->getJson('/api/v1/percetakan/customers');

        $response->assertForbidden();
    }

    public function test_unauthenticated_cannot_access_percetakan(): void
    {
        $response = $this->getJson('/api/v1/percetakan/customers');

        $response->assertUnauthorized();
    }

    public function test_admin_can_access_percetakan_materials(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $admin = User::factory()->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/percetakan/materials');

        $response->assertOk();
    }

    public function test_admin_can_access_percetakan_orders(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $admin = User::factory()->create();

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->getJson('/api/v1/percetakan/orders');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_author_cannot_access_dashboard(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('User');

        $response = $this->actingAs($user)
            ->getJson('/api/v1/dashboard/books/stats');

        $response->assertForbidden();
    }

    public function test_author_cannot_access_finance_routes(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('User');

        $response = $this->actingAs($user)
            ->getJson('/api/v1/finance/invoices');

        $response->assertForbidden();
    }

    public function test_admin_can_mark_order_completed_and_log_handover_to_finance(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $admin = User::factory()->create();
        $this->prepareAgentLogFile();

        $customerId = $this->createPercetakanCustomer('PT Cetak Maju');
        $orderId = $this->createPercetakanOrder($customerId, [
            'order_number' => 'ORD-TST-0001',
            'status' => 'in_production',
            'total_amount' => 2450000,
        ]);

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->patchJson("/api/v1/percetakan/orders/{$orderId}/status", [
                'status' => 'completed',
                'notes' => 'QC lulus, siap terbit invoice.',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.coordinated_with_finance', true);

        $this->assertDatabaseHas('percetakan_orders', [
            'id' => $orderId,
            'status' => 'completed',
        ]);

        $logContent = File::get($this->agentLogPath());
        $this->assertStringContainsString('Koordinasi Invoice ke Agent Finance', $logContent);
        $this->assertStringContainsString('ORD-TST-0001', $logContent);
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $admin = User::factory()->create();
        $this->prepareAgentLogFile();

        $customerId = $this->createPercetakanCustomer('PT Cetak Kilat');
        $orderId = $this->createPercetakanOrder($customerId, [
            'order_number' => 'ORD-TST-0002',
            'status' => 'inquiry',
        ]);

        $response = $this->actingAsWithRole($admin, 'Admin')
            ->patchJson("/api/v1/percetakan/orders/{$orderId}/status", [
                'status' => 'completed',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('percetakan_orders', [
            'id' => $orderId,
            'status' => 'inquiry',
        ]);

        $logContent = File::get($this->agentLogPath());
        $this->assertStringNotContainsString('ORD-TST-0002', $logContent);
    }

    private function createPercetakanCustomer(string $name): int
    {
        return (int) DB::table('percetakan_customers')->insertGetId([
            'name' => $name,
            'type' => 'retail',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createPercetakanOrder(int $customerId, array $overrides = []): int
    {
        $defaults = [
            'order_number' => 'ORD-TST-DEFAULT',
            'customer_id' => $customerId,
            'status' => 'inquiry',
            'quantity' => 100,
            'unit_price' => 15000,
            'subtotal' => 1500000,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_amount' => 1500000,
            'deposit_percentage' => 0,
            'deposit_amount' => 0,
            'deposit_paid' => 0,
            'balance_due' => 1500000,
            'priority' => 'normal',
            'is_rush_order' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        return (int) DB::table('percetakan_orders')->insertGetId(array_merge($defaults, $overrides));
    }

    private function prepareAgentLogFile(): void
    {
        File::ensureDirectoryExists(dirname($this->agentLogPath()));
        File::put($this->agentLogPath(), '');
    }

    private function agentLogPath(): string
    {
        return base_path('.agents_mcp/logs/activity.log');
    }
}
