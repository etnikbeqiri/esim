<?php

namespace App\Services\Competitors;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CompetitorPricingService
{
    private const CACHE_TTL_HOURS = 24;
    private const CACHE_KEY_PREFIX = 'competitor_pricing';

    public function __construct(
        private CompetitorFactory $factory,
    ) {}

    /**
     * Get all competitor plans for a given country ISO code.
     * Returns cached data (24h), fetches fresh if cache is empty.
     *
     * @return array<string, array> Keyed by competitor slug
     */
    public function getPlansForCountry(string $isoCode): array
    {
        $isoCode = strtoupper($isoCode);
        $result = [];

        foreach ($this->factory->slugs() as $slug) {
            $indexed = $this->getCachedIndex($slug);
            $result[$slug] = $indexed[$isoCode] ?? [];
        }

        return $result;
    }

    /**
     * Find competitor plans that match a package's GB and days exactly.
     *
     * @return array<string, array{exact: ?array, same_gb: array, same_days: array}>
     */
    public function findMatchingPlans(string $isoCode, int $dataMb, int $validityDays): array
    {
        $isoCode = strtoupper($isoCode);
        $dataGb = (int) round($dataMb / 1024);
        $result = [];

        foreach ($this->factory->slugs() as $slug) {
            $indexed = $this->getCachedIndex($slug);
            $countryPlans = $indexed[$isoCode] ?? [];
            $competitor = $this->factory->make($slug);

            $result[$slug] = [
                'competitor' => $slug,
                'display_name' => $competitor->getDisplayName(),
                'currency' => $competitor->getCurrency(),
                ...$this->matchPlans($countryPlans, $dataGb, $validityDays),
            ];
        }

        return $result;
    }

    /**
     * Bulk-match competitor pricing for a collection of packages.
     * Efficient: loads the full index once, then matches in memory.
     *
     * @param  Collection  $packages  Collection of Package models (with country relation loaded)
     * @return array<int, array> Keyed by package ID
     */
    public function matchForPackages(Collection $packages): array
    {
        // Pre-load all competitor indexes once
        $indexes = [];
        $competitors = [];
        foreach ($this->factory->slugs() as $slug) {
            $indexes[$slug] = $this->getCachedIndex($slug);
            $competitor = $this->factory->make($slug);
            $competitors[$slug] = [
                'display_name' => $competitor->getDisplayName(),
                'currency' => $competitor->getCurrency(),
            ];
        }

        $result = [];

        foreach ($packages as $package) {
            $isoCode = strtoupper($package->country->iso_code ?? '');
            $dataGb = (int) round($package->data_mb / 1024);
            $validityDays = $package->validity_days;

            $packageMatches = [];

            foreach ($indexes as $slug => $indexed) {
                $countryPlans = $indexed[$isoCode] ?? [];

                $packageMatches[$slug] = [
                    'competitor' => $slug,
                    'display_name' => $competitors[$slug]['display_name'],
                    'currency' => $competitors[$slug]['currency'],
                    ...$this->matchPlans($countryPlans, $dataGb, $validityDays),
                ];
            }

            $result[$package->id] = $packageMatches;
        }

        return $result;
    }

    /**
     * Core matching logic: find exact, same_gb, same_days plans.
     * Prioritizes country-specific plans over regional ones for exact matches.
     */
    private function matchPlans(array $countryPlans, int $dataGb, int $validityDays): array
    {
        $exactCountry = null;  // Country-specific exact match (preferred)
        $exactRegional = null; // Regional exact match (fallback)
        $sameGb = [];
        $sameDays = [];

        foreach ($countryPlans as $plan) {
            $planGb = $plan['data_gb'];
            $planDays = $plan['duration_days'];
            $isRegional = $plan['is_regional'] ?? false;

            if ($planGb === $dataGb && $planDays === $validityDays) {
                // Exact match: prefer country-specific over regional
                if (! $isRegional) {
                    $exactCountry = $plan;
                } elseif ($exactRegional === null || $plan['price'] < $exactRegional['price']) {
                    $exactRegional = $plan;
                }
            } elseif ($planGb === $dataGb) {
                $sameGb[] = $plan;
            } elseif ($planDays === $validityDays) {
                $sameDays[] = $plan;
            }
        }

        // Use country-specific exact match if available, otherwise regional
        $exact = $exactCountry ?? $exactRegional;

        // If we picked country-specific but there was also a regional exact, add it to same_gb as extra info
        if ($exactCountry && $exactRegional) {
            $sameGb[] = $exactRegional;
        }

        // Sort alternatives: country-specific first, then by price
        $sortFn = function ($a, $b) {
            $aRegional = $a['is_regional'] ?? false;
            $bRegional = $b['is_regional'] ?? false;
            if ($aRegional !== $bRegional) {
                return $aRegional ? 1 : -1;
            }
            return $a['price'] <=> $b['price'];
        };

        usort($sameGb, $sortFn);
        usort($sameDays, $sortFn);

        return [
            'exact' => $exact,
            'same_gb' => $sameGb,
            'same_days' => $sameDays,
        ];
    }

