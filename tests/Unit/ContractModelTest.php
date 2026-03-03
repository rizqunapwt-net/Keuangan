<?php

namespace Tests\Unit;

use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_contract_can_be_created_with_valid_data(): void
    {
        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        $contract = Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'approved',
            'royalty_percentage' => 10,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        $this->assertDatabaseHas('contracts', [
            'id' => $contract->id,
            'book_id' => $book->id,
            'status' => 'approved',
            'royalty_percentage' => 10,
        ]);
    }

    public function test_contract_belongs_to_book(): void
    {
        $book = Book::factory()->create();
        $contract = Contract::factory()->create(['book_id' => $book->id]);

        $this->assertTrue($contract->book()->exists());
        $this->assertEquals($book->id, $contract->book->id);
    }

    public function test_contract_has_valid_date_range(): void
    {
        $contract = Contract::factory()->create([
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        $this->assertTrue($contract->start_date < $contract->end_date);
    }

    public function test_contract_royalty_percentage_is_valid_range(): void
    {
        $contract = Contract::factory()->create([
            'royalty_percentage' => 10,
        ]);

        $this->assertGreaterThanOrEqual(0, $contract->royalty_percentage);
        $this->assertLessThanOrEqual(100, $contract->royalty_percentage);
    }

    public function test_contract_status_can_be_updated(): void
    {
        $contract = Contract::factory()->create(['status' => 'pending']);

        $contract->update(['status' => 'approved']);

        $this->assertEquals('approved', $contract->status->value);
        $this->assertDatabaseHas('contracts', [
            'id' => $contract->id,
            'status' => 'approved',
        ]);
    }

    public function test_multiple_contracts_can_exist_for_same_book(): void
    {
        $book = Book::factory()->create();

        Contract::factory()->count(3)->create(['book_id' => $book->id]);

        $this->assertCount(3, $book->contracts);
    }

    public function test_contract_can_be_deleted(): void
    {
        $contract = Contract::factory()->create();
        $contractId = $contract->id;

        $contract->delete();

        $this->assertDatabaseMissing('contracts', ['id' => $contractId]);
    }
}
