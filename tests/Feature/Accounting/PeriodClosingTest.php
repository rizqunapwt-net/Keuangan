<?php

namespace Tests\Feature\Accounting;

use App\Models\Accounting\Journal;
use App\Models\Accounting\Period;
use App\Models\User;
use App\Services\Accounting\PeriodService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PeriodClosingTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_save_journal_in_closed_period()
    {
        // 1. Setup a closed period
        Period::create([
            'period_month' => '2026-01',
            'status' => 'closed',
        ]);

        // 2. Try to create a journal in that period
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Periode 2026-01 sudah ditutup (Closed).');

        Journal::create([
            'date' => '2026-01-15',
            'journal_number' => 'JRN-TEST-001',
            'total_amount' => 1000,
            'status' => 'posted',
        ]);
    }

    public function test_cannot_close_period_with_draft_journals()
    {
        // 1. Create a draft journal
        Journal::create([
            'date' => '2026-02-15',
            'journal_number' => 'JRN-DRAFT-001',
            'total_amount' => 5000,
            'status' => 'draft',
        ]);

        // 2. Try to close the period
        $service = new PeriodService();

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage("Periode 2026-02 tidak dapat ditutup karena masih ada jurnal berstatus 'Draft'.");

        $service->closePeriod('2026-02');
    }

    public function test_successful_period_closing()
    {
        // 1. Create a posted journal
        Journal::create([
            'date' => '2026-03-15',
            'journal_number' => 'JRN-POSTED-001',
            'total_amount' => 5000,
            'status' => 'posted',
        ]);

        // 2. Close the period
        $user = User::factory()->create();
        $this->actingAs($user);

        $service = new PeriodService();
        $period = $service->closePeriod('2026-03', 'Closing for March');

        $this->assertEquals('closed', $period->status);
        $this->assertDatabaseHas('accounting_periods', [
            'period_month' => '2026-03',
            'status' => 'closed',
            'closed_by' => $user->id,
        ]);
    }
}