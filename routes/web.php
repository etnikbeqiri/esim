<?php

use App\Http\Controllers\EmailPreviewController;
use App\Http\Controllers\Public\ArticleController;
use App\Http\Controllers\Public\DeviceController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/preview-email', [EmailPreviewController::class, 'index'])->name('emails.preview');
Route::get('/preview-email/{template}', [EmailPreviewController::class, 'preview'])->name('emails.preview.template');

Route::get('/sitemap.xml', [SitemapController::class, '__invoke'])->name('sitemap');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/api/destinations/search', [HomeController::class, 'searchDestinations'])->name('api.destinations.search');
Route::get('/destinations', [HomeController::class, 'destinations'])->name('destinations');
Route::get('/destinations/{country}', [HomeController::class, 'country'])->name('destinations.country');
Route::get('/package/{package}', [HomeController::class, 'package'])->name('package.show');
Route::get('/how-it-works', [HomeController::class, 'howItWorks'])->name('how-it-works');
Route::get('/privacy', fn () => \Inertia\Inertia::render('public/privacy'))->name('privacy');
Route::get('/terms', fn () => \Inertia\Inertia::render('public/terms'))->name('terms');
Route::get('/refund', fn () => \Inertia\Inertia::render('public/refund'))->name('refund');
Route::get('/faq', fn () => \Inertia\Inertia::render('public/faq'))->name('faq');
Route::get('/help', fn () => \Inertia\Inertia::render('public/help'))->name('help');

Route::prefix('tickets')->name('tickets.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Public\TicketController::class, 'index'])->name('index');
    Route::post('/', [\App\Http\Controllers\Public\TicketController::class, 'store'])->name('store');
    Route::post('/lookup', [\App\Http\Controllers\Public\TicketController::class, 'lookup'])->name('lookup');
    Route::get('/{uuid}/{email}', [\App\Http\Controllers\Public\TicketController::class, 'show'])->name('show');
    Route::get('/{uuid}/{email}/stream', [\App\Http\Controllers\Public\TicketController::class, 'stream'])
        ->name('stream')
        ->withoutMiddleware('web');
    Route::post('/{uuid}/{email}/reply', [\App\Http\Controllers\Public\TicketController::class, 'reply'])->name('reply');
});

Route::get('/checkout/callback', [\App\Http\Controllers\Public\CheckoutController::class, 'callback'])->name('public.checkout.callback');
Route::get('/checkout/success/{order:uuid}', [\App\Http\Controllers\Public\CheckoutController::class, 'success'])->name('public.checkout.success');
Route::get('/checkout/{package}', [\App\Http\Controllers\Public\CheckoutController::class, 'show'])->name('public.checkout.show');
Route::post('/checkout/{package}', [\App\Http\Controllers\Public\CheckoutController::class, 'process'])->name('public.checkout.process');
Route::post('/api/v1/coupons/validate', [\App\Http\Controllers\Public\CouponController::class, 'validatePublic'])->name('public.coupons.validate');
Route::get('/api/v1/geo/detect', [\App\Http\Controllers\Public\GeoLocationController::class, 'detect'])->name('public.geo.detect');
Route::get('/api/v1/payment-methods', [\App\Http\Controllers\Public\PaymentMethodsController::class, 'index'])->name('public.payment-methods');
Route::get('/order/{order:uuid}', [\App\Http\Controllers\Public\CheckoutController::class, 'status'])->name('public.order.show');
Route::get('/order/{order:uuid}/status', [\App\Http\Controllers\Public\CheckoutController::class, 'status'])->name('public.order.status');
Route::get('/order/{order:uuid}/check', [\App\Http\Controllers\Public\CheckoutController::class, 'checkStatus'])->name('public.order.check');

Route::get('/blog', [ArticleController::class, 'index'])->name('blog.index');
Route::get('/blog/{article:slug}', [ArticleController::class, 'show'])->name('blog.show');

