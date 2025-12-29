<?php

namespace App\Jobs\Sync;

use App\Enums\EsimProfileStatus;
use App\Models\EsimProfile;
use App\Models\Order;
use App\Models\Provider;
use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncEsimUsageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 120, 300];
    public int $timeout = 300;

    public function __construct(
        public ?int $esimProfileId = null,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        // If specific profile ID provided, sync just that one
        if ($this->esimProfileId) {
            $this->syncSingleProfile($this->esimProfileId, $providerFactory);
            return;
        }

        // Otherwise sync all active eSIMs that need checking
        $this->syncAllActiveProfiles($providerFactory);
    }

    protected function syncSingleProfile(int $profileId, ProviderFactory $providerFactory): void
    {
        $profile = EsimProfile::with('order.package.provider')->find($profileId);

        if (!$profile) {
            Log::warning('SyncEsimUsageJob: Profile not found', ['profile_id' => $profileId]);
            return;
        }

        $this->syncProfile($profile, $providerFactory);
    }

    protected function syncAllActiveProfiles(ProviderFactory $providerFactory): void
    {
        // Get all eSIM profiles that are usable and belong to completed orders
        $profiles = EsimProfile::with('order.package.provider')
            ->whereHas('order', function ($query) {
                $query->where('status', 'completed');
            })
            ->whereIn('status', [
                EsimProfileStatus::Active,
                EsimProfileStatus::Activated,
            ])
            ->where(function ($query) {
                // Check if never synced or last sync was more than 20 minutes ago
                $query->whereNull('last_usage_check_at')
                    ->orWhere('last_usage_check_at', '<', now()->subMinutes(20));
            })
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($profiles as $profile) {
            try {
                $this->syncProfile($profile, $providerFactory);
                $synced++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('SyncEsimUsageJob: Failed to sync profile', [
                    'profile_id' => $profile->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Rate limiting between requests
            usleep(500000); // 500ms between calls
        }

        Log::info('SyncEsimUsageJob: Completed', [
            'total' => $profiles->count(),
            'synced' => $synced,
            'failed' => $failed,
        ]);
    }

    protected function syncProfile(EsimProfile $profile, ProviderFactory $providerFactory): void
    {
        $order = $profile->order;

        if (!$order || !$order->package || !$order->package->provider) {
            Log::warning('SyncEsimUsageJob: Missing order/package/provider', [
                'profile_id' => $profile->id,
            ]);
            return;
        }

        $provider = $order->package->provider;

        if (!$provider->is_active) {
            Log::info('SyncEsimUsageJob: Provider inactive, skipping', [
                'profile_id' => $profile->id,
                'provider_id' => $provider->id,
            ]);
            return;
        }

        // Get provider order ID (transaction ID used for API calls)
        $providerOrderId = $order->provider_order_id;

        if (!$providerOrderId) {
            Log::warning('SyncEsimUsageJob: No provider order ID', [
                'profile_id' => $profile->id,
                'order_id' => $order->id,
            ]);
            return;
        }

        try {
            $providerAdapter = $providerFactory->createFromModel($provider);
            $profileData = $providerAdapter->getEsimProfile($providerOrderId);

            // Determine new status based on provider response
            $wasActivated = $profile->is_activated;
            $newStatus = $this->determineStatus($profile, $profileData);

            // Update the profile with all data from the same API response
            $profile->update([
                'data_used_bytes' => $profileData->dataUsedBytes,
                'data_total_bytes' => $profileData->dataTotalBytes,
                'is_activated' => $profileData->isActivated,
                'topup_available' => $profileData->topupAvailable,
                'status' => $newStatus,
                'activated_at' => $profileData->isActivated && !$wasActivated
                    ? ($profileData->activatedAt ?? now())
                    : $profile->activated_at,
                'expires_at' => $profileData->expiresAt ?? $profile->expires_at,
                'last_usage_check_at' => now(),
                'provider_data' => $profileData->metadata, // Store full provider response
            ]);

            Log::info('SyncEsimUsageJob: Profile synced', [
                'profile_id' => $profile->id,
                'iccid' => $profile->iccid,
                'is_activated' => $profileData->isActivated,
                'data_used' => $profileData->getDataUsedMb() . ' MB',
                'data_remaining' => $profileData->getDataRemainingMb() . ' MB',
                'status' => $newStatus->value,
            ]);

        } catch (\Exception $e) {
            Log::error('SyncEsimUsageJob: Provider API error', [
                'profile_id' => $profile->id,
                'provider_id' => $provider->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function determineStatus(EsimProfile $profile, \App\DTOs\EsimProfileData $profileData): EsimProfileStatus
    {
        // Check if data is consumed
        if ($profileData->isDataConsumed()) {
            return EsimProfileStatus::Consumed;
        }

        // Check if expired
        if ($profileData->isExpired()) {
            return EsimProfileStatus::Expired;
        }

        // Check activation status
        if ($profileData->isActivated) {
            return EsimProfileStatus::Activated;
        }

        // Still active but not yet activated on device
        return EsimProfileStatus::Active;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncEsimUsageJob: Job failed', [
            'profile_id' => $this->esimProfileId,
            'error' => $exception->getMessage(),
        ]);
    }
}
