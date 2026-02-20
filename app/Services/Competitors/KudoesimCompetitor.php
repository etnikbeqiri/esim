<?php

namespace App\Services\Competitors;

use App\Contracts\CompetitorContract;
use App\DTOs\CompetitorPlanData;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KudoesimCompetitor implements CompetitorContract
{
    private const API_URL = 'https://lxcjegsrypnhfrsidfme.supabase.co/functions/v1/packages';

    public function getSlug(): string
    {
        return 'kudoesim';
    }

    public function getDisplayName(): string
    {
        return 'KudoeSIM';
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
            Log::error('KudoeSIM API request failed', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
            ]);

            return collect();
        }

        $packages = $response->json();

        if (! is_array($packages)) {
            Log::warning('KudoeSIM API returned unexpected format');

            return collect();
        }

        return $this->transformPackages($packages);
    }

    private function transformPackages(array $packages): Collection
    {
        $plans = collect();

        foreach ($packages as $package) {
            $dataGb = $this->parseDataGb($package['data'] ?? '');
            $durationDays = $this->parseDays($package['validity'] ?? '');
            $price = (float) ($package['price'] ?? 0);

            if ($durationDays <= 0 || $price <= 0) {
                continue;
            }

            $coverage = array_map('strtoupper', $package['coverage'] ?? []);
            $isRegional = count($coverage) > 1;
            $countryCode = strtoupper($package['country_code'] ?? '');

            // For single-country plans, use coverage array or country_code
            if (! $isRegional) {
                $countryCodes = ! empty($coverage) ? $coverage : ($countryCode ? [$countryCode] : []);
            } else {
                // Regional: use coverage array but filter out the generic "EU" code
                $countryCodes = array_filter($coverage, fn ($c) => strlen($c) === 2);
            }

            if (empty($countryCodes)) {
                continue;
            }

            $englishName = $this->resolveEnglishName($package, $isRegional);
            $destinationCode = $isRegional ? strtoupper($countryCode) : $countryCodes[0];

            $plans->push(new CompetitorPlanData(
                competitor: $this->getSlug(),
                planCode: (string) ($package['id'] ?? ''),
                planName: trim($englishName . ' ' . $this->formatDataLabel($dataGb) . ' ' . $durationDays . 'd'),
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
     * Parse data from Albanian format.
     * Examples: "20+1 GB Falas", "3 GB", "10GB", "Pa limit", "120 GB", "50+5 GB Falas!"
     */
    private function parseDataGb(string $raw): int
    {
        $raw = trim($raw);

        // "Pa limit" = unlimited (Albanian for "No limit")
        if (stripos($raw, 'Pa limit') !== false) {
            return 0;
        }

        // "20+1 GB Falas" or "50+5 GB Falas!" format (bonus data, sum both)
        if (preg_match('/^(\d+)\s*\+\s*(\d+)/', $raw, $m)) {
            return (int) $m[1] + (int) $m[2];
        }

        // "10 GB", "10GB", "120 GB ", "50 GB / 365 Dite"
        if (preg_match('/([\d.]+)\s*GB/i', $raw, $m)) {
            return (int) round((float) $m[1]);
        }

        return 0;
    }

    /**
     * Parse validity days from Albanian format.
     * Examples: "60 Dite", "30 Dite", "7 Dite ", "30 days", "15", "365 Dite"
     */
    private function parseDays(string $raw): int
    {
        $raw = trim($raw);

        // Extract leading number from "60 Dite", "30 days", or just "15"
        if (preg_match('/^(\d+)/', $raw, $m)) {
            return (int) $m[1];
        }

        return 0;
    }

    /**
     * Albanian to English country name mapping for common names.
     * KudoeSIM returns Albanian names (Gjermani, Zvicer, SHBA, etc.)
     */
    private const ALBANIAN_TO_ENGLISH = [
        'gjermani' => 'Germany',
        'zvicer' => 'Switzerland',
        'shba' => 'United States',
        'greqi' => 'Greece',
        'turqi' => 'Turkey',
        'francë' => 'France',
        'france' => 'France',
        'itali' => 'Italy',
        'spanjë' => 'Spain',
        'spanje' => 'Spain',
        'austri' => 'Austria',
        'belgjikë' => 'Belgium',
        'belgjike' => 'Belgium',
        'holandë' => 'Netherlands',
        'holande' => 'Netherlands',
        'portugali' => 'Portugal',
        'suedi' => 'Sweden',
        'norvegji' => 'Norway',
        'danimarkë' => 'Denmark',
        'danimarke' => 'Denmark',
        'finlandë' => 'Finland',
        'finlande' => 'Finland',
        'irlandë' => 'Ireland',
        'irlande' => 'Ireland',
        'poloni' => 'Poland',
        'hungari' => 'Hungary',
        'rumani' => 'Romania',
        'kroaci' => 'Croatia',
        'bullgari' => 'Bulgaria',
        'sllovaki' => 'Slovakia',
        'slloveni' => 'Slovenia',
        'çeki' => 'Czech Republic',
        'ceki' => 'Czech Republic',
        'estoni' => 'Estonia',
        'letoni' => 'Latvia',
        'lituani' => 'Lithuania',
        'qipro' => 'Cyprus',
        'maltë' => 'Malta',
        'malte' => 'Malta',
        'luksemburg' => 'Luxembourg',
        'islandë' => 'Iceland',
        'islande' => 'Iceland',
        'shqipëri' => 'Albania',
        'shqiperi' => 'Albania',
        'kosovë' => 'Kosovo',
        'kosove' => 'Kosovo',
        'serbi' => 'Serbia',
        'maqedoni' => 'North Macedonia',
        'mal i zi' => 'Montenegro',
        'bosnjë' => 'Bosnia',
        'bosnje' => 'Bosnia',
        'ukrainë' => 'Ukraine',
        'ukraine' => 'Ukraine',
        'moldavi' => 'Moldova',
        'egjipt' => 'Egypt',
        'arabi saudite' => 'Saudi Arabia',
        'emiratet' => 'UAE',
        'japoni' => 'Japan',
        'kinë' => 'China',
        'kine' => 'China',
        'tajlandë' => 'Thailand',
        'tajlande' => 'Thailand',
        'vietnam' => 'Vietnam',
        'singapor' => 'Singapore',
        'brazil' => 'Brazil',
        'kanada' => 'Canada',
        'meksikë' => 'Mexico',
        'meksike' => 'Mexico',
        'europe + rajon' => 'Europe+ Region',
        'europë' => 'Europe',
        'europe' => 'Europe',
    ];

    private function resolveEnglishName(array $package, bool $isRegional): string
    {
        if ($isRegional) {
            $region = $package['region'] ?? '';
            $lower = mb_strtolower(trim($region));

            return self::ALBANIAN_TO_ENGLISH[$lower] ?? ucwords($region);
        }

        // For single-country, try the region/name field
        $name = $package['region'] ?? $package['name'] ?? '';
        $lower = mb_strtolower(trim($name));

        if (isset(self::ALBANIAN_TO_ENGLISH[$lower])) {
            return self::ALBANIAN_TO_ENGLISH[$lower];
        }

        // Fallback: derive from country_code using a minimal map
        $code = strtoupper($package['country_code'] ?? '');

        return self::ISO_TO_ENGLISH[$code] ?? ucwords($name);
    }

    private const ISO_TO_ENGLISH = [
        'DE' => 'Germany',
        'CH' => 'Switzerland',
        'US' => 'United States',
        'GB' => 'United Kingdom',
        'FR' => 'France',
        'IT' => 'Italy',
        'ES' => 'Spain',
        'AT' => 'Austria',
        'NL' => 'Netherlands',
        'BE' => 'Belgium',
        'PT' => 'Portugal',
        'GR' => 'Greece',
        'TR' => 'Turkey',
        'PL' => 'Poland',
        'CZ' => 'Czech Republic',
        'SE' => 'Sweden',
        'NO' => 'Norway',
        'DK' => 'Denmark',
        'FI' => 'Finland',
        'IE' => 'Ireland',
        'HU' => 'Hungary',
        'RO' => 'Romania',
        'BG' => 'Bulgaria',
        'HR' => 'Croatia',
        'SK' => 'Slovakia',
        'SI' => 'Slovenia',
        'LT' => 'Lithuania',
        'LV' => 'Latvia',
        'EE' => 'Estonia',
        'CY' => 'Cyprus',
        'MT' => 'Malta',
        'LU' => 'Luxembourg',
        'IS' => 'Iceland',
        'AL' => 'Albania',
        'XK' => 'Kosovo',
        'RS' => 'Serbia',
        'MK' => 'North Macedonia',
        'ME' => 'Montenegro',
        'BA' => 'Bosnia',
        'UA' => 'Ukraine',
        'MD' => 'Moldova',
        'AE' => 'UAE',
        'SA' => 'Saudi Arabia',
        'EG' => 'Egypt',
        'IL' => 'Israel',
        'IQ' => 'Iraq',
        'OM' => 'Oman',
        'JP' => 'Japan',
        'CN' => 'China',
        'TH' => 'Thailand',
        'VN' => 'Vietnam',
        'SG' => 'Singapore',
        'AZ' => 'Azerbaijan',
        'BR' => 'Brazil',
        'CA' => 'Canada',
        'DO' => 'Dominican Republic',
        'TZ' => 'Tanzania',
        'MC' => 'Monaco',
        'LI' => 'Liechtenstein',
    ];

    private function formatDataLabel(int $dataGb): string
    {
        return $dataGb === 0 ? 'Unlimited' : $dataGb . 'GB';
    }
}
