<?php

namespace Tests\Feature;

use App\Domain\Royalty\RoyaltyCalculationService;
use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\Marketplace;
use App\Models\Sale;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_and_mark_paid_flow(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $finance = User::factory()->create();
        $finance->assignRole('Finance');

        Sanctum::actingAs($finance);

        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'approved',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'royalty_percentage' => 10,
        ]);

        $marketplace = Marketplace::factory()->create();

        Sale::factory()->create([
            'marketplace_id' => $marketplace->id,
            'book_id' => $book->id,
            'period_month' => '2026-02',
            'quantity' => 5,
            'net_price' => 10000,
            'status' => 'completed',
        ]);

        $service = app(RoyaltyCalculationService::class);
        $calculation = $service->calculateForPeriod('2026-02', $finance)->first();
        $service->finalize($calculation, $finance);

        $invoiceResponse = $this->postJson("/api/v1/royalties/{$calculation->id}/invoice");
        $invoiceResponse->assertCreated()->assertJsonPath('data.status', 'unpaid');

        $paymentId = $invoiceResponse->json('data.id');

        $paidResponse = $this->putJson("/api/v1/payments/{$paymentId}/mark-paid", [
            'payment_reference' => 'BANK-REF-001',
        ]);

        $paidResponse->assertOk()->assertJsonPath('data.status', 'paid');
        $this->assertDatabaseHas('royalty_calculations', [
            'id' => $calculation->id,
            'status' => 'paid',
        ]);
    }
}
