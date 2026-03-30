<?php

namespace App\Console\Commands;

use App\Models\Bank;
use App\Models\CashTransaction;
use App\Models\Debt;
use App\Models\DebtPayment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncPaidInvoicesCommand extends Command
{
    protected $signature = 'invoices:sync-payments {--dry-run : Show what would be synced without making changes}';

    protected $description = 'Create payment records for old invoices marked as paid but missing DebtPayment entries';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Find paid invoices without any payment records
        $paidWithoutPayment = Debt::where('type', 'receivable')
            ->where('status', 'paid')
            ->whereDoesntHave('payments')
            ->get();

        $this->info('=== Sync Paid Invoices to Buku Kas ===');
        $this->info("Paid invoices without payment records: {$paidWithoutPayment->count()}");

        if ($paidWithoutPayment->isEmpty()) {
            $this->info('✅ All paid invoices already have payment records!');

            return 0;
        }

        // Get default bank (first bank)
        $bank = Bank::orderBy('id')->first();
        if (! $bank) {
            $this->error('❌ No bank found! Please create a bank account first.');

            return 1;
        }

        $this->info("Default bank: {$bank->name} (current balance: Rp ".number_format($bank->balance, 0, ',', '.').')');

        if ($dryRun) {
            $this->warn('🔍 DRY RUN — no changes will be made');
            $this->newLine();

            $totalAmount = 0;
            foreach ($paidWithoutPayment as $debt) {
                $amount = (float) $debt->amount;
                $totalAmount += $amount;
                $this->line("  📝 {$debt->kodeinvoice} | {$debt->client_name} | Rp ".number_format($amount, 0, ',', '.')." | {$debt->date->format('Y-m-d')}");
            }

            $this->newLine();
            $this->info('Total would be synced: Rp '.number_format($totalAmount, 0, ',', '.'));
            $this->info('New bank balance would be: Rp '.number_format((float) $bank->balance + $totalAmount, 0, ',', '.'));
            $this->newLine();
            $this->warn('Run without --dry-run to apply changes.');

            return 0;
        }

        // Confirm before proceeding
        $this->newLine();

        $synced = 0;
        $totalAmount = 0;
        $errors = 0;

        $this->output->progressStart($paidWithoutPayment->count());

        foreach ($paidWithoutPayment as $debt) {
            try {
                DB::transaction(function () use ($debt, $bank, &$totalAmount) {
                    $amount = (float) $debt->amount;
                    $paymentDate = $debt->date ?? now();

                    // 1. Create DebtPayment (this triggers model events automatically!)
                    //    Model event handles: bank balance + cash transaction + journal
                    $debt->payments()->create([
                        'bank_id' => $bank->id,
                        'date' => $paymentDate,
                        'amount' => $amount,
                        'note' => 'Sync otomatis — invoice lama yang sudah lunas',
                    ]);

                    $totalAmount += $amount;
                });

                $synced++;
            } catch (\Exception $e) {
                $errors++;
                $this->newLine();
                $this->error("  ❌ Error on {$debt->kodeinvoice}: {$e->getMessage()}");
            }

            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        $this->newLine();
        $this->info("✅ Synced: {$synced} invoices");
        if ($errors > 0) {
            $this->warn("⚠️  Errors: {$errors}");
        }
        $this->info('💰 Total amount synced: Rp '.number_format($totalAmount, 0, ',', '.'));

        // Show updated bank balance
        $bank->refresh();
        $this->info("🏦 Updated bank balance ({$bank->name}): Rp ".number_format($bank->balance, 0, ',', '.'));

        $cashCount = CashTransaction::count();
        $this->info("📖 Total cash transactions now: {$cashCount}");

        return 0;
    }
}
