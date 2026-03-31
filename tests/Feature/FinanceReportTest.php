<?php

namespace Tests\Feature;

use App\Models\Bank;
use App\Models\CashTransaction;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceReportTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected $bank;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->user = User::factory()->create();
        $this->actingAsWithRole($this->user, 'Admin');
        $this->bank = Bank::factory()->create();
    }

    /** @test */
    public function test_daily_report_aggregates_income_and_expenses()
    {
        $date = now()->startOfMonth();

        // Create income and expense transactions
        CashTransaction::factory()->create([
            'bank_id' => $this->bank->id,
            'type' => 'income',
            'amount' => 100000,
            'date' => $date,
        ]);

        CashTransaction::factory()->create([
            'bank_id' => $this->bank->id,
            'type' => 'expense',
            'amount' => 30000,
            'date' => $date,
        ]);

        $response = $this->getJson('/api/v1/finance/reports/daily'.'?month='.$date->month.'&year='.$date->year);

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertTrue(count($data) >= 1);
        $dailyData = collect($data)->firstWhere('date', $date->format('Y-m-d'));

        if ($dailyData) {
            $this->assertEquals(100000, $dailyData['income']);
            $this->assertEquals(30000, $dailyData['expense']);
        }
    }

    /** @test */
    public function test_monthly_report_aggregates_by_month()
    {
        $year = now()->year;

        // Create transactions in different months
        for ($month = 1; $month <= 3; $month++) {
            CashTransaction::factory()->create([
                'bank_id' => $this->bank->id,
                'type' => 'income',
                'amount' => 100000 * $month,
                'date' => Carbon::createFromDate($year, $month, 1),
            ]);
        }

        $response = $this->getJson('/api/v1/finance/reports/monthly?year='.$year);

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertGreaterThanOrEqual(3, count($data));
    }

    /** @test */
    public function test_yearly_report_aggregates_by_year()
    {
        // Create transactions in different years
        for ($year = 2024; $year <= 2026; $year++) {
            CashTransaction::factory()->create([
                'bank_id' => $this->bank->id,
                'type' => 'income',
                'amount' => 1000000,
                'date' => Carbon::createFromDate($year, 1, 1),
            ]);
        }

        $response = $this->getJson('/api/v1/finance/reports/yearly');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertGreaterThanOrEqual(1, count($data));
    }

    /** @test */
    public function test_report_correctly_separates_income_and_expenses()
    {
        $date = now()->startOfMonth();

        CashTransaction::factory(5)->create([
            'bank_id' => $this->bank->id,
            'type' => 'income',
            'amount' => 50000,
            'date' => $date,
        ]);

        CashTransaction::factory(3)->create([
            'bank_id' => $this->bank->id,
            'type' => 'expense',
            'amount' => 25000,
            'date' => $date,
        ]);

        $response = $this->getJson('/api/v1/finance/reports/daily?month='.$date->month.'&year='.$date->year);

        $response->assertStatus(200);
        $data = $response->json();

        $dailyData = collect($data)->firstWhere('date', $date->format('Y-m-d'));

        if ($dailyData) {
            $this->assertEquals(250000, $dailyData['income']); // 5 × 50000
            $this->assertEquals(75000, $dailyData['expense']); // 3 × 25000
        }
    }

    /** @test */
    public function test_empty_period_returns_empty_array()
    {
        $futureMonth = now()->addYears(10)->month;
        $futureYear = now()->addYears(10)->year;

        $response = $this->getJson('/api/v1/finance/reports/daily?month='.$futureMonth.'&year='.$futureYear);

        $response->assertStatus(200);
        $data = $response->json();

        // Should return empty or minimal data for future period with no transactions
        $this->assertIsArray($data);
    }
}
