<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Author;
use App\Models\Book;
use App\Models\Marketplace;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AssignmentContractGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignment_is_blocked_when_no_approved_contract_exists(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $marketing = User::factory()->create();
        $marketing->assignRole('Marketing');

        $this->actingAs($marketing);

        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);
        $marketplace = Marketplace::factory()->create();

        $this->expectException(ValidationException::class);

        Assignment::create([
            'book_id' => $book->id,
            'marketplace_id' => $marketplace->id,
            'product_url' => 'https://example.com/product',
            'posting_status' => 'draft',
        ]);
    }
}
