<?php

namespace App\Http\Middleware;

use App\Enums\PaymentProvider;
use App\Services\CurrencyService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $userData = null;

        if ($user) {
            $customer = $user->customer;
            $balance = $customer?->balance;
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'two_factor_enabled' => $user->two_factor_secret !== null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                // Role/type information
                'is_admin' => $user->isAdmin(),
                'is_b2b' => $customer?->isB2B() ?? false,
                'is_b2c' => $customer?->isB2C() ?? true,
                'customer_type' => $customer?->type?->value ?? 'b2c',
                'has_customer' => $customer !== null,
                // Balance for B2B users
                'balance' => $balance ? [
                    'available' => $balance->available_balance,
                    'reserved' => $balance->reserved,
                    'total' => $balance->balance,
                ] : null,
            ];
        }

        $currencyService = app(CurrencyService::class);
        $defaultCurrency = $currencyService->getDefaultCurrency();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $userData,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'impersonating' => session('impersonating_from') !== null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'currency' => [
                'code' => $defaultCurrency->code,
                'symbol' => $defaultCurrency->symbol,
                'name' => $defaultCurrency->name,
            ],
            'locale' => app()->getLocale(),
            'availableLocales' => [
                ['code' => 'en', 'name' => 'English', 'nativeName' => 'English'],
                ['code' => 'de', 'name' => 'German', 'nativeName' => 'Deutsch'],
                ['code' => 'sq', 'name' => 'Albanian', 'nativeName' => 'Shqip'],
            ],
            'contact' => [
                'supportEmail' => config('contact.support_email'),
                'legalEmail' => config('contact.legal_email'),
                'privacyEmail' => config('contact.privacy_email'),
                'phone' => config('contact.phone'),
                'whatsapp' => config('contact.whatsapp'),
            ],
            'payment' => [
                'providers' => PaymentProvider::activePublicProvidersArray(),
            ],
        ];
    }
}
