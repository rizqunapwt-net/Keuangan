<?php

use App\Console\Commands\AuditExportCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(AuditExportCommand::class)
    ->monthlyOn(1, '00:20')
    ->withoutOverlapping();

Schedule::command(\App\Console\Commands\SyncOldInvoices::class)
    ->everyFiveMinutes()
    ->withoutOverlapping();
