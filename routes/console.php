<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| Checkout expiration is now handled via Laravel Verbs events.
| When an order transitions to "awaiting_payment", the OrderAwaitingPayment
| event automatically schedules an ExpireCheckoutSession job with a delay.
|
| To run the scheduler in development: php artisan schedule:work
| In production, set up a cron job:
| * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
|
*/
