<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\Marketplace;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesImportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_can_import_sales_csv(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $finance = User::factory()->create();
        $finance->assignRole('Finance');

        Sanctum::actingAs($finance);

        $marketplace = Marketplace::factory()->create([
            'code' => 'shopee',
            'name' => 'Shopee',
        ]);

        $author = Author::factory()->create();
        $book = Book::factory()->create([
            'author_id' => $author->id,
            'isbn' => '9786021234567',
        ]);

        Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'approved',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'royalty_percentage' => 10,
        ]);

        $csv = implode("\n", [
            'period_month,marketplace_code,isbn,transaction_id,quantity,net_price,status',
            '2026-02,shopee,9786021234567,TRX-001,5,50000,completed',
            '2026-02,shopee,9786021234567,TRX-002,2,50000,refunded',
        ]);

        $file = UploadedFile::fake()->createWithContent('sales.csv', $csv);

        $response = $this->postJson('/api/v1/sales/import', [
            'period_month' => '2026-02',
            'marketplace_code' => $marketplace->code,
            'file' => $file,
        ]);

        $response->assertCreated();
        $this->assertDatabaseCount('sales', 2);
        $this->assertDatabaseHas('sales_imports', [
            'period_month' => '2026-02',
            'imported_rows' => 2,
        ]);
    }
}
