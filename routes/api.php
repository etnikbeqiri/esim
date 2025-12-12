<?php

use App\Http\Controllers\Api\V1\B2BOrderController;
use App\Http\Controllers\Api\V1\BalanceController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\CountryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PackageController;
use App\Http\Controllers\Api\Webhooks\PayrexxWebhookController;
use App\Http\Controllers\Api\Webhooks\StripeWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| eSIM Backend API v1
| All routes prefixed with /api/v1
|
*/

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Routes
    |--------------------------------------------------------------------------
    */

    // Packages
    Route::get('packages', [PackageController::class, 'index']);
    Route::get('packages/popular', [PackageController::class, 'popular']);
    Route::get('packages/{package}', [PackageController::class, 'show']);

    // Countries
    Route::get('countries', [CountryController::class, 'index']);
    Route::get('countries/popular', [CountryController::class, 'popular']);
    Route::get('countries/regions', [CountryController::class, 'regions']);
    Route::get('countries/{country}/packages', [PackageController::class, 'byCountry']);

    // Health check
    Route::get('health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | Webhooks (No Authentication)
    |--------------------------------------------------------------------------
    */

    Route::prefix('webhooks')->group(function () {
        Route::post('stripe', [StripeWebhookController::class, 'handle'])->name('webhooks.stripe');
        Route::post('payrexx', [PayrexxWebhookController::class, 'handle'])->name('webhooks.payrexx');
    });

    /*
    |--------------------------------------------------------------------------
    | Authenticated Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Checkout Routes (B2B uses balance, B2C uses Payrexx)
        |--------------------------------------------------------------------------
        */

        Route::post('checkout', [CheckoutController::class, 'store']);
        Route::get('checkout/{orderUuid}/verify', [CheckoutController::class, 'verify']);
        Route::get('checkout/{orderUuid}/status', [CheckoutController::class, 'status']);

        // Orders (all authenticated users)
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::get('orders/{order}/esim', [OrderController::class, 'esimDetails']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);

        /*
        |--------------------------------------------------------------------------
        | B2B Routes (Resellers with Balance)
        |--------------------------------------------------------------------------
        */

        Route::prefix('b2b')->group(function () {
            // Balance
            Route::get('balance', [BalanceController::class, 'show']);
            Route::get('balance/transactions', [BalanceController::class, 'transactions']);

            // B2B Orders (paid with balance)
            Route::post('orders', [B2BOrderController::class, 'store']);
        });
    });
});
