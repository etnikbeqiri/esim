<?php

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\Currency;
use App\Models\Package;
use App\Models\Provider;
use App\Services\CurrencyService;
use App\Services\Providers\SmsPoolProvider;
use Illuminate\Console\Command;

class SyncSmsPoolCommand extends Command
{
    protected $signature = 'smspool:sync {--countries-only : Only sync countries} {--packages-only : Only sync packages}';

    protected $description = 'Sync countries and packages from SMSPool API';

    public function handle(): int
    {
        $this->info('Starting SMSPool sync...');

        // Get or create provider
        $provider = Provider::firstOrCreate(
            ['slug' => 'smspool'],
            [
                'name' => 'SMSPool',
                'api_base_url' => config('services.smspool.url', env('SMSPOOL_API_URL', 'https://api.smspool.net')),
                'api_key' => env('SMSPOOL_API_KEY'),
                'is_active' => true,
                'rate_limit_ms' => 300,
                'markup_percentage' => 30.00,
            ]
        );

        $this->info("Using provider: {$provider->name} (ID: {$provider->id})");

        // Create provider instance
        $smsPool = new SmsPoolProvider($provider);

        // Test connection
        $this->info('Testing connection...');
        if (!$smsPool->testConnection()) {
            $this->error('Failed to connect to SMSPool API');
            return 1;
        }
        $this->info('Connection successful!');

        $packagesOnly = $this->option('packages-only');
        $countriesOnly = $this->option('countries-only');

        // Sync countries
        if (!$packagesOnly) {
            $this->syncCountries($smsPool);
        }

        // Sync packages
        if (!$countriesOnly) {
            $this->syncPackages($smsPool, $provider);
        }

        $this->info('Sync completed!');
        return 0;
    }

