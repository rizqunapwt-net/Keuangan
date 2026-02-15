<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContractApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_legal_can_create_and_approve_contract(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $legal = User::factory()->create();
        $legal->assignRole('Legal');

        Sanctum::actingAs($legal);

        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        $response = $this->postJson('/api/v1/contracts', [
            'book_id' => $book->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'royalty_percentage' => 12.5,
            'contract_file' => UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf'),
        ]);

        $response->assertCreated();

        $contractId = $response->json('data.id');

        $approve = $this->putJson("/api/v1/contracts/{$contractId}/approve");
        $approve->assertOk()->assertJsonPath('data.status', 'approved');
    }

    public function test_approve_contract_rejects_overlap(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $legal = User::factory()->create();
        $legal->assignRole('Legal');

        Sanctum::actingAs($legal);

        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        $first = Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'approved',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        $this->assertNotNull($first);

        $second = Contract::factory()->create([
            'book_id' => $book->id,
            'status' => 'pending',
            'start_date' => '2026-06-01',
            'end_date' => '2026-10-31',
        ]);

        $response = $this->putJson("/api/v1/contracts/{$second->id}/approve");

        $response->assertStatus(409);
    }
}
