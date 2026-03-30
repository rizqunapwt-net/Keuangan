<?php

namespace App\Console\Commands;

use App\Models\Contact;
use App\Models\Debt;
use Illuminate\Console\Command;

class SyncInvoiceContactsCommand extends Command
{
    protected $signature = 'contacts:sync-from-invoices';
    protected $description = 'Add all unique client names from invoices to contacts table';

    public function handle(): int
    {
        $clients = Debt::where('type', 'receivable')
            ->whereNotNull('client_name')
            ->where('client_name', '!=', '')
            ->distinct()
            ->pluck('client_name')
            ->unique()
            ->values();

        $existingNames = Contact::whereNull('deleted_at')
            ->pluck('name')
            ->map(fn($n) => strtolower(trim($n)));

        $missing = $clients->filter(fn($c) => !$existingNames->contains(strtolower(trim($c))));

        $this->info("Total unique clients in invoices: {$clients->count()}");
        $this->info("Already in contacts: " . ($clients->count() - $missing->count()));
        $this->info("Need to add: {$missing->count()}");

        if ($missing->isEmpty()) {
            $this->info('✅ All clients already in contacts!');
            return 0;
        }

        $added = 0;
        foreach ($missing as $name) {
            $name = trim($name);
            if (empty($name) || $name === '-' || $name === 'Umum') continue;

            Contact::create([
                'name' => $name,
                'type' => 'customer',
                'created_by' => 1,
            ]);
            $this->line("  ✅ {$name}");
            $added++;
        }

        $this->newLine();
        $this->info("Done! Added {$added} new contacts.");
        return 0;
    }
}
