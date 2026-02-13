<?php

use App\Http\Controllers\Api\V1\ApplePayController;
use App\Http\Controllers\Api\V1\B2BOrderController;
use App\Http\Controllers\Api\V1\BalanceController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\CountryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PackageController;
use App\Http\Controllers\Api\Webhooks\CryptomusWebhookController;
use App\Http\Controllers\Api\Webhooks\PayrexxWebhookController;
use App\Http\Controllers\Api\Webhooks\PayseraWebhookController;
use App\Http\Controllers\Api\Webhooks\ProcardWebhookController;
use App\Http\Controllers\Api\Webhooks\StripeWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::get('packages', [PackageController::class, 'index']);
    Route::get('packages/popular', [PackageController::class, 'popular']);
    Route::get('packages/{package}', [PackageController::class, 'show']);

    Route::get('countries', [CountryController::class, 'index']);
    Route::get('countries/popular', [CountryController::class, 'popular']);
    Route::get('countries/regions', [CountryController::class, 'regions']);
    Route::get('countries/{country}/packages', [PackageController::class, 'byCountry']);

    Route::get('health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    Route::prefix('apple-pay')->group(function () {
        Route::post('validate', [ApplePayController::class, 'validate']);
        Route::post('process', [ApplePayController::class, 'process']);
    });

    Route::prefix('webhooks')->group(function () {
        Route::post('stripe', [StripeWebhookController::class, 'handle'])->name('webhooks.stripe');
        Route::post('payrexx', [PayrexxWebhookController::class, 'handle'])->name('webhooks.payrexx');
        Route::post('paysera', [PayseraWebhookController::class, 'handle'])->name('webhooks.paysera');
        Route::post('procard', [ProcardWebhookController::class, 'handle'])->name('webhooks.procard');
        Route::post('cryptomus', [CryptomusWebhookController::class, 'handle'])->name('webhooks.cryptomus');
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('coupons/validate', [\App\Http\Controllers\Public\CouponController::class, 'validate'])->name('coupons.validate');
        Route::get('coupons/applicable', [\App\Http\Controllers\Public\CouponController::class, 'applicable'])->name('coupons.applicable');
        Route::post('coupons/apply', [\App\Http\Controllers\Public\CouponController::class, 'apply'])->name('coupons.apply');

        Route::post('checkout', [CheckoutController::class, 'store']);
        Route::get('checkout/{orderUuid}/verify', [CheckoutController::class, 'verify']);
        Route::get('checkout/{orderUuid}/status', [CheckoutController::class, 'status']);

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::get('orders/{order}/esim', [OrderController::class, 'esimDetails']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);

        Route::prefix('b2b')->group(function () {
            Route::get('balance', [BalanceController::class, 'show']);
            Route::get('balance/transactions', [BalanceController::class, 'transactions']);

            Route::post('orders', [B2BOrderController::class, 'store']);
        });
    });
});
