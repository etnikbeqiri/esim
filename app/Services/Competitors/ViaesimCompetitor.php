<?php

namespace App\Services\Competitors;

use App\Contracts\CompetitorContract;
use App\DTOs\CompetitorPlanData;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ViaesimCompetitor implements CompetitorContract
{
    private const API_URL = 'https://viaesim.com/api/countries';

    public function getSlug(): string
    {
        return 'viaesim';
    }

    public function getDisplayName(): string
    {
        return 'ViaeSIM';
    }

    public function getCurrency(): string
    {
        return 'EUR';
    }

    public function fetchPlans(): Collection
    {
        $response = Http::timeout(30)
            ->connectTimeout(10)
            ->withHeaders([
                'accept' => 'application/json',
            ])
            ->get(self::API_URL);

        if (! $response->successful()) {
            Log::error('ViaeSIM API request failed', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
            ]);

            return collect();
        }

        $json = $response->json();

        if (! isset($json['packages']) || ! is_array($json['packages'])) {
            Log::warning('ViaeSIM API returned unexpected format', [
                'keys' => array_keys($json),
            ]);

            return collect();
        }

        return $this->transformPackages($json['packages']);
    }

    private function transformPackages(array $packages): Collection
    {
        $plans = collect();

        foreach ($packages as $package) {
            $dataGb = $this->parseDataGb($package['data_allowance_gb'] ?? '');
            $durationDays = (int) ($package['days'] ?? 0);
            $price = (float) ($package['price'] ?? 0);

            if ($durationDays <= 0 || $price <= 0) {
                continue;
            }

            $isRegional = $this->isKnownRegional($package);

            if ($isRegional) {
                // For known regional destinations, trust the countries[] array
                $countryCodes = [];
                $destination = $package['destination'] ?? [];
                foreach ($destination['countries'] ?? [] as $country) {
                    $slug = strtoupper($country['slug'] ?? '');
                    if (strlen($slug) === 2) {
                        $countryCodes[] = $slug;
                    }
                }
            } else {
                // For single-country destinations, use flag URL only (reliable)
                // ViaeSIM's countries[] array is buggy for single countries
                // (e.g., "China" lists DE, TR; "Dubai" lists AL, MK)
                $iso = $this->isoFromFlag($package);
                $countryCodes = $iso ? [$iso] : [];
            }

            if (empty($countryCodes)) {
                continue;
            }

            $destinationCode = $this->deriveDestinationCode($package, $countryCodes);
            $englishName = $this->resolveEnglishName($package);
            $packageLabel = $package['name'] ?? '';

            $plans->push(new CompetitorPlanData(
                competitor: $this->getSlug(),
                planCode: (string) ($package['id'] ?? ''),
                planName: trim($englishName . ' ' . $packageLabel),
                price: $price,
                currency: $this->getCurrency(),
                dataGb: $dataGb,
                durationDays: $durationDays,
                destinationCode: $destinationCode,
                destinationName: $englishName,
                countryCodes: $countryCodes,
                isRegional: $isRegional,
            ));
        }

        return $plans;
    }

    /**
     * Resolve the English name for a destination.
     * ViaeSIM returns Albanian names in country_name (e.g., "Gjermani", "Europë").
     * We derive English from: slug field or first country's English name.
     */
    private function resolveEnglishName(array $package): string
    {
        $destination = $package['destination'] ?? [];
        $isRegional = $this->isKnownRegional($package);

        // For known regionals: use first country's English name if it describes the region,
        // otherwise derive from slug
        // For single-country: always use slug (countries[] data is unreliable)
        if ($isRegional) {
            $countries = $destination['countries'] ?? [];
            // Regional destinations have many countries, slug is more descriptive
        }

        // Derive English name from slug
        // "germany" -> "Germany", "europe" -> "Europe", "north-america" -> "North America"
        $slug = $package['slug'] ?? $destination['slug'] ?? '';
        $slug = str_replace(['esim-', 'esim_'], '', $slug);

        if ($slug) {
            return ucwords(str_replace('-', ' ', $slug));
        }

        // Last resort: Albanian name
        return $package['country_name'] ?? 'Unknown';
    }

    /**
     * Parse data_allowance_gb which can be: "3", "10+5", "PA LIMIT" (unlimited)
     */
    private function parseDataGb(string $raw): int
    {
        $raw = trim($raw);

        // "PA LIMIT" = unlimited
        if (strtoupper($raw) === 'PA LIMIT' || stripos($raw, 'LIMIT') !== false) {
            return 0;
        }

        // "10+5" format = combined data (10+5=15)
        if (str_contains($raw, '+')) {
            $parts = explode('+', $raw);
            $total = 0;
            foreach ($parts as $part) {
                $total += (int) trim($part);
            }

            return $total;
        }

        return (int) $raw;
    }

    /**
     * Known multi-country/regional en_slugs from ViaeSIM.
     * Everything else is treated as a single-country destination.
     * ViaeSIM's countries[] array is unreliable for single-country destinations
     * (e.g., "China" lists DE, TR as sub-countries), so we only trust it for
     * known regional destinations.
     */
    /**
     * Slugs (slug or en_slug) that are genuinely multi-country regions.
     * ViaeSIM's countries[] data is buggy for single-country destinations
     * (e.g., "China" lists DE, TR; "Dubai" lists AL, MK, TR),
     * so we whitelist only the actual regional destinations.
     */
    private const REGIONAL_SLUGS = [
        'europe',
        'en-europe',
        'esim-asia',
        'esim-azia',
        'esim-global-package',
        'esim-north-america',
        'esim-amerika-e-veriut',
        'esim-latin-america',
        'esim-amerika-latine',
        'esim-middle-east-africa',
        'esim-lindja-e-mesme-afrika',
        'esim-caribbean',
        'esim-karaibe',
        'esim-africa',
        'esim-afrika',
        'esim-oqeania',
        'oceania',
        'esim-skitrip',
    ];

    /**
     * Determine if this destination is truly a multi-country region.
     */
    private function isKnownRegional(array $package): bool
    {
        $destination = $package['destination'] ?? [];
        $enSlug = strtolower($destination['en_slug'] ?? '');
        $slug = strtolower($destination['slug'] ?? '');

        return in_array($enSlug, self::REGIONAL_SLUGS, true)
            || in_array($slug, self::REGIONAL_SLUGS, true);
    }

    /**
     * Extract the single-country ISO code from the flag URL.
     * e.g., "https://flagcdn.com/w80/de.png" -> "DE"
     */
    private function isoFromFlag(array $package): ?string
    {
        $flagUrl = $package['flag_url'] ?? '';
        if (preg_match('/\/([a-z]{2})\.png$/', $flagUrl, $m)) {
            return strtoupper($m[1]);
        }

        return null;
    }

    /**
     * Derive a destination code for indexing.
     * For single countries: use the ISO code from flag URL (reliable).
     * For regions: use the English slug uppercased.
     */
    private function deriveDestinationCode(array $package, array $countryCodes): string
    {
        if (count($countryCodes) === 1) {
            return $countryCodes[0];
        }

        $destination = $package['destination'] ?? [];
        $enSlug = $destination['en_slug'] ?? $destination['slug'] ?? '';
        $code = strtoupper(str_replace('esim-', '', $enSlug));

        return $code ?: strtoupper($package['slug'] ?? 'UNKNOWN');
    }
}
