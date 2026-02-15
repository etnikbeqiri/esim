<?php

namespace App\Jobs\Order;

use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateEsimLabel implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public string $providerOrderId,
        public string $label,
        public int $providerId,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        try {
            $provider = $providerFactory->makeById($this->providerId);
            
            Log::info('UpdateEsimLabel: Updating label', [
                'provider_order_id' => $this->providerOrderId,
                'label' => $this->label,
            ]);

            $result = $provider->updateEsimLabel($this->providerOrderId, $this->label);

            if ($result['success']) {
                Log::info('UpdateEsimLabel: Label updated successfully', [
                    'provider_order_id' => $this->providerOrderId,
                    'label' => $this->label,
                ]);
            } else {
                Log::warning('UpdateEsimLabel: Failed to update label', [
                    'provider_order_id' => $this->providerOrderId,
                    'label' => $this->label,
                    'error' => $result['error'] ?? 'Unknown error',
                ]);
                
                // Retry if not successful
                if ($this->attempts() < $this->tries) {
                    $this->release(30);
                }
            }
        } catch (\Exception $e) {
            Log::error('UpdateEsimLabel: Exception', [
                'provider_order_id' => $this->providerOrderId,
                'label' => $this->label,
                'error' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('UpdateEsimLabel: Job failed permanently', [
            'provider_order_id' => $this->providerOrderId,
            'label' => $this->label,
            'error' => $exception->getMessage(),
        ]);
    }
}
