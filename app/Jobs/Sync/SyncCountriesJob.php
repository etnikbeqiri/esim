<?php

namespace App\Jobs\Sync;

use App\Enums\SyncJobType;
use App\Events\Sync\SyncJobCompleted;
use App\Events\Sync\SyncJobCreated;
use App\Events\Sync\SyncJobFailed;
use App\Events\Sync\SyncJobProgressUpdated;
use App\Events\Sync\SyncJobStarted;
use App\Models\Country;
use App\Models\Provider;
use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncCountriesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];
    public int $timeout = 300;

    public function __construct(
        public int $providerId,
        public ?int $syncJobId = null,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        $provider = Provider::find($this->providerId);

        if (!$provider) {
            Log::error('SyncCountriesJob: Provider not found', ['provider_id' => $this->providerId]);
            return;
        }

        if (!$provider->is_active) {
            Log::info('SyncCountriesJob: Provider is inactive', ['provider_id' => $this->providerId]);
            return;
        }

        $syncJobId = $this->syncJobId;
        if (!$syncJobId) {
            $syncJob = SyncJobCreated::commit(
                provider_id: $this->providerId,
                type: SyncJobType::SyncCountries,
                triggered_by: 'job',
            );
            $syncJobId = $syncJob->id;
        }

        try {
            $providerAdapter = $providerFactory->createFromModel($provider);

            if (!method_exists($providerAdapter, 'fetchCountries')) {
                throw new \RuntimeException('Provider does not support country sync');
            }

            $countries = $providerAdapter->fetchCountries();
            $totalCount = $countries->count();

            SyncJobStarted::fire(
                sync_job_id: $syncJobId,
                total: $totalCount,
            );

            $processed = 0;
            $created = 0;
            $updated = 0;
            $failed = 0;

            foreach ($countries as $countryData) {
                try {
                    $existing = Country::where('iso_code', $countryData['iso_code'])->first();

                    $data = [
                        'iso_code' => $countryData['iso_code'],
                        'name' => $countryData['name'],
                        'region' => $countryData['region'] ?? null,
                    ];

                    if ($existing) {
                        $existing->update($data);
                        $updated++;
                    } else {
                        $data['is_active'] = true;
                        Country::create($data);
                        $created++;
                    }
                    $processed++;
                } catch (\Exception $e) {
                    $failed++;
                    Log::warning('SyncCountriesJob: Failed to process country', [
                        'provider_id' => $this->providerId,
                        'country' => $countryData,
                        'error' => $e->getMessage(),
                    ]);
                }

                if ($processed % 10 === 0) {
                    SyncJobProgressUpdated::fire(
                        sync_job_id: $syncJobId,
                        progress: $processed,
                        total: $totalCount,
                        processed_items: $processed,
                        failed_items: $failed,
                    );
                }
            }

            SyncJobCompleted::fire(
                sync_job_id: $syncJobId,
                result: [
                    'total' => $totalCount,
                    'processed' => $processed,
                    'created' => $created,
                    'updated' => $updated,
                    'failed' => $failed,
                ],
            );

            Log::info('SyncCountriesJob: Completed', [
                'provider_id' => $this->providerId,
                'total' => $totalCount,
                'created' => $created,
                'updated' => $updated,
                'failed' => $failed,
            ]);

        } catch (\Exception $e) {
            Log::error('SyncCountriesJob: Failed', [
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

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncCountriesJob: Job failed completely', [
            'provider_id' => $this->providerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
