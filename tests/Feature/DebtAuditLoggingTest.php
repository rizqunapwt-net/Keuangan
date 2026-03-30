<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Debt;
use App\Models\DebtPayment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebtAuditLoggingTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_debt_logs_deleted_event_for_debt_and_cascaded_payments(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');

        $debt = Debt::create([
            'type' => 'receivable',
            'status' => 'partial',
            'date' => now()->toDateString(),
            'client_name' => 'PT Aman Sentosa',
            'amount' => 500000,
            'paid_amount' => 100000,
        ]);

        $payment = DebtPayment::create([
            'debt_id' => $debt->id,
            'date' => now()->toDateString(),
            'amount' => 100000,
            'note' => 'Pembayaran tahap 1',
            'bank_id' => null,
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/v1/finance/debts/{$debt->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('debts', ['id' => $debt->id]);
        $this->assertDatabaseMissing('debt_payments', ['id' => $payment->id]);

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_DELETED,
            'table_name' => 'debts',
            'auditable_id' => $debt->id,
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_DELETED,
            'table_name' => 'debt_payments',
            'auditable_id' => $payment->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_deleting_payment_without_bank_still_creates_audit_log(): void
    {
        $this->seed(RolePermissionSeeder::class);
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');

        $debt = Debt::create([
            'type' => 'receivable',
            'status' => 'partial',
            'date' => now()->toDateString(),
            'client_name' => 'CV Aman',
            'amount' => 300000,
            'paid_amount' => 100000,
        ]);

        $payment = DebtPayment::create([
            'debt_id' => $debt->id,
            'date' => now()->toDateString(),
            'amount' => 100000,
            'note' => 'Pembayaran tanpa bank',
            'bank_id' => null,
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/v1/finance/debts/payments/{$payment->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('debt_payments', ['id' => $payment->id]);
        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_DELETED,
            'table_name' => 'debt_payments',
            'auditable_id' => $payment->id,
            'user_id' => $user->id,
        ]);
    }
}
