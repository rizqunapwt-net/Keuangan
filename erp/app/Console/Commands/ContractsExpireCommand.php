<?php

namespace App\Console\Commands;

use App\Domain\Contracts\ContractService;
use Illuminate\Console\Command;

class ContractsExpireCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contracts:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ubah status kontrak approved yang sudah melewati end_date menjadi expired';

    /**
     * Execute the console command.
     */
    public function handle(ContractService $contractService): int
    {
        $updated = $contractService->expireApprovedContracts();

        $this->info("{$updated} kontrak diubah ke status expired.");

        return self::SUCCESS;
    }
}
