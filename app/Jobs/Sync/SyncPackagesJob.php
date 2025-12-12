<?php

namespace App\Jobs\Sync;

use App\Contracts\ProviderContract;
use App\Events\Sync\SyncJobCompleted;
use App\Events\Sync\SyncJobCreated;
use App\Events\Sync\SyncJobFailed;
use App\Events\Sync\SyncJobProgressUpdated;
use App\Events\Sync\SyncJobStarted;
use App\Models\Country;
use App\Models\Package;
use App\Models\Provider;
use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncPackagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];
    public int $timeout = 600;

    public function __construct(
        public int $providerId,
        public ?int $syncJobId = null,
        public ?int $triggeredByUserId = null,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        $provider = Provider::find($this->providerId);

        if (!$provider) {
            Log::error('SyncPackagesJob: Provider not found', ['provider_id' => $this->providerId]);
            return;
        }

        if (!$provider->is_active) {
            Log::info('SyncPackagesJob: Provider is inactive', ['provider_id' => $this->providerId]);
            return;
        }

        // Create sync job if not provided
        $syncJobId = $this->syncJobId;
        if (!$syncJobId) {
            $syncJob = SyncJobCreated::commit(
                provider_id: $this->providerId,
                type: \App\Enums\SyncJobType::SyncPackages,
                triggered_by: $this->triggeredByUserId ? 'user' : 'job',
                triggered_by_user_id: $this->triggeredByUserId,
            );
            $syncJobId = $syncJob->id;
        }

        try {
            $providerAdapter = $providerFactory->createFromModel($provider);

            // Get active countries to iterate through
            $countries = Country::where('is_active', true)->get();

            // Get custom regions from provider and ensure they exist as Country entries
            $customRegions = $provider->getCustomRegionCodes();
            foreach ($customRegions as $code => $name) {
                $existingRegion = Country::where('iso_code', $code)->first();
                if (!$existingRegion) {
                    Country::create([
                        'iso_code' => $code,
                        'iso_code_3' => $code,
                        'name' => $name,
                        'region' => 'Region',
                        'is_active' => true,
                        'is_region' => true,
                    ]);
                    Log::info("SyncPackagesJob: Created region entry for {$code}");
                } elseif ($existingRegion->name !== $name) {
                    // Update name if it changed
                    $existingRegion->update(['name' => $name]);
                    Log::info("SyncPackagesJob: Updated region name for {$code} to {$name}");
                }
            }

            // Reload countries to include newly created regions
            $countries = Country::where('is_active', true)->get();
            $totalCountries = $countries->count();

            SyncJobStarted::fire(
                sync_job_id: $syncJobId,
                total: $totalCountries,
            );

            $processed = 0;
            $created = 0;
            $updated = 0;
            $failed = 0;
            $countriesProcessed = 0;

            foreach ($countries as $country) {
                try {
                    // Check if provider supports country-based fetching
                    if (method_exists($providerAdapter, 'fetchPackagesByCountry')) {
                        $packages = $providerAdapter->fetchPackagesByCountry($country->iso_code);
                    } else {
                        // Skip if provider doesn't support country-based fetching
                        $countriesProcessed++;
                        continue;
                    }

                    foreach ($packages as $packageData) {
                        try {
                            $result = $this->processPackage($packageData, $provider, $providerAdapter);
                            if ($result === 'created') {
                                $created++;
                            } elseif ($result === 'updated') {
                                $updated++;
                            }
                            $processed++;
                        } catch (\Exception $e) {
                            $failed++;
                            Log::warning('SyncPackagesJob: Failed to process package', [
                                'provider_id' => $this->providerId,
                                'package_id' => $packageData->providerPackageId ?? 'unknown',
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }

                    $countriesProcessed++;

                    // Update progress every 5 countries
                    if ($countriesProcessed % 5 === 0) {
                        SyncJobProgressUpdated::fire(
                            sync_job_id: $syncJobId,
                            progress: $countriesProcessed,
                            total: $totalCountries,
                            processed_items: $processed,
                            failed_items: $failed,
                        );
                    }

                    // Respect rate limiting between country requests
                    usleep($providerAdapter->getRateLimitMs() * 1000);

                } catch (\Exception $e) {
                    Log::warning('SyncPackagesJob: Failed to fetch packages for country', [
                        'provider_id' => $this->providerId,
                        'country' => $country->iso_code,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            SyncJobCompleted::fire(
                sync_job_id: $syncJobId,
                result: [
                    'total' => $processed,
                    'processed' => $processed,
                    'created' => $created,
                    'updated' => $updated,
                    'failed' => $failed,
                    'countries_processed' => $countriesProcessed,
                ],
            );

            Log::info('SyncPackagesJob: Completed', [
                'provider_id' => $this->providerId,
                'countries' => $countriesProcessed,
                'packages' => $processed,
                'created' => $created,
                'updated' => $updated,
                'failed' => $failed,
            ]);

        } catch (\Exception $e) {
            Log::error('SyncPackagesJob: Failed', [
                'provider_id' => $this->providerId,
                'error' => $e->getMessage(),
            ]);

            SyncJobFailed::fire(
                sync_job_id: $syncJobId,
                error_message: $e->getMessage(),
            );

            throw $e;
        }
    }

    private function processPackage($packageData, Provider $provider, ProviderContract $providerAdapter): string
    {
        $country = Country::where('iso_code', $packageData->countryIso)->first();

        // Convert source price to system currency and calculate retail price
        $currencyService = app(\App\Services\CurrencyService::class);
        $costPrice = $currencyService->convertToEur($packageData->sourceCostPrice, $packageData->sourceCurrency);
        $retailPrice = $providerAdapter->calculateRetailPrice($costPrice);

        // Get source currency
        $sourceCurrency = \App\Models\Currency::findByCode($packageData->sourceCurrency);

        $existing = Package::where('provider_id', $provider->id)
            ->where('provider_package_id', $packageData->providerPackageId)
            ->first();

        $data = [
            'provider_id' => $provider->id,
            'country_id' => $country?->id,
            'provider_package_id' => $packageData->providerPackageId,
            'source_currency_id' => $sourceCurrency?->id,
            'source_cost_price' => $packageData->sourceCostPrice,
            'name' => $packageData->name,
            'slug' => Str::slug($packageData->name),
            'description' => $packageData->description,
            'data_mb' => $packageData->dataMb,
            'validity_days' => $packageData->validityDays,
            'cost_price' => $costPrice,
            'retail_price' => $retailPrice,
            'network_type' => $packageData->networkType,
            'supported_networks' => $packageData->supportedNetworks,
            'coverage_type' => $packageData->coverageType,
            'coverage_countries' => $packageData->coverageCountries,
            'sms_included' => $packageData->smsIncluded,
            'voice_included' => $packageData->voiceIncluded,
            'hotspot_allowed' => $packageData->hotspotAllowed,
            'in_stock' => $packageData->inStock,
            'metadata' => $packageData->metadata,
            'last_synced_at' => now(),
        ];

        if ($existing) {
            $existing->update($data);
            return 'updated';
        } else {
            $data['is_active'] = true;
            $data['is_popular'] = $costPrice <= 10 && $packageData->dataMb >= 1024;
            Package::create($data);
            return 'created';
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncPackagesJob: Job failed completely', [
            'provider_id' => $this->providerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
