<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SyncUserRoles extends Command
{
    protected $signature = 'users:sync-roles';

    protected $description = 'Sync Spatie roles from legacy role column for all users';

    public function handle(): int
    {
        $users = User::all();
        $fixed = 0;

        foreach ($users as $user) {
            $legacyRole = strtoupper($user->role ?? '');
            $currentSpatie = $user->getRoleNames();

            if ($legacyRole === 'ADMIN' && ! $currentSpatie->contains('Admin')) {
                $user->syncRoles(['Admin']);
                $this->line("Fixed Admin: {$user->email}");
                $fixed++;
            } elseif (! $currentSpatie->contains('User')) {
                $user->syncRoles(['User']);
                $this->line("Fixed User: {$user->email}");
                $fixed++;
            }
        }

        $this->info("Done. Fixed {$fixed} users.");

        return 0;
    }
}
