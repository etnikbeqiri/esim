<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Services\CurrencyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function __construct(
        private CurrencyService $currencyService
    ) {}

    public function index(): Response
    {
        $currencies = Currency::orderBy('is_default', 'desc')
            ->orderBy('code')
            ->get();

        $defaultCurrency = $currencies->firstWhere('is_default', true);

        return Inertia::render('admin/currencies/index', [
            'currencies' => $currencies,
            'defaultCurrency' => $defaultCurrency,
        ]);
    }

    public function updateRates(): RedirectResponse
    {
        $result = $this->currencyService->updateExchangeRates();

        if ($result['success']) {
            return back()->with('success', "Exchange rates updated successfully. {$result['updated']} currencies updated.");
        }

        return back()->with('error', 'Failed to update exchange rates: ' . implode(', ', $result['errors']));
    }

    public function toggleActive(Currency $currency): RedirectResponse
    {
        // Don't allow deactivating the default currency
        if ($currency->is_default && $currency->is_active) {
            return back()->with('error', 'Cannot deactivate the default currency.');
        }

        $currency->update(['is_active' => !$currency->is_active]);

        return back()->with('success', "Currency {$currency->code} " . ($currency->is_active ? 'activated' : 'deactivated') . '.');
    }

    public function setDefault(Currency $currency): RedirectResponse
    {
        // Remove default from all currencies
        Currency::where('is_default', true)->update(['is_default' => false]);

        // Set new default
        $currency->update([
            'is_default' => true,
            'is_active' => true,
        ]);

        return back()->with('success', "{$currency->code} is now the default system currency.");
    }
}
