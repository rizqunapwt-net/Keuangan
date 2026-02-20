<?php

namespace App\Domain\Royalty;

use App\Enums\ContractStatus;
use App\Enums\RoyaltyStatus;
use App\Enums\SaleStatus;
use App\Models\Contract;
use App\Models\RoyaltyCalculation;
use App\Models\RoyaltyItem;
use App\Models\Sale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class RoyaltyCalculationService
{
    public function calculateForPeriod(string $periodMonth, User $user): Collection
    {
        $periodStart = Carbon::createFromFormat('Y-m', $periodMonth)->startOfMonth();
        $periodEnd = Carbon::createFromFormat('Y-m', $periodMonth)->endOfMonth();

        $sales = Sale::query()
            ->with(['book.author'])
            ->where('period_month', $periodMonth)
            ->where('status', SaleStatus::Completed)
            ->get();

        $grouped = $sales->groupBy(fn (Sale $sale) => $sale->book->author_id);

        return DB::transaction(function () use ($grouped, $periodMonth, $periodStart, $periodEnd, $user): Collection {
            $results = collect();

            foreach ($grouped as $authorId => $authorSales) {
                $calculation = RoyaltyCalculation::query()->firstOrNew([
                    'period_month' => $periodMonth,
                    'author_id' => $authorId,
                ]);

                if ($calculation->exists && in_array($calculation->status, [RoyaltyStatus::Finalized, RoyaltyStatus::Paid], true)) {
                    throw new ConflictHttpException("Royalti periode {$periodMonth} untuk author ini sudah difinalisasi/dibayar.");
                }

                $calculation->fill([
                    'status' => RoyaltyStatus::Draft,
                    'calculated_by' => $user->id,
                    'calculated_at' => now(),
                    'finalized_by' => null,
                    'finalized_at' => null,
                ])->save();

                $calculation->items()->delete();

                $totalAmount = 0;

                /** @var Sale $sale */
                foreach ($authorSales as $sale) {
                    $contract = Contract::query()
                        ->where('book_id', $sale->book_id)
                        ->where('status', ContractStatus::Approved)
                        ->whereDate('start_date', '<=', $periodEnd)
                        ->whereDate('end_date', '>=', $periodStart)
                        ->latest('start_date')
                        ->first();

                    if (! $contract) {
                        continue;
                    }

                    $amount = round((float) $sale->quantity * (float) $sale->net_price * ((float) $contract->royalty_percentage / 100), 2);

                    RoyaltyItem::create([
                        'royalty_calculation_id' => $calculation->id,
                        'sale_id' => $sale->id,
                        'book_id' => $sale->book_id,
                        'quantity' => $sale->quantity,
                        'net_price' => $sale->net_price,
                        'royalty_percentage' => $contract->royalty_percentage,
                        'amount' => $amount,
                    ]);

                    $totalAmount += $amount;
                }

                $calculation->update([
                    'total_amount' => $totalAmount,
                ]);

                $results->push($calculation->fresh(['author', 'items.sale', 'items.book']));
            }

            return $results;
        });
    }

    public function finalize(RoyaltyCalculation $calculation, User $user): RoyaltyCalculation
    {
        if ($calculation->status !== RoyaltyStatus::Draft) {
            throw new ConflictHttpException('Hanya perhitungan royalti berstatus draft yang dapat difinalisasi.');
        }

        $calculation->update([
            'status' => RoyaltyStatus::Finalized,
            'finalized_by' => $user->id,
            'finalized_at' => now(),
        ]);

        return $calculation->refresh();
    }
}
