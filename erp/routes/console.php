<?php

use App\Console\Commands\AuditExportCommand;
use App\Console\Commands\ContractsExpireCommand;
use App\Console\Commands\ContractsNotifyExpiringCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(ContractsExpireCommand::class)
    ->dailyAt('00:10')
    ->withoutOverlapping();

Schedule::command(ContractsNotifyExpiringCommand::class)
    ->dailyAt('08:00')
    ->withoutOverlapping();

Schedule::command(AuditExportCommand::class)
    ->monthlyOn(1, '00:20')
    ->withoutOverlapping();