    /**
     * Force refresh cache for a specific competitor (or all).
     */
    public function refreshCache(?string $slug = null): void
    {
        $slugs = $slug ? [$slug] : $this->factory->slugs();

        foreach ($slugs as $s) {
            Cache::forget($this->cacheKey($s));
            $this->getCachedIndex($s);
        }
    }

    /**
     * Get cache status for all competitors.
     */
    public function getCacheStatus(): array
    {
        $status = [];

        foreach ($this->factory->slugs() as $slug) {
            $key = $this->cacheKey($slug);
            $status[$slug] = [
                'slug' => $slug,
                'display_name' => $this->factory->make($slug)->getDisplayName(),
                'cached' => Cache::has($key),
            ];
        }

        return $status;
    }

    /**
     * Get the country-indexed plan data from cache, fetching fresh if needed.
     * Structure: ['US' => [plan1, plan2], 'DE' => [plan3], ...]
     */
    private function getCachedIndex(string $slug): array
    {
        $key = $this->cacheKey($slug);

        return Cache::remember($key, now()->addHours(self::CACHE_TTL_HOURS), function () use ($slug) {
            Log::info("Fetching fresh competitor pricing data", ['competitor' => $slug]);

            $competitor = $this->factory->make($slug);
            $plans = $competitor->fetchPlans();

            return $this->buildCountryIndex($plans);
        });
    }

    /**
     * Normalize competitor destination codes to match our iso_codes.
     * Competitors use different naming: Thirr uses "EUB", ViaeSIM uses "EN-EUROPE", etc.
     * Our packages use standard iso_codes like "EU".
     */
    private const DESTINATION_ALIASES = [
        // ViaeSIM naming
        'EN-EUROPE' => 'EU',
        'NORTH-AMERICA' => 'NA',
        'LATIN-AMERICA' => 'LATAM',
        'MIDDLE-EAST-AFRICA' => 'MEA',
        'GLOBAL-PACKAGE' => 'GLOBAL',
        // Thirr naming
        'EUB' => 'EU',
        'EUXXL' => 'EU',
    ];

    /**
     * Index plans by country ISO code for fast lookups.
     * Each plan appears under every country it covers.
     * Regional plans are also indexed by their destination code (e.g., EUB, EU, EUXXL)
     * so they can be matched against regional package iso_codes.
     */
    private function buildCountryIndex(Collection $plans): array
    {
        $index = [];

        foreach ($plans as $plan) {
            $planArray = $plan->toArray();

            // Index by each covered country code
            foreach ($plan->countryCodes as $code) {
                $code = strtoupper($code);
                $index[$code][] = $planArray;
            }

            // Also index regional plans by destination code AND its alias
            if ($plan->isRegional) {
                $destCode = strtoupper($plan->destinationCode);
                $index[$destCode][] = $planArray;

                // Also index under the normalized alias (e.g., EN-EUROPE -> EU)
                $alias = self::DESTINATION_ALIASES[$destCode] ?? null;
                if ($alias && $alias !== $destCode) {
                    $index[$alias][] = $planArray;
                }
            }
        }

        return $index;
    }

    private function cacheKey(string $slug): string
    {
        return self::CACHE_KEY_PREFIX . ':' . $slug;
    }
}
