<?php

namespace App\Domain\Finance\Services;

use App\Models\Accounting\Account;
use App\Models\Accounting\Journal;
use App\Models\Accounting\JournalEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Laporan Laba Rugi (Profit & Loss)
     * Revenue (4-xxxx) - Expenses (5-xxxx)
     * Cached for 1 hour to improve performance
     */
    public function getProfitAndLoss(string $startDate, string $endDate): array
    {
        $cacheKey = "report.profit_loss.{$startDate}.{$endDate}";

        return Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate) {
            $revenues = $this->getBalancesByCodePattern('4%', $startDate, $endDate, 'credit');
            $expenses = $this->getBalancesByCodePattern('5%', $startDate, $endDate, 'debit');

            $totalRevenue = $revenues->sum('balance');
            $totalExpense = $expenses->sum('balance');

            return [
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
                'revenues' => [
                    'items' => $revenues,
                    'total' => (float) $totalRevenue,
                ],
                'expenses' => [
                    'items' => $expenses,
                    'total' => (float) $totalExpense,
                ],
                'net_profit' => (float) ($totalRevenue - $totalExpense),
            ];
        });
    }

    /**
     * Laporan Neraca (Balance Sheet)
     * Assets (1-xxxx), Liabilities (2-xxxx), Equity (3-xxxx)
     * Cached for 1 hour to improve performance
     */
    public function getBalanceSheet(string $asOfDate): array
    {
        $cacheKey = "report.balance_sheet.{$asOfDate}";

        return Cache::remember($cacheKey, 3600, function () use ($asOfDate) {
            // Assets: Normal balance Debit (Debit - Credit)
            $assets = $this->getBalancesByCodePattern('1%', null, $asOfDate, 'debit');

            // Liabilities: Normal balance Credit (Credit - Debit)
            $liabilities = $this->getBalancesByCodePattern('2%', null, $asOfDate, 'credit');

            // Equity: Normal balance Credit (Credit - Debit)
            $equity = $this->getBalancesByCodePattern('3%', null, $asOfDate, 'credit');

            // Hitung Laba Tahun Berjalan (Net Income s/d asOfDate)
            // Dimulai dari awal tahun sampai asOfDate
            $yearStart = Carbon::parse($asOfDate)->startOfYear()->toDateString();
            $pl = $this->getProfitAndLoss($yearStart, $asOfDate);
            $currentEarnings = $pl['net_profit'];

            $totalAssets = (float) $assets->sum('balance');
            $totalLiabilities = (float) $liabilities->sum('balance');
            $totalEquity = (float) ($equity->sum('balance') + $currentEarnings);

            return [
                'as_of' => $asOfDate,
                'assets' => [
                    'items' => $assets,
                    'total' => $totalAssets,
                ],
                'liabilities' => [
                    'items' => $liabilities,
                    'total' => $totalLiabilities,
                ],
                'equity' => [
                    'items' => $equity,
                    'current_earnings' => $currentEarnings,
                    'total' => $totalEquity,
                ],
                'is_balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
                'imbalance_amount' => (float) ($totalAssets - ($totalLiabilities + $totalEquity)),
            ];
        });
    }

    /**
     * Laporan Arus Kas (Cash Flow - Direct Method from Journals)
     * Mengambil semua transaksi yang melibatkan akun Kas/Bank (11xx)
     */
    public function getCashFlow(string $startDate, string $endDate): array
    {
        // Identifikasi akun Kas & Bank (biasanya 1-1xxx atau 11xx)
        $cashAccountIds = Account::where('type', 'asset')
            ->where(function ($q) {
                $q->where('code', 'like', '1-1%')
                    ->orWhere('code', 'like', '11%')
                    ->orWhere('name', 'ilike', '%kas%')
                    ->orWhere('name', 'ilike', '%bank%');
            })
            ->pluck('id')
            ->toArray();

        if (empty($cashAccountIds)) {
            return [
                'period' => ['start' => $startDate, 'end' => $endDate],
                'operating' => 0, 'investing' => 0, 'financing' => 0, 'net_change' => 0,
            ];
        }

        // 1. Operating Activities (Sale, Expenses, etc.)
        // Simplified: Journals with reference that includes 'SALE' or involve 4xxx/5xxx accounts
        $operating = $this->sumCashImpact($cashAccountIds, $startDate, $endDate, function ($query) {
            $query->whereHas('journal', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('reference', 'ilike', '%SALE%')
                        ->orWhere('reference', 'ilike', '%EXP%')
                        ->orWhere('description', 'ilike', '%penjualan%')
                        ->orWhere('description', 'ilike', '%biaya%');
                });
            });
        });

        // 2. Investing Activities (Asset purchase/sale)
        $investing = $this->sumCashImpact($cashAccountIds, $startDate, $endDate, function ($query) {
            $query->whereHas('journal', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('reference', 'ilike', '%ASSET%')
                        ->orWhere('description', 'ilike', '%pembelian aset%');
                });
            });
        });

        // 3. Financing Activities (Equity, Loans)
        $financing = $this->sumCashImpact($cashAccountIds, $startDate, $endDate, function ($query) {
            $query->whereHas('journal', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('reference', 'ilike', '%CAPITAL%')
                        ->orWhere('reference', 'ilike', '%LOAN%')
                        ->orWhere('description', 'ilike', '%modal%');
                });
            });
        });

        // Jika tidak terklasifikasi, masukkan ke Operating (Fallback)
        $totalCashIn = JournalEntry::whereIn('account_id', $cashAccountIds)
            ->where('type', 'debit')
            ->whereHas('journal', fn ($q) => $q->whereBetween('date', [$startDate, $endDate])->where('status', 'posted'))
            ->sum('amount');

        $totalCashOut = JournalEntry::whereIn('account_id', $cashAccountIds)
            ->where('type', 'credit')
            ->whereHas('journal', fn ($q) => $q->whereBetween('date', [$startDate, $endDate])->where('status', 'posted'))
            ->sum('amount');

        $netChange = $totalCashIn - $totalCashOut;

        // Adjust operating to capture unclassified
        $classified = $operating + $investing + $financing;
        $unclassified = $netChange - $classified;
        $operating += $unclassified;

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'operating' => (float) $operating,
            'investing' => (float) $investing,
            'financing' => (float) $financing,
            'net_change' => (float) $netChange,
        ];
    }

    /**
     * Helper to sum cash impact for a set of journal entries
     * Debit = Cash In (+), Credit = Cash Out (-)
     */
    private function sumCashImpact(array $cashAccountIds, string $start, string $end, callable $filter): float
    {
        $query = JournalEntry::whereIn('account_id', $cashAccountIds)
            ->whereHas('journal', function ($q) use ($start, $end) {
                $q->whereBetween('date', [$start, $end])->where('status', 'posted');
            });

        $filter($query);

        $results = $query->select(
            DB::raw("SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END) as net_impact")
        )->first();

        return (float) ($results->net_impact ?? 0);
    }

    /**
     * Get balances grouped by account based on code pattern
     * Uses the requirement: sum(debit - credit) for normal_balance = debit
     */
    private function getBalancesByCodePattern(string $pattern, ?string $start, string $end, string $normalBalance)
    {
        return Account::where('code', 'like', $pattern)
            ->withSum(['entries as total_balance' => function ($query) use ($start, $end, $normalBalance) {
                $query->whereHas('journal', function ($q) use ($start, $end) {
                    if ($start) {
                        $q->where('date', '>=', $start);
                    }
                    $q->where('date', '<=', $end)->where('status', 'posted');
                })
                    ->select(DB::raw($normalBalance === 'credit'
                        ? "COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0)"
                        : "COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END), 0)"
                    ));
            }], 'amount')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'code' => $a->code,
                'name' => $a->name,
                'type' => $a->type,
                'balance' => (float) ($a->total_balance ?? 0),
            ])
            ->filter(fn ($a) => abs($a['balance']) > 0.001)
            ->values();
    }
}
