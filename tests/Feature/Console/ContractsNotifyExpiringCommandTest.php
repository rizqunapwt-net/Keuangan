<?php

namespace Tests\Feature\Console;

use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ContractsNotifyExpiringCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_sends_expiring_contract_payload_to_n8n_webhook(): void
    {
        config(['services.n8n.contract_expiry_webhook' => 'https://n8n.local/webhook/contracts']);

        Http::fake([
            'https://n8n.local/*' => Http::response(['ok' => true], 200),
        ]);

        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'approved',
            'start_date' => now()->subDays(30)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'royalty_percentage' => 10,
        ]);

        $this->artisan('contracts:notify-expiring')
            ->assertSuccessful();

        Http::assertSent(function ($request) {
            $payload = $request->data();

            return $request->url() === 'https://n8n.local/webhook/contracts'
                && isset($payload['alerts'])
                && count($payload['alerts']) >= 1
                && (int) ($payload['alerts'][0]['remaining_days'] ?? 0) === 7;
        });
    }
}
