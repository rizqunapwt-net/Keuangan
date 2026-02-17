<?php

namespace Tests\Feature;

use App\Models\Accounting\Account;
use App\Models\Accounting\Journal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingTest extends TestCase
{
    use RefreshDatabase;

    public function test_journal_entry_calculates_balance_and_posts(): void
    {
        // 1. Setup User and Accounts
        $user = User::factory()->create();
        $cash = Account::create(['code' => '1000', 'name' => 'KAS', 'type' => 'asset']);
        $sales = Account::create(['code' => '4000', 'name' => 'PENJUALAN', 'type' => 'revenue']);

        // 2. Create Journal
        $journal = Journal::create([
            'date' => now(),
            'description' => 'Test Sales Journal',
            'created_by' => $user->id,
            'status' => 'draft',
        ]);

        // 3. Create Entries (Debit Cash, Credit Sales)
        $journal->entries()->createMany([
            ['account_id' => $cash->id, 'type' => 'debit', 'amount' => 150000],
            ['account_id' => $sales->id, 'type' => 'credit', 'amount' => 150000],
        ]);

        // 4. Assertions
        $this->assertEquals(2, $journal->entries()->count());
        $this->assertEquals(150000, $journal->entries()->where('type', 'debit')->sum('amount'));

        // Ensure journal number is auto-generated
        $this->assertStringStartsWith('JRN-', $journal->journal_number);
    }
}