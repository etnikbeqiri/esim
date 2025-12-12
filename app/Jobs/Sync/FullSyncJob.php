<?php

namespace App\Jobs\Sync;

use App\Enums\SyncJobType;
use App\Events\Sync\SyncJobCompleted;
use App\Events\Sync\SyncJobCreated;
use App\Events\Sync\SyncJobFailed;
use App\Events\Sync\SyncJobProgressUpdated;
use App\Events\Sync\SyncJobStarted;
use App\Models\Provider;
use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

class FullSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 1800; // 30 minutes for full sync

    public function __construct(
        public int $providerId,
        public ?int $syncJobId = null,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        $provider = Provider::find($this->providerId);

        if (!$provider) {
            Log::error('FullSyncJob: Provider not found', ['provider_id' => $this->providerId]);
            return;
        }

        if (!$provider->is_active) {
            Log::info('FullSyncJob: Provider is inactive', ['provider_id' => $this->providerId]);
            return;
        }

        $syncJobId = $this->syncJobId;
        if (!$syncJobId) {
            $syncJob = SyncJobCreated::commit(
                provider_id: $this->providerId,
                type: SyncJobType::FullSync,
                triggered_by: 'job',
            );
            $syncJobId = $syncJob->id;
        }

        try {
            // Total steps: Countries, Packages, Pricing, Stock
            $totalSteps = 4;

            SyncJobStarted::fire(
                sync_job_id: $syncJobId,
                total: $totalSteps,
            );

            $results = [
                'countries' => null,
                'packages' => null,
                'pricing' => null,
                'stock' => null,
            ];
            $completedSteps = 0;

            // Step 1: Sync Countries
            try {
                Log::info('FullSyncJob: Starting countries sync', ['provider_id' => $this->providerId]);
                $countriesJob = new SyncCountriesJob($this->providerId);
                $countriesJob->handle(app(ProviderFactory::class));
                $results['countries'] = 'success';
            } catch (\Exception $e) {
                $results['countries'] = 'failed: ' . $e->getMessage();
                Log::warning('FullSyncJob: Countries sync failed', [
                    'provider_id' => $this->providerId,
                    'error' => $e->getMessage(),
                ]);
            }
            $completedSteps++;

            SyncJobProgressUpdated::fire(
                sync_job_id: $syncJobId,
                progress: $completedSteps,
                total: $totalSteps,
                processed_items: $completedSteps,
                failed_items: 0,
            );

            // Step 2: Sync Packages
            try {
                Log::info('FullSyncJob: Starting packages sync', ['provider_id' => $this->providerId]);
                $packagesJob = new SyncPackagesJob($this->providerId);
                $packagesJob->handle(app(ProviderFactory::class));
                $results['packages'] = 'success';
            } catch (\Exception $e) {
                $results['packages'] = 'failed: ' . $e->getMessage();
                Log::warning('FullSyncJob: Packages sync failed', [
                    'provider_id' => $this->providerId,
                    'error' => $e->getMessage(),
                ]);
            }
            $completedSteps++;

            SyncJobProgressUpdated::fire(
                sync_job_id: $syncJobId,
                progress: $completedSteps,
                total: $totalSteps,
                processed_items: $completedSteps,
                failed_items: 0,
            );

            // Step 3: Sync Pricing
            try {
                Log::info('FullSyncJob: Starting pricing sync', ['provider_id' => $this->providerId]);
                $pricingJob = new SyncPricingJob($this->providerId);
                $pricingJob->handle(
                    app(ProviderFactory::class),
                    app(\App\Services\CurrencyService::class)
                );
                $results['pricing'] = 'success';
            } catch (\Exception $e) {
                $results['pricing'] = 'failed: ' . $e->getMessage();
                Log::warning('FullSyncJob: Pricing sync failed', [
                    'provider_id' => $this->providerId,
                    'error' => $e->getMessage(),
                ]);
            }
            $completedSteps++;

            SyncJobProgressUpdated::fire(
                sync_job_id: $syncJobId,
                progress: $completedSteps,
                total: $totalSteps,
                processed_items: $completedSteps,
                failed_items: 0,
            );

            // Step 4: Check Stock
            try {
                Log::info('FullSyncJob: Starting stock check', ['provider_id' => $this->providerId]);
                $stockJob = new CheckStockJob($this->providerId);
                $stockJob->handle(app(ProviderFactory::class));
                $results['stock'] = 'success';
            } catch (\Exception $e) {
                $results['stock'] = 'failed: ' . $e->getMessage();
                Log::warning('FullSyncJob: Stock check failed', [
                    'provider_id' => $this->providerId,
                    'error' => $e->getMessage(),
                ]);
            }
            $completedSteps++;

            $failedCount = count(array_filter($results, fn ($r) => str_starts_with($r ?? '', 'failed')));

            SyncJobCompleted::fire(
                sync_job_id: $syncJobId,
                result: [
                    'total_steps' => $totalSteps,
                    'completed_steps' => $completedSteps,
                    'failed_steps' => $failedCount,
                    'details' => $results,
                ],
            );

            Log::info('FullSyncJob: Completed', [
                'provider_id' => $this->providerId,
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            Log::error('FullSyncJob: Failed', [
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
        Log::error('FullSyncJob: Job failed completely', [
            'provider_id' => $this->providerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