    protected function syncCountries(SmsPoolProvider $smsPool): void
    {
        $this->info('Fetching countries...');
        $countries = $smsPool->fetchCountries();

        $this->info("Found {$countries->count()} countries");

        $bar = $this->output->createProgressBar($countries->count());
        $bar->start();

        $created = 0;
        $updated = 0;

        foreach ($countries as $countryData) {
            // Check if country already exists
            $existingCountry = Country::where('iso_code', $countryData['iso_code'])->first();

            if ($existingCountry) {
                // Update existing country but preserve is_active status
                $existingCountry->update([
                    'iso_code_3' => $this->getIso3Code($countryData['iso_code']),
                    'name' => $countryData['name'],
                    'region' => $countryData['region'],
                    // Note: is_active is NOT updated to preserve admin settings
                ]);
                $updated++;
            } else {
                // Create new country - default to active
                Country::create([
                    'iso_code' => $countryData['iso_code'],
                    'iso_code_3' => $this->getIso3Code($countryData['iso_code']),
                    'name' => $countryData['name'],
                    'region' => $countryData['region'],
                    'is_active' => true,
                ]);
                $created++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Countries: {$created} created, {$updated} updated");
    }

    protected function syncPackages(SmsPoolProvider $smsPool, Provider $provider): void
    {
        $this->info('Fetching packages for each country...');

        // Get USD currency for source price tracking
        $usdCurrency = Currency::findByCode('USD');
        if (!$usdCurrency) {
            $this->error('USD currency not found in database. Please run migrations and seeders.');
            return;
        }

        // Get currency service for conversions
        $currencyService = app(CurrencyService::class);

        // Only sync packages for active (enabled) countries
        $activeCountries = Country::where('is_active', true)->get();
        $disabledCount = Country::where('is_active', false)->count();

        $this->info("Processing {$activeCountries->count()} enabled countries (skipping {$disabledCount} disabled)");
        $this->info("Source currency: USD, Target currency: EUR (rate: {$usdCurrency->exchange_rate_to_eur})");

        $countries = $activeCountries;

        $totalCreated = 0;
        $totalUpdated = 0;

        $bar = $this->output->createProgressBar($countries->count());
        $bar->start();

        foreach ($countries as $country) {
            try {
                $packages = $smsPool->fetchPackagesByCountry($country->iso_code);

                foreach ($packages as $packageData) {
                    // Source price is in USD
                    $sourceCostPrice = $packageData->sourceCostPrice;

                    // Convert USD to system default currency (EUR)
                    $costPrice = $currencyService->convertToEur($sourceCostPrice, 'USD');

                    // Calculate retail price with markup
                    $retailPrice = $this->calculateRetailPrice($costPrice, $provider->markup_percentage);

                    $package = Package::updateOrCreate(
                        [
                            'provider_id' => $provider->id,
                            'provider_package_id' => $packageData->providerPackageId,
                        ],
                        [
                            'country_id' => $country->id,
                            'source_currency_id' => $usdCurrency->id,
                            'source_cost_price' => $sourceCostPrice,
                            'name' => $packageData->name,
                            'description' => $packageData->description,
                            'data_mb' => $packageData->dataMb,
                            'validity_days' => $packageData->validityDays,
                            'cost_price' => $costPrice,
                            'retail_price' => $retailPrice,
                            'is_active' => true,
                            'in_stock' => $packageData->inStock,
                        ]
                    );

                    if ($package->wasRecentlyCreated) {
                        $totalCreated++;
                    } else {
                        $totalUpdated++;
                    }
                }

                // Rate limiting
                usleep(300 * 1000);
            } catch (\Exception $e) {
                $this->newLine();
                $this->warn("Failed to fetch packages for {$country->name}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Packages: {$totalCreated} created, {$totalUpdated} updated");

        // Disable packages for disabled countries
        $disabledCountryIds = Country::where('is_active', false)->pluck('id');
        if ($disabledCountryIds->isNotEmpty()) {
            $disabledPackages = Package::whereIn('country_id', $disabledCountryIds)
                ->where('is_active', true)
                ->update(['is_active' => false]);
            $this->info("Disabled {$disabledPackages} packages from disabled countries");
        }
    }

    protected function calculateRetailPrice(float $costPrice, float $markupPercentage): float
    {
        return round($costPrice * (1 + $markupPercentage / 100), 2);
    }

    protected function getIso3Code(string $iso2): string
    {
        $map = [
            'US' => 'USA', 'GB' => 'GBR', 'DE' => 'DEU', 'FR' => 'FRA', 'IT' => 'ITA',
            'ES' => 'ESP', 'NL' => 'NLD', 'BE' => 'BEL', 'AT' => 'AUT', 'CH' => 'CHE',
            'PT' => 'PRT', 'PL' => 'POL', 'SE' => 'SWE', 'NO' => 'NOR', 'DK' => 'DNK',
            'FI' => 'FIN', 'IE' => 'IRL', 'GR' => 'GRC', 'CZ' => 'CZE', 'HU' => 'HUN',
            'RO' => 'ROU', 'BG' => 'BGR', 'HR' => 'HRV', 'SK' => 'SVK', 'SI' => 'SVN',
            'LT' => 'LTU', 'LV' => 'LVA', 'EE' => 'EST', 'LU' => 'LUX', 'MT' => 'MLT',
            'CY' => 'CYP', 'IS' => 'ISL', 'AL' => 'ALB', 'RS' => 'SRB', 'ME' => 'MNE',
            'MK' => 'MKD', 'BA' => 'BIH', 'UA' => 'UKR', 'MD' => 'MDA', 'BY' => 'BLR',
            'RU' => 'RUS', 'TR' => 'TUR', 'JP' => 'JPN', 'CN' => 'CHN', 'KR' => 'KOR',
            'IN' => 'IND', 'TH' => 'THA', 'VN' => 'VNM', 'MY' => 'MYS', 'SG' => 'SGP',
            'ID' => 'IDN', 'PH' => 'PHL', 'AU' => 'AUS', 'NZ' => 'NZL', 'CA' => 'CAN',
            'MX' => 'MEX', 'BR' => 'BRA', 'AR' => 'ARG', 'CL' => 'CHL', 'CO' => 'COL',
            'PE' => 'PER', 'ZA' => 'ZAF', 'EG' => 'EGY', 'NG' => 'NGA', 'KE' => 'KEN',
            'AE' => 'ARE', 'SA' => 'SAU', 'IL' => 'ISR', 'HK' => 'HKG', 'TW' => 'TWN',
            'MC' => 'MCO', 'GP' => 'GLP', 'AI' => 'AIA',
        ];

        return $map[strtoupper($iso2)] ?? strtoupper($iso2);
    }
}
