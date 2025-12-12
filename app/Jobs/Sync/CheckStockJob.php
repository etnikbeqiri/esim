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
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];
    public int $timeout = 600;

    public function __construct(
        public int $providerId,
        public ?int $syncJobId = null,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        $provider = Provider::find($this->providerId);

        if (!$provider) {
            Log::error('CheckStockJob: Provider not found', ['provider_id' => $this->providerId]);
            return;
        }

        if (!$provider->is_active) {
            Log::info('CheckStockJob: Provider is inactive', ['provider_id' => $this->providerId]);
            return;
        }

        $syncJobId = $this->syncJobId;
        if (!$syncJobId) {
            $syncJob = SyncJobCreated::commit(
                provider_id: $this->providerId,
                type: SyncJobType::CheckStock,
                triggered_by: 'job',
            );
            $syncJobId = $syncJob->id;
        }

        try {
            $providerAdapter = $providerFactory->createFromModel($provider);

            // Get all active packages for this provider
            $packages = Package::where('provider_id', $this->providerId)
                ->where('is_active', true)
                ->get();
            $totalCount = $packages->count();

            SyncJobStarted::fire(
                sync_job_id: $syncJobId,
                total: $totalCount,
            );

            $processed = 0;
            $inStock = 0;
            $outOfStock = 0;
            $failed = 0;

            foreach ($packages as $package) {
                try {
                    $isInStock = $providerAdapter->checkStock($package->provider_package_id);

                    if ($package->in_stock !== $isInStock) {
                        $package->update([
                            'in_stock' => $isInStock,
                            'last_synced_at' => now(),
                        ]);
                    }

                    if ($isInStock) {
                        $inStock++;
                    } else {
                        $outOfStock++;
                    }
                    $processed++;

                    // Respect rate limiting
                    usleep($providerAdapter->getRateLimitMs() * 1000);
                } catch (\Exception $e) {
                    $failed++;
                    Log::warning('CheckStockJob: Failed to check package stock', [
                        'provider_id' => $this->providerId,
                        'package_id' => $package->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                if ($processed % 20 === 0) {
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
                    'in_stock' => $inStock,
                    'out_of_stock' => $outOfStock,
                    'failed' => $failed,
                ],
            );

            Log::info('CheckStockJob: Completed', [
                'provider_id' => $this->providerId,
                'total' => $totalCount,
                'in_stock' => $inStock,
                'out_of_stock' => $outOfStock,
                'failed' => $failed,
            ]);

        } catch (\Exception $e) {
            Log::error('CheckStockJob: Failed', [
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
        Log::error('CheckStockJob: Job failed completely', [
            'provider_id' => $this->providerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
