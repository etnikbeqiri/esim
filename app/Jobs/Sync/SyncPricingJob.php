<?php

namespace App\Jobs\Sync;

use App\Enums\SyncJobType;
use App\Events\Sync\SyncJobCompleted;
use App\Events\Sync\SyncJobCreated;
use App\Events\Sync\SyncJobFailed;
use App\Events\Sync\SyncJobProgressUpdated;
use App\Events\Sync\SyncJobStarted;
use App\Models\Package;
use App\Models\Provider;
use App\Providers\ProviderFactory;
use App\Services\CurrencyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncPricingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];
    public int $timeout = 600;

    public function __construct(
        public int $providerId,
        public ?int $syncJobId = null,
    ) {}

    public function handle(ProviderFactory $providerFactory, CurrencyService $currencyService): void
    {
        $provider = Provider::find($this->providerId);

        if (!$provider) {
            Log::error('SyncPricingJob: Provider not found', ['provider_id' => $this->providerId]);
            return;
        }

        if (!$provider->is_active) {
            Log::info('SyncPricingJob: Provider is inactive', ['provider_id' => $this->providerId]);
            return;
        }

        $syncJobId = $this->syncJobId;
        if (!$syncJobId) {
            $syncJob = SyncJobCreated::commit(
                provider_id: $this->providerId,
                type: SyncJobType::SyncPricing,
                triggered_by: 'job',
            );
            $syncJobId = $syncJob->id;
        }

        try {
            $providerAdapter = $providerFactory->createFromModel($provider);

            // Get all packages for this provider
            $packages = Package::where('provider_id', $this->providerId)->get();
            $totalCount = $packages->count();

            SyncJobStarted::fire(
                sync_job_id: $syncJobId,
                total: $totalCount,
            );

            $processed = 0;
            $updated = 0;
            $failed = 0;

            foreach ($packages as $package) {
                try {
                    // Recalculate prices based on current exchange rates and markup
                    $costPrice = $currencyService->convertToEur(
                        $package->source_cost_price,
                        $package->sourceCurrency?->code ?? 'USD'
                    );
                    $retailPrice = $providerAdapter->calculateRetailPrice($costPrice);

                    if ($package->cost_price != $costPrice || $package->retail_price != $retailPrice) {
                        $package->update([
                            'cost_price' => $costPrice,
                            'retail_price' => $retailPrice,
                            'last_synced_at' => now(),
                        ]);
                        $updated++;
                    }
                    $processed++;
                } catch (\Exception $e) {
                    $failed++;
                    Log::warning('SyncPricingJob: Failed to update package pricing', [
                        'provider_id' => $this->providerId,
                        'package_id' => $package->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                if ($processed % 50 === 0) {
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
                    'updated' => $updated,
                    'failed' => $failed,
                ],
            );

            Log::info('SyncPricingJob: Completed', [
                'provider_id' => $this->providerId,
                'total' => $totalCount,
                'updated' => $updated,
                'failed' => $failed,
            ]);

        } catch (\Exception $e) {
            Log::error('SyncPricingJob: Failed', [
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
        Log::error('SyncPricingJob: Job failed completely', [
            'provider_id' => $this->providerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
