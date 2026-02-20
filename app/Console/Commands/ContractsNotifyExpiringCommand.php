<?php

namespace App\Console\Commands;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ContractsNotifyExpiringCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contracts:notify-expiring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim reminder kontrak expiring ke webhook n8n (H-30/H-7/H-1)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $webhookUrl = config('services.n8n.contract_expiry_webhook');

        if (! $webhookUrl) {
            $this->warn('N8N contract expiry webhook belum dikonfigurasi.');

            return self::SUCCESS;
        }

        $days = [30, 7, 1];
        $payload = [
            'triggered_at' => now()->toIso8601String(),
            'alerts' => [],
        ];

        foreach ($days as $day) {
            $date = now()->addDays($day)->toDateString();

            $contracts = Contract::query()
                ->with('book.author')
                ->where('status', ContractStatus::Approved)
                ->whereDate('end_date', $date)
                ->get()
                ->map(fn (Contract $contract): array => [
                    'contract_id' => $contract->id,
                    'book_id' => $contract->book_id,
                    'book_title' => $contract->book?->title,
                    'author_name' => $contract->book?->author?->name,
                    'end_date' => $contract->end_date?->toDateString(),
                    'remaining_days' => $day,
                ])
                ->values()
                ->all();

            if ($contracts !== []) {
                $payload['alerts'] = array_merge($payload['alerts'], $contracts);
            }
        }

        if ($payload['alerts'] === []) {
            $this->info('Tidak ada kontrak expiring untuk reminder hari ini.');

            return self::SUCCESS;
        }

        $response = Http::timeout(15)->post($webhookUrl, $payload);

        if (! $response->successful()) {
            $this->error('Gagal mengirim reminder ke n8n: '.$response->status());

            return self::FAILURE;
        }

        $this->info('Reminder kontrak expiring berhasil dikirim ke n8n.');

        return self::SUCCESS;
    }
}
