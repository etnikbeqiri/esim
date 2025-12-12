<?php

namespace App\Services;

use App\Models\Currency;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    private const CACHE_KEY = 'currencies';
    private const CACHE_TTL = 3600; // 1 hour

    public function getDefaultCurrency(): Currency
    {
        return $this->getCurrencies()->firstWhere('is_default', true)
            ?? Currency::where('code', 'EUR')->firstOrFail();
    }

    public function getCurrency(string $code): ?Currency
    {
        return $this->getCurrencies()->firstWhere('code', strtoupper($code));
    }

    public function getCurrencies()
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Currency::where('is_active', true)->get();
        });
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Convert amount from source currency to EUR
     */
    public function convertToEur(float $amount, string $fromCurrencyCode): float
    {
        $currency = $this->getCurrency($fromCurrencyCode);

        if (!$currency) {
            Log::warning("Currency not found: {$fromCurrencyCode}, using 1:1 rate");
            return $amount;
        }

        return $currency->convertToEur($amount);
    }

    /**
     * Convert amount from EUR to target currency
     */
    public function convertFromEur(float $amountEur, string $toCurrencyCode): float
    {
        $currency = $this->getCurrency($toCurrencyCode);

        if (!$currency) {
            Log::warning("Currency not found: {$toCurrencyCode}, using 1:1 rate");
            return $amountEur;
        }

        return $currency->convertFromEur($amountEur);
    }

    /**
     * Convert between any two currencies
     */
    public function convert(float $amount, string $fromCode, string $toCode): float
    {
        if ($fromCode === $toCode) {
            return $amount;
        }

        // Convert to EUR first, then to target
        $amountEur = $this->convertToEur($amount, $fromCode);
        return $this->convertFromEur($amountEur, $toCode);
    }

    /**
     * Format amount with currency symbol
     */
    public function format(float $amount, string $currencyCode): string
    {
        $currency = $this->getCurrency($currencyCode);
        $symbol = $currency?->symbol ?? $currencyCode;

        return $symbol . number_format($amount, 2);
    }

    /**
     * Update exchange rates from Frankfurter API
     * Uses https://api.frankfurter.dev
     */
    public function updateExchangeRates(): array
    {
        $result = [
            'success' => false,
            'updated' => 0,
            'errors' => [],
        ];

        try {
            // Fetch rates with EUR as base (our system default)
            $response = Http::timeout(10)->get('https://api.frankfurter.dev/v1/latest', [
                'base' => 'EUR',
            ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch exchange rates', ['status' => $response->status()]);
                $result['errors'][] = 'Failed to fetch rates from API';
                return $result;
            }

            $data = $response->json();
            $rates = $data['rates'] ?? [];

            // EUR to EUR is always 1
            $rates['EUR'] = 1.0;

            foreach ($rates as $code => $rate) {
                // Rate is EUR to X, we need X to EUR
                $rateToEur = $rate > 0 ? 1 / $rate : 1;

                $updated = Currency::where('code', $code)->update([
                    'exchange_rate_to_eur' => round($rateToEur, 6),
                    'rate_updated_at' => now(),
                ]);

                if ($updated) {
                    $result['updated']++;
                }
            }

            $this->clearCache();

            Log::info('Exchange rates updated successfully', ['updated' => $result['updated']]);
            $result['success'] = true;
            return $result;

        } catch (\Exception $e) {
            Log::error('Error updating exchange rates', ['error' => $e->getMessage()]);
            $result['errors'][] = $e->getMessage();
            return $result;
        }
    }

    /**
     * Get exchange rate for a currency to EUR
     */
    public function getExchangeRate(string $currencyCode): float
    {
        $currency = $this->getCurrency($currencyCode);
        return $currency?->exchange_rate_to_eur ?? 1.0;
    }
}
