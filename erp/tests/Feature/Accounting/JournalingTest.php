<?php

namespace Tests\Feature\Accounting;

use App\Enums\SalesImportStatus;
use App\Enums\RoyaltyStatus;
use App\Enums\ContractStatus;
use App\Models\Accounting\Account;
use App\Models\Accounting\Journal;
use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\Marketplace;
use App\Models\RoyaltyCalculation;
use App\Models\Sale;
use App\Models\SalesImport;
use App\Models\User;
use Database\Seeders\AccountingAccountSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $this->seed(AccountingAccountSeeder::class);
    }

    public function test_sales_import_completion_triggers_journal_creation()
    {
        $user = User::factory()->create();
        $marketplace = Marketplace::factory()->create(['code' => 'SHOPEE']);
        $book = Book::factory()->create();

        // Create approved contract for the book (required by Sale saving observer)
        Contract::create([
            'book_id' => $book->id,
            'contract_file_path' => 'contracts/test.pdf',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'royalty_percentage' => 10,
            'status' => ContractStatus::Approved,
        ]);

        $import = SalesImport::create([
            'period_month' => '2026-02',
            'marketplace_code' => 'SHOPEE',
            'file_name' => 'test_sales.xlsx',
            'status' => SalesImportStatus::Processing,
            'imported_by' => $user->id,
        ]);

        Sale::factory()->count(2)->create([
            'sales_import_id' => $import->id,
            'book_id' => $book->id,
            'period_month' => '2026-02',
            'net_price' => 100000, // Total 200,000
        ]);

        // Change status to Completed to trigger observer
        $import->update(['status' => SalesImportStatus::Completed]);

        $this->assertDatabaseHas('accounting_journals', [
            'reference' => 'IMPORT-' . $import->id,
            'total_amount' => 200000,
        ]);

        $journal = Journal::where('reference', 'IMPORT-' . $import->id)->first();
        $this->assertCount(2, $journal->entries);

        // Check Debit (Piutang)
        $this->assertDatabaseHas('accounting_journal_entries', [
            'journal_id' => $journal->id,
            'type' => 'debit',
            'amount' => 200000,
            'account_id' => Account::where('code', '1200')->first()->id,
        ]);

        // Check Credit (Revenue)
        $this->assertDatabaseHas('accounting_journal_entries', [
            'journal_id' => $journal->id,
            'type' => 'credit',
            'amount' => 200000,
            'account_id' => Account::where('code', '4001')->first()->id,
        ]);
    }

    public function test_royalty_finalization_triggers_journal_creation()
    {
        $user = User::factory()->create();
        $author = Author::factory()->create();

        $royalty = RoyaltyCalculation::create([
            'period_month' => '2026-02',
            'author_id' => $author->id,
            'total_amount' => 50000,
            'status' => RoyaltyStatus::Draft,
        ]);

        // Change status to Finalized to trigger observer
        $royalty->update([
            'status' => RoyaltyStatus::Finalized,
            'finalized_by' => $user->id,
            'finalized_at' => now(),
        ]);

        $this->assertDatabaseHas('accounting_journals', [
            'reference' => 'ROYALTY-' . $royalty->id,
            'total_amount' => 50000,
        ]);

        $journal = Journal::where('reference', 'ROYALTY-' . $royalty->id)->first();

        // Check Debit (Expense)
        $this->assertDatabaseHas('accounting_journal_entries', [
            'journal_id' => $journal->id,
            'type' => 'debit',
            'amount' => 50000,
            'account_id' => Account::where('code', '5101')->first()->id,
        ]);

        // Check Credit (Liability)
        $this->assertDatabaseHas('accounting_journal_entries', [
            'journal_id' => $journal->id,
            'type' => 'credit',
            'amount' => 50000,
            'account_id' => Account::where('code', '2101')->first()->id,
        ]);
    }
}