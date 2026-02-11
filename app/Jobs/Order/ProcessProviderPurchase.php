<?php

namespace App\Jobs\Order;

use App\Events\EsimProfile\EsimProfileCreated;
use App\Events\Order\OrderAdminReviewRequired;
use App\Events\Order\OrderCompleted;
use App\Events\Order\OrderFailed;
use App\Events\Order\OrderProviderPurchased;
use App\Events\Order\OrderRetryScheduled;
use App\Models\Order;
use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessProviderPurchase implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 120;
    public int $maxExceptions = 1;

    private const MAX_RETRIES = 10;
    private const RETRY_DELAY_MINUTES = 5;

    /**
     * Only errors that are SAFE to auto-retry (temporary, will resolve on their own).
     * Rate limits = request was rejected, will work after cooldown.
     */
    private const RETRYABLE_PATTERNS = [
        'rate limit',
        'too many requests',
        '429',
    ];

    /**
     * Errors that require admin intervention — do NOT auto-retry.
     * Server errors: provider may have processed the order (duplicate risk).
     * Balance errors: admin needs to top up the account manually.
     */
    private const ADMIN_REVIEW_PATTERNS = [
        'timeout',
        'temporarily unavailable',
        'service unavailable',
        '500',
        '503',
        '502',
        '504',
        'connection',
        'try again',
        'internal server error',
        'bad gateway',
        'gateway timeout',
        'insufficient balance',
        'insufficient funds',
        'insufficient credit',
        'top up',
    ];

    public function __construct(
        public int $orderId,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        $order = Order::with(['package', 'provider'])->find($this->orderId);

        if (!$order) {
            Log::error('ProcessProviderPurchase: Order not found', ['order_id' => $this->orderId]);
            return;
        }

        if ($order->status->isTerminal()) {
            Log::info('ProcessProviderPurchase: Order already in terminal state', [
                'order_id' => $this->orderId,
                'status' => $order->status->value,
            ]);
            return;
        }

        try {
            $provider = $providerFactory->createFromModel($order->provider);
            $result = $provider->purchaseEsim($order->package->provider_package_id);

            if (!$result->success) {
                $this->handleFailure($order, $result->errorMessage, $result->isRetryable);
                return;
            }

            // Fire purchase success event
            OrderProviderPurchased::fire(
                order_id: $this->orderId,
                provider_order_id: $result->providerOrderId,
            );

            // Create eSIM profile
            $esimProfile = EsimProfileCreated::commit(
                order_id: $this->orderId,
                iccid: $result->iccid,
                activation_code: $result->activationCode,
                data_total_bytes: $result->dataTotalBytes ?? ($order->package->data_mb * 1024 * 1024),
                smdp_address: $result->smdpAddress,
                qr_code_data: $result->qrCodeData,
                lpa_string: $result->lpaString,
                pin: $result->pin,
                puk: $result->puk,
                apn: $result->apn,
                provider_data: $result->providerData,
            );

            // Complete the order
            OrderCompleted::fire(
                order_id: $this->orderId,
                esim_profile_id: $esimProfile->id,
            );

            Log::info('ProcessProviderPurchase: Order completed successfully', [
                'order_id' => $this->orderId,
                'provider_order_id' => $result->providerOrderId,
                'iccid' => $result->iccid,
            ]);

        } catch (\Exception $e) {
            Log::error('ProcessProviderPurchase: Exception', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->handleFailure($order, $e->getMessage());
        }
    }

    private function handleFailure(Order $order, string $message, ?bool $providerIsRetryable = null): void
    {
        // If the provider explicitly flagged the error, respect it.
        // Otherwise fall back to pattern matching.
        if ($providerIsRetryable === true) {
            $errorType = 'retryable';
        } elseif ($providerIsRetryable === false) {
            $errorType = 'admin_review';
        } else {
            $errorType = $this->classifyError($message);
        }

        if ($errorType === 'retryable' && $order->retry_count < self::MAX_RETRIES) {
            OrderRetryScheduled::fire(
                order_id: $this->orderId,
                failure_reason: $message,
                retry_delay_minutes: self::RETRY_DELAY_MINUTES,
            );

            Log::info('ProcessProviderPurchase: Order scheduled for retry', [
                'order_id' => $this->orderId,
                'retry_count' => $order->retry_count + 1,
                'reason' => $message,
            ]);
        } elseif ($errorType === 'admin_review') {
            // API/server error — provider may have processed the order.
            // Do NOT retry to avoid duplicate purchases. Flag for admin review.
            OrderAdminReviewRequired::fire(
                order_id: $this->orderId,
                failure_reason: $message,
                failure_code: 'provider_api_error',
            );

            Log::warning('ProcessProviderPurchase: Order flagged for admin review — possible duplicate risk', [
                'order_id' => $this->orderId,
                'retry_count' => $order->retry_count,
                'reason' => $message,
            ]);
        } else {
            OrderFailed::fire(
                order_id: $this->orderId,
                failure_reason: $message,
            );

            Log::warning('ProcessProviderPurchase: Order failed permanently', [
                'order_id' => $this->orderId,
                'retry_count' => $order->retry_count,
                'reason' => $message,
            ]);
        }
    }

    /**
     * Classify an error into: 'retryable', 'admin_review', or 'failed'.
     *
     * - retryable: Safe to retry (request was NOT processed by provider)
     * - admin_review: Provider may have processed the order, admin must decide
     * - failed: Permanent failure, no retry
     */
    private function classifyError(string $message): string
    {
        $messageLower = strtolower($message);

        // Check safe-to-retry patterns first (balance issues, rate limits)
        foreach (self::RETRYABLE_PATTERNS as $pattern) {
            if (str_contains($messageLower, $pattern)) {
                return 'retryable';
            }
        }

        // Check API/server error patterns — NOT safe to retry
        foreach (self::ADMIN_REVIEW_PATTERNS as $pattern) {
            if (str_contains($messageLower, $pattern)) {
                return 'admin_review';
            }
        }

        // Unknown errors also go to admin review to be safe
        return 'admin_review';
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessProviderPurchase: Job failed', [
            'order_id' => $this->orderId,
            'error' => $exception->getMessage(),
        ]);
    }
}
