<?php

namespace Tests\Feature;

use App\Models\Accounting\Account;
use App\Models\AuditLog;
use App\Models\Bank;
use App\Models\CashTransaction;
use App\Models\Contact;
use App\Models\Debt;
use App\Models\Expense;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceAuditIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_cash_transaction_reverses_balance_and_writes_audit_logs(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');
        $bank = $this->createBank(1_000_000);

        $transaction = CashTransaction::create([
            'type' => 'income',
            'bank_id' => $bank->id,
            'date' => now()->toDateString(),
            'amount' => 200_000,
            'category' => 'Penjualan',
            'description' => 'Setoran kas',
            'running_balance' => 1_000_000,
        ]);

        $response = $this->deleteJson("/api/v1/finance/cash-transactions/{$transaction->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('cash_transactions', ['id' => $transaction->id]);
        $this->assertDatabaseHas('banks', [
            'id' => $bank->id,
            'balance' => 800000,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_BALANCE_CHANGED,
            'table_name' => 'banks',
            'auditable_id' => $bank->id,
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_DELETED,
            'table_name' => 'cash_transactions',
            'auditable_id' => $transaction->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_bank_with_financial_history_cannot_be_deleted(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');
        $bank = $this->createBank(500_000);

        CashTransaction::create([
            'type' => 'income',
            'bank_id' => $bank->id,
            'date' => now()->toDateString(),
            'amount' => 100_000,
            'category' => 'Initial',
            'description' => 'Histori transaksi',
            'running_balance' => 500_000,
        ]);

        $response = $this->deleteJson("/api/v1/finance/banks/{$bank->id}");

        $response
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.errors.bank.0', 'Akun bank/kas tidak dapat dihapus karena sudah memiliki histori transaksi keuangan.');

        $this->assertDatabaseHas('banks', [
            'id' => $bank->id,
            'deleted_at' => null,
        ]);
    }

    public function test_deleting_expense_writes_audit_log(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');

        $expense = Expense::create([
            'user_id' => $user->id,
            'description' => 'Biaya operasional',
            'category' => 'Operasional',
            'amount' => 350000,
            'currency' => 'IDR',
            'expense_date' => now()->toDateString(),
            'payment_method' => 'cash',
        ]);

        $response = $this->deleteJson("/api/v1/finance/expenses/{$expense->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('expenses', ['id' => $expense->id]);

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_DELETED,
            'table_name' => 'expenses',
            'auditable_id' => $expense->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_deleting_account_without_journal_entries_writes_audit_log(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');

        $account = Account::create([
            'code' => '9999',
            'name' => 'Akun Uji Hapus',
            'type' => 'expense',
            'description' => 'Testing delete',
            'is_active' => true,
        ]);

        $response = $this->deleteJson("/api/v1/finance/accounts/{$account->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseMissing('accounting_accounts', ['id' => $account->id]);

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => AuditLog::EVENT_DELETED,
            'table_name' => 'accounting_accounts',
            'auditable_id' => $account->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_debt_index_contact_filter_maps_to_client_name_safely(): void
    {
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $this->actingAsWithRole($user, 'Admin');

        $contact = Contact::create([
            'name' => 'PT Klien A',
            'type' => 'customer',
            'created_by' => $user->id,
        ]);

        Debt::create([
            'type' => 'receivable',
            'status' => 'unpaid',
            'date' => now()->toDateString(),
            'client_name' => 'PT Klien A',
            'contact_id' => $contact->id,
            'amount' => 100000,
            'paid_amount' => 0,
        ]);

        Debt::create([
            'type' => 'receivable',
            'status' => 'unpaid',
            'date' => now()->toDateString(),
            'client_name' => 'PT Lain',
            'amount' => 120000,
            'paid_amount' => 0,
        ]);

        $response = $this->getJson("/api/v1/finance/debts?contact_id={$contact->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('PT Klien A', $response->json('data.0.client_name'));
    }

    private function createBank(float $balance): Bank
    {
        return Bank::create([
            'bank_code' => 'BNK-'.uniqid(),
            'bank_name' => 'Bank Test',
            'branch_name' => 'Jakarta',
            'account_number' => 'AC'.uniqid(),
            'account_holder' => 'PT Test',
            'account_type' => 'current',
            'currency' => 'IDR',
            'opening_balance' => $balance,
            'opening_date' => now()->toDateString(),
            'balance' => $balance,
            'status' => 'active',
            'is_primary' => false,
        ]);
    }
}
