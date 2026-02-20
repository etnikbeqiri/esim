<?php

namespace App\Services\Competitors;

use App\Contracts\CompetitorContract;
use App\DTOs\CompetitorPlanData;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NinetyNineEsimCompetitor implements CompetitorContract
{
    private const COUNTRIES_URL = 'https://prodapi.99esim.com/api/global-package/fetch-all-countries';
    private const PACKAGES_URL = 'https://prodapi.99esim.com/api/v2/product/fetch-packages-by-country/';

    /** Max concurrent requests per batch to avoid overwhelming the API */
    private const BATCH_SIZE = 20;

    public function getSlug(): string
    {
        return '99esim';
    }

    public function getDisplayName(): string
    {
        return '99eSIM';
    }

    public function getCurrency(): string
    {
        return 'EUR';
    }

    public function fetchPlans(): Collection
    {
        $countries = $this->fetchCountries();

        if ($countries->isEmpty()) {
            return collect();
        }

        return $this->fetchAllPackages($countries);
    }

    private function fetchCountries(): Collection
    {
        $response = Http::timeout(30)
            ->connectTimeout(10)
            ->withHeaders([
                'accept' => '*/*',
                'content-type' => 'application/json',
                'origin' => 'https://www.99esim.com',
                'referer' => 'https://www.99esim.com/',
            ])
            ->get(self::COUNTRIES_URL);

        if (! $response->successful()) {
            Log::error('99eSIM countries API request failed', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
            ]);

            return collect();
        }

        $data = $response->json();

        if (! is_array($data)) {
            Log::warning('99eSIM countries API returned unexpected format');

            return collect();
        }

        return collect($data)->filter(fn ($c) => ! empty($c['slug']) && ! empty($c['country_code']));
    }

    /**
     * Fetch packages for all countries using batched concurrent requests.
     */
    private function fetchAllPackages(Collection $countries): Collection
    {
        $plans = collect();
        $batches = $countries->chunk(self::BATCH_SIZE);

        foreach ($batches as $batch) {
            $responses = Http::pool(function (Pool $pool) use ($batch) {
                foreach ($batch as $country) {
                    $pool->as($country['country_code'])
                        ->timeout(15)
                        ->connectTimeout(5)
                        ->withHeaders([
                            'accept' => '*/*',
                            'content-type' => 'application/json',
                            'origin' => 'https://www.99esim.com',
                            'referer' => 'https://www.99esim.com/',
                        ])
                        ->get(self::PACKAGES_URL . $country['slug']);
                }
            });

            foreach ($batch as $country) {
                $code = $country['country_code'];
                $response = $responses[$code] ?? null;

                if (! $response || ! $response->successful()) {
                    continue;
                }

                $json = $response->json();
                $packages = $json['global_packages'] ?? [];

                foreach ($packages as $package) {
                    $plan = $this->transformPackage($package, $country);

                    if ($plan) {
                        $plans->push($plan);
                    }
                }
            }
        }

        Log::info('99eSIM fetched plans', ['total' => $plans->count(), 'countries' => $countries->count()]);

        return $plans;
    }

    private function transformPackage(array $package, array $country): ?CompetitorPlanData
    {
        $durationDays = (int) ($package['validity'] ?? 0);
        $dataGb = $this->parseDataGb($package);
        $price = $this->parsePrice($package);

        if ($durationDays <= 0 || $price <= 0) {
            return null;
        }

        $countryCode = strtoupper($country['country_code']);
        $countryName = $country['country'] ?? 'Unknown';

        return new CompetitorPlanData(
            competitor: $this->getSlug(),
            planCode: (string) ($package['package_id'] ?? $package['id'] ?? ''),
            planName: trim($countryName . ' ' . ($package['converted_data'] ?? '') . ' ' . $durationDays . 'd'),
            price: $price,
            currency: $this->getCurrency(),
            dataGb: $dataGb,
            durationDays: $durationDays,
            destinationCode: $countryCode,
            destinationName: $countryName,
            countryCodes: [$countryCode],
            isRegional: false,
        );
    }

    /**
     * Parse data GB from converted_data field (e.g., "1.00 GB", "20.00 GB")
     * or from is_unlimited flag.
     */
    private function parseDataGb(array $package): int
    {
        if (! empty($package['is_unlimited'])) {
            return 0;
        }

        $raw = $package['converted_data'] ?? '';

        if (preg_match('/([\d.]+)\s*GB/i', $raw, $m)) {
            return (int) round((float) $m[1]);
        }

        return 0;
    }

    /**
     * Get EUR price from global_package_price or fall back to sell_price.
     */
    private function parsePrice(array $package): float
    {
        $priceData = $package['global_package_price'] ?? [];

        if (! empty($priceData['eur_price'])) {
            return (float) $priceData['eur_price'];
        }

        return (float) ($package['sell_price'] ?? 0);
    }
}