Route::get('/devices', [DeviceController::class, 'index'])->name('devices.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = request()->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('client.dashboard');
    })->name('dashboard');

    Route::post('stop-impersonating', [\App\Http\Controllers\Admin\CustomerController::class, 'stopImpersonating'])->name('stop-impersonating');

    Route::prefix('client')->name('client.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Client\DashboardController::class, 'index'])->name('dashboard');

        Route::get('packages', [\App\Http\Controllers\Client\PackageController::class, 'index'])->name('packages.index');
        Route::get('packages/{package}', [\App\Http\Controllers\Client\PackageController::class, 'show'])->name('packages.show');

        Route::get('checkout/callback', [\App\Http\Controllers\Client\CheckoutController::class, 'callback'])->name('checkout.callback');
        Route::get('checkout/{package}', [\App\Http\Controllers\Client\CheckoutController::class, 'show'])->name('checkout.show');
        Route::post('checkout/{package}', [\App\Http\Controllers\Client\CheckoutController::class, 'process'])->name('checkout.process');
        Route::get('checkout/success/{order}', [\App\Http\Controllers\Client\CheckoutController::class, 'success'])->name('checkout.success');
        Route::get('checkout/cancel', [\App\Http\Controllers\Client\CheckoutController::class, 'cancel'])->name('checkout.cancel');
        Route::get('checkout/status/{order}', [\App\Http\Controllers\Client\CheckoutController::class, 'status'])->name('checkout.status');

        Route::get('orders', [\App\Http\Controllers\Client\OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{uuid}', [\App\Http\Controllers\Client\OrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{uuid}/resend-esim', [\App\Http\Controllers\Client\OrderController::class, 'resendEsim'])->name('orders.resend-esim');

        Route::get('tickets', [\App\Http\Controllers\Client\TicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/create', [\App\Http\Controllers\Client\TicketController::class, 'create'])->name('tickets.create');
        Route::post('tickets', [\App\Http\Controllers\Client\TicketController::class, 'store'])->name('tickets.store');
        Route::get('tickets/{uuid}', [\App\Http\Controllers\Client\TicketController::class, 'show'])->name('tickets.show');
        Route::get('tickets/{uuid}/stream', [\App\Http\Controllers\Client\TicketController::class, 'stream'])->name('tickets.stream');
        Route::post('tickets/{uuid}/reply', [\App\Http\Controllers\Client\TicketController::class, 'reply'])->name('tickets.reply');

        Route::get('balance', [\App\Http\Controllers\Client\BalanceController::class, 'index'])->middleware('b2b')->name('balance.index');
        Route::post('balance/topup', [\App\Http\Controllers\Client\BalanceController::class, 'topUp'])->middleware('b2b')->name('balance.topup');
        Route::get('balance/topup/callback', [\App\Http\Controllers\Client\BalanceController::class, 'topUpCallback'])->middleware('b2b')->name('balance.topup.callback');

        Route::middleware('b2b')->group(function () {
            Route::get('invoices', [\App\Http\Controllers\Client\InvoiceController::class, 'index'])->name('invoices.index');
            Route::get('invoices/statement', [\App\Http\Controllers\Client\InvoiceController::class, 'statement'])->name('invoices.statement');
            Route::get('invoices/{invoice}', [\App\Http\Controllers\Client\InvoiceController::class, 'show'])->name('invoices.show');
            Route::get('invoices/{invoice}/download', [\App\Http\Controllers\Client\InvoiceController::class, 'download'])->name('invoices.download');
        });
    });

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        Route::get('providers', [\App\Http\Controllers\Admin\ProviderController::class, 'index'])->name('providers.index');
        Route::get('providers/create', [\App\Http\Controllers\Admin\ProviderController::class, 'create'])->name('providers.create');
        Route::post('providers', [\App\Http\Controllers\Admin\ProviderController::class, 'store'])->name('providers.store');
        Route::get('providers/{provider}', [\App\Http\Controllers\Admin\ProviderController::class, 'show'])->name('providers.show');
        Route::get('providers/{provider}/edit', [\App\Http\Controllers\Admin\ProviderController::class, 'edit'])->name('providers.edit');
        Route::put('providers/{provider}', [\App\Http\Controllers\Admin\ProviderController::class, 'update'])->name('providers.update');
        Route::delete('providers/{provider}', [\App\Http\Controllers\Admin\ProviderController::class, 'destroy'])->name('providers.destroy');

        Route::get('countries', [\App\Http\Controllers\Admin\CountryController::class, 'index'])->name('countries.index');
        Route::post('countries/bulk-activate', [\App\Http\Controllers\Admin\CountryController::class, 'bulkActivate'])->name('countries.bulk-activate');
        Route::post('countries/bulk-deactivate', [\App\Http\Controllers\Admin\CountryController::class, 'bulkDeactivate'])->name('countries.bulk-deactivate');
        Route::post('countries/sync-disabled', [\App\Http\Controllers\Admin\CountryController::class, 'syncDisabledCountries'])->name('countries.sync-disabled');
        Route::get('countries/{country}', [\App\Http\Controllers\Admin\CountryController::class, 'show'])->name('countries.show');
        Route::post('countries/{country}/toggle-active', [\App\Http\Controllers\Admin\CountryController::class, 'toggleActive'])->name('countries.toggle-active');

        Route::get('packages', [\App\Http\Controllers\Admin\PackageController::class, 'index'])->name('packages.index');
        Route::post('packages/bulk-activate', [\App\Http\Controllers\Admin\PackageController::class, 'bulkActivate'])->name('packages.bulk-activate');
        Route::post('packages/bulk-deactivate', [\App\Http\Controllers\Admin\PackageController::class, 'bulkDeactivate'])->name('packages.bulk-deactivate');
        Route::get('packages/{package}', [\App\Http\Controllers\Admin\PackageController::class, 'show'])->name('packages.show');
        Route::get('packages/{package}/edit', [\App\Http\Controllers\Admin\PackageController::class, 'edit'])->name('packages.edit');
        Route::put('packages/{package}', [\App\Http\Controllers\Admin\PackageController::class, 'update'])->name('packages.update');
        Route::post('packages/{package}/toggle-featured', [\App\Http\Controllers\Admin\PackageController::class, 'toggleFeatured'])->name('packages.toggle-featured');
        Route::post('packages/{package}/toggle-active', [\App\Http\Controllers\Admin\PackageController::class, 'toggleActive'])->name('packages.toggle-active');

        Route::get('orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/retry', [\App\Http\Controllers\Admin\OrderController::class, 'retry'])->name('orders.retry');
        Route::post('orders/{order}/fail', [\App\Http\Controllers\Admin\OrderController::class, 'fail'])->name('orders.fail');
        Route::post('orders/{order}/sync-esim', [\App\Http\Controllers\Admin\OrderController::class, 'syncEsim'])->name('orders.sync-esim');

        Route::get('customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index'])->name('customers.index');
        Route::get('customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'show'])->name('customers.show');
        Route::get('customers/{customer}/edit', [\App\Http\Controllers\Admin\CustomerController::class, 'edit'])->name('customers.edit');
        Route::put('customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'update'])->name('customers.update');
        Route::post('customers/{customer}/add-balance', [\App\Http\Controllers\Admin\CustomerController::class, 'addBalance'])->name('customers.add-balance');
        Route::put('customers/{customer}/user', [\App\Http\Controllers\Admin\CustomerController::class, 'updateUser'])->name('customers.update-user');
        Route::post('customers/{customer}/reset-password', [\App\Http\Controllers\Admin\CustomerController::class, 'resetPassword'])->name('customers.reset-password');
        Route::post('customers/{customer}/impersonate', [\App\Http\Controllers\Admin\CustomerController::class, 'impersonate'])->name('customers.impersonate');

        Route::get('sync-jobs', [\App\Http\Controllers\Admin\SyncJobController::class, 'index'])->name('sync-jobs.index');
        Route::post('sync-jobs', [\App\Http\Controllers\Admin\SyncJobController::class, 'store'])->name('sync-jobs.store');

        Route::get('currencies', [\App\Http\Controllers\Admin\CurrencyController::class, 'index'])->name('currencies.index');
        Route::post('currencies/update-rates', [\App\Http\Controllers\Admin\CurrencyController::class, 'updateRates'])->name('currencies.update-rates');
        Route::post('currencies/{currency}/toggle', [\App\Http\Controllers\Admin\CurrencyController::class, 'toggleActive'])->name('currencies.toggle');
        Route::post('currencies/{currency}/set-default', [\App\Http\Controllers\Admin\CurrencyController::class, 'setDefault'])->name('currencies.set-default');

        Route::get('articles', [\App\Http\Controllers\Admin\ArticleController::class, 'index'])->name('articles.index');
        Route::get('articles/create', [\App\Http\Controllers\Admin\ArticleController::class, 'create'])->name('articles.create');
        Route::post('articles', [\App\Http\Controllers\Admin\ArticleController::class, 'store'])->name('articles.store');
        Route::post('articles/upload-image', [\App\Http\Controllers\Admin\ArticleController::class, 'uploadImage'])->name('articles.upload-image');
        Route::get('articles/{article:id}', [\App\Http\Controllers\Admin\ArticleController::class, 'show'])->name('articles.show');
        Route::get('articles/{article:id}/edit', [\App\Http\Controllers\Admin\ArticleController::class, 'edit'])->name('articles.edit');
        Route::put('articles/{article:id}', [\App\Http\Controllers\Admin\ArticleController::class, 'update'])->name('articles.update');
        Route::delete('articles/{article:id}', [\App\Http\Controllers\Admin\ArticleController::class, 'destroy'])->name('articles.destroy');
        Route::post('articles/{article:id}/toggle-publish', [\App\Http\Controllers\Admin\ArticleController::class, 'togglePublish'])->name('articles.toggle-publish');

        Route::get('invoices/generate', [\App\Http\Controllers\Admin\InvoiceController::class, 'generate'])->name('invoices.generate');
        Route::post('invoices/generate', [\App\Http\Controllers\Admin\InvoiceController::class, 'store'])->name('invoices.store');
        Route::get('invoices/search-customers', [\App\Http\Controllers\Admin\InvoiceController::class, 'searchCustomers'])->name('invoices.search-customers');
        Route::get('invoices/customers/{customer}/uninvoiced-orders', [\App\Http\Controllers\Admin\InvoiceController::class, 'uninvoicedOrders'])->name('invoices.uninvoiced-orders');
        Route::get('invoices/customers/{customer}/uninvoiced-transactions', [\App\Http\Controllers\Admin\InvoiceController::class, 'uninvoicedTransactions'])->name('invoices.uninvoiced-transactions');
        Route::get('invoices', [\App\Http\Controllers\Admin\InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('invoices/{invoice}', [\App\Http\Controllers\Admin\InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('invoices/{invoice}/download', [\App\Http\Controllers\Admin\InvoiceController::class, 'download'])->name('invoices.download');
        Route::post('invoices/{invoice}/void', [\App\Http\Controllers\Admin\InvoiceController::class, 'void'])->name('invoices.void');

        Route::get('tickets', [\App\Http\Controllers\Admin\TicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/{ticket}', [\App\Http\Controllers\Admin\TicketController::class, 'show'])->name('tickets.show');
        Route::get('tickets/{ticket}/stream', [\App\Http\Controllers\Admin\TicketController::class, 'stream'])->name('tickets.stream');
        Route::post('tickets/{ticket}/reply', [\App\Http\Controllers\Admin\TicketController::class, 'reply'])->name('tickets.reply');
        Route::post('tickets/{ticket}/status', [\App\Http\Controllers\Admin\TicketController::class, 'updateStatus'])->name('tickets.update-status');
        Route::post('tickets/{ticket}/assign', [\App\Http\Controllers\Admin\TicketController::class, 'assign'])->name('tickets.assign');
        Route::post('tickets/{ticket}/close', [\App\Http\Controllers\Admin\TicketController::class, 'close'])->name('tickets.close');
        Route::post('tickets/{ticket}/notify', [\App\Http\Controllers\Admin\TicketController::class, 'notify'])->name('tickets.notify');
        Route::delete('tickets/{ticket}', [\App\Http\Controllers\Admin\TicketController::class, 'destroy'])->name('tickets.destroy');

        Route::get('devices', [\App\Http\Controllers\Admin\DeviceController::class, 'index'])->name('devices.index');
        Route::post('devices', [\App\Http\Controllers\Admin\DeviceController::class, 'store'])->name('devices.store');
        Route::post('devices/bulk-delete', [\App\Http\Controllers\Admin\DeviceController::class, 'bulkDestroy'])->name('devices.bulk-destroy');
        Route::post('devices/bulk-toggle', [\App\Http\Controllers\Admin\DeviceController::class, 'bulkToggle'])->name('devices.bulk-toggle');
        Route::put('devices/{device}', [\App\Http\Controllers\Admin\DeviceController::class, 'update'])->name('devices.update');
        Route::delete('devices/{device}', [\App\Http\Controllers\Admin\DeviceController::class, 'destroy'])->name('devices.destroy');
        Route::post('devices/{device}/toggle', [\App\Http\Controllers\Admin\DeviceController::class, 'toggleActive'])->name('devices.toggle');

        Route::get('brands', [\App\Http\Controllers\Admin\BrandController::class, 'index'])->name('brands.index');
        Route::post('brands', [\App\Http\Controllers\Admin\BrandController::class, 'store'])->name('brands.store');
        Route::post('brands/bulk-delete', [\App\Http\Controllers\Admin\BrandController::class, 'bulkDestroy'])->name('brands.bulk-destroy');
        Route::post('brands/bulk-toggle', [\App\Http\Controllers\Admin\BrandController::class, 'bulkToggle'])->name('brands.bulk-toggle');
        Route::put('brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'update'])->name('brands.update');
        Route::delete('brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'destroy'])->name('brands.destroy');
        Route::post('brands/{brand}/toggle', [\App\Http\Controllers\Admin\BrandController::class, 'toggleActive'])->name('brands.toggle');

        Route::get('coupons', [\App\Http\Controllers\Admin\CouponController::class, 'index'])->name('coupons.index');
        Route::get('coupons/create', [\App\Http\Controllers\Admin\CouponController::class, 'create'])->name('coupons.create');
        Route::post('coupons', [\App\Http\Controllers\Admin\CouponController::class, 'store'])->name('coupons.store');
        Route::get('coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'show'])->name('coupons.show');
        Route::get('coupons/{coupon}/edit', [\App\Http\Controllers\Admin\CouponController::class, 'edit'])->name('coupons.edit');
        Route::put('coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'update'])->name('coupons.update');
        Route::delete('coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'destroy'])->name('coupons.destroy');
        Route::post('coupons/{coupon}/toggle', [\App\Http\Controllers\Admin\CouponController::class, 'toggleActive'])->name('coupons.toggle');
        Route::post('coupons/generate-bulk', [\App\Http\Controllers\Admin\CouponController::class, 'generateBulk'])->name('coupons.generate-bulk');
        Route::post('coupons/bulk-activate', [\App\Http\Controllers\Admin\CouponController::class, 'bulkActivate'])->name('coupons.bulk-activate');
        Route::post('coupons/bulk-deactivate', [\App\Http\Controllers\Admin\CouponController::class, 'bulkDeactivate'])->name('coupons.bulk-deactivate');
        Route::post('coupons/bulk-delete', [\App\Http\Controllers\Admin\CouponController::class, 'bulkDelete'])->name('coupons.bulk-delete');
    });
});

require __DIR__.'/settings.php';
