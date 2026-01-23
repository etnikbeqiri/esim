<?php

use App\Jobs\Sync\SyncEsimUsageJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new SyncEsimUsageJob())
    ->cron('*/20 * * * *')
    ->withoutOverlapping()
    ->name('sync-esim-usage');
