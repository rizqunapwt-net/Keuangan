<?php

namespace Tests\Unit;

use App\Domain\Royalty\RoyaltyCalculationService;
use App\Enums\RoyaltyStatus;
use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\Marketplace;
use App\Models\RoyaltyCalculation;
use App\Models\Sale;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Tests\TestCase;

class RoyaltyCalculationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_calculates_royalty_and_excludes_refunded_sales(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $finance = User::factory()->create();
        $finance->assignRole('Finance');

        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'approved',
            'royalty_percentage' => 10,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        $marketplace = Marketplace::factory()->create();

        Sale::factory()->create([
            'marketplace_id' => $marketplace->id,
            'book_id' => $book->id,
            'period_month' => '2026-02',
            'quantity' => 2,
            'net_price' => 50000,
            'status' => 'completed',
        ]);

        Sale::factory()->create([
            'marketplace_id' => $marketplace->id,
            'book_id' => $book->id,
            'period_month' => '2026-02',
            'quantity' => 10,
            'net_price' => 50000,
            'status' => 'refunded',
        ]);

        $service = app(RoyaltyCalculationService::class);
        $result = $service->calculateForPeriod('2026-02', $finance);

        $this->assertCount(1, $result);
        $calculation = $result->first();

        $this->assertEquals(10000.00, (float) $calculation->total_amount);
        $this->assertEquals(RoyaltyStatus::Draft, $calculation->status);
        $this->assertCount(1, $calculation->items);
    }

    public function test_finalize_throws_conflict_for_non_draft_calculation(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $finance = User::factory()->create();
        $finance->assignRole('Finance');

        $calculation = RoyaltyCalculation::factory()->create([
            'status' => RoyaltyStatus::Finalized,
        ]);

        $service = app(RoyaltyCalculationService::class);

        $this->expectException(ConflictHttpException::class);

        $service->finalize($calculation, $finance);
    }
}
