<?php

namespace App\Jobs\Order;

use App\Events\EsimProfile\EsimProfileCreated;
use App\Events\Order\OrderAdminReviewRequired;
use App\Events\Order\OrderCompleted;
use App\Events\Order\OrderProfileFetchFailed;
use App\Jobs\Order\UpdateEsimLabel;
use App\Models\Order;
use App\Providers\ProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchEsimProfile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $timeout = 60;
    public int $maxExceptions = 1;
    public array $backoff = [10, 30, 60, 120, 300];

    public function __construct(
        public int $orderId,
        public string $providerOrderId,
        public ?string $orderNumber = null,
        public int $attempt = 1,
    ) {}

    public function handle(ProviderFactory $providerFactory): void
    {
        $order = Order::with(['package', 'provider'])->find($this->orderId);

        if (!$order) {
            Log::error('FetchEsimProfile: Order not found', ['order_id' => $this->orderId]);
            return;
        }

        if ($order->status->isTerminal()) {
            Log::info('FetchEsimProfile: Order already in terminal state', [
                'order_id' => $this->orderId,
                'status' => $order->status->value,
            ]);
            return;
        }

        if ($order->esimProfile) {
            Log::info('FetchEsimProfile: eSIM profile already exists', [
                'order_id' => $this->orderId,
                'esim_profile_id' => $order->esim_profile_id,
            ]);

            OrderCompleted::fire(
                order_id: $this->orderId,
                esim_profile_id: $order->esim_profile_id,
            );
            return;
        }

        try {
            $provider = $providerFactory->createFromModel($order->provider);
            $profileData = $provider->fetchEsimProfileRaw($this->providerOrderId);

            if (($profileData['success'] ?? false) !== true) {
                $this->handleProfileFetchFailure($order, $profileData);
                return;
            }

            $iccid = $profileData['iccid'] ?? $profileData['transactionId'] ?? $this->providerOrderId;
            $dataTotalBytes = $this->parseDataBytes($profileData['totalData'] ?? null)
                ?: ($order->package->data_mb * 1024 * 1024);

            // Build LPA string for QR code
            $lpaString = $profileData['ac'] ?? null;
            if (!$lpaString && ($profileData['smdp'] ?? null) && ($profileData['activationCode'] ?? null)) {
                $lpaString = "LPA:1\${$profileData['smdp']}\${$profileData['activationCode']}";
            }

            // Generate QR code from LPA string
            $qrCodeData = null;
            if ($lpaString) {
                $qrCodeData = $this->generateQrCode($lpaString);
            }

            $esimProfile = EsimProfileCreated::commit(
                order_id: $this->orderId,
                iccid: $iccid,
                activation_code: $profileData['activationCode'] ?? '',
                data_total_bytes: $dataTotalBytes,
                smdp_address: $profileData['smdp'] ?? null,
                qr_code_data: $qrCodeData,
                lpa_string: $lpaString,
                pin: $profileData['pin'] ?? null,
                puk: $profileData['puk'] ?? null,
                apn: $profileData['apn'] ?? null,
                provider_data: $profileData,
            );

            OrderCompleted::fire(
                order_id: $this->orderId,
                esim_profile_id: $esimProfile->id,
            );

            Log::info('FetchEsimProfile: Profile fetched and order completed', [
                'order_id' => $this->orderId,
                'provider_order_id' => $this->providerOrderId,
                'iccid' => $iccid,
                'attempt' => $this->attempt,
            ]);

            // Dispatch label update 30 seconds after successful profile fetch
            if ($this->orderNumber) {
                // SMSPool requires alphanumeric-only labels (no spaces or hyphens)
                // Use order number without hyphens for readability: ORD-260218-TI8XXZ -> ORD260218TI8XXZ
                $label = str_replace('-', '', $this->orderNumber);
                UpdateEsimLabel::dispatch($this->providerOrderId, $label, $order->provider_id)
                    ->delay(now()->addSeconds(30));
                
                Log::info('FetchEsimProfile: Scheduled label update', [
                    'order_id' => $this->orderId,
                    'provider_order_id' => $this->providerOrderId,
                    'label' => $label,
                    'delay_seconds' => 30,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('FetchEsimProfile: Exception', [
                'order_id' => $this->orderId,
                'attempt' => $this->attempt,
                'error' => $e->getMessage(),
            ]);

            $this->handleProfileFetchFailure($order, [
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function handleProfileFetchFailure(Order $order, array $profileData): void
    {
        $httpStatus = $profileData['status'] ?? null;
        $message = $profileData['message'] ?? $profileData['body'] ?? 'Unknown error';

        Log::warning('FetchEsimProfile: Profile fetch failed', [
            'order_id' => $this->orderId,
            'provider_order_id' => $this->providerOrderId,
            'attempt' => $this->attempt,
            'http_status' => $httpStatus,
            'message' => $message,
        ]);

        if ($this->attempt < $this->tries) {
            self::dispatch(
                $this->orderId,
                $this->providerOrderId,
                $this->orderNumber,
                $this->attempt + 1
            )->delay(now()->addSeconds($this->backoff[$this->attempt - 1] ?? 60));

            Log::info('FetchEsimProfile: Scheduled retry', [
                'order_id' => $this->orderId,
                'next_attempt' => $this->attempt + 1,
                'delay_seconds' => $this->backoff[$this->attempt - 1] ?? 60,
            ]);
        } else {
            OrderProfileFetchFailed::fire(
                order_id: $this->orderId,
                provider_order_id: $this->providerOrderId,
                failure_reason: "Profile fetch failed after {$this->tries} attempts: {$message}",
            );

            Log::error('FetchEsimProfile: All retries exhausted, flagged for admin review', [
                'order_id' => $this->orderId,
                'provider_order_id' => $this->providerOrderId,
                'attempts' => $this->attempt,
            ]);
        }
    }

    private function parseDataBytes(?string $dataString): int
    {
        if ($dataString === null) {
            return 0;
        }

        if (preg_match('/^([\d.]+)\s*(GB|MB|KB|B)?$/i', trim($dataString), $matches)) {
            $value = (float) $matches[1];
            $unit = strtoupper($matches[2] ?? 'MB');

            return (int) match ($unit) {
                'GB' => $value * 1024 * 1024 * 1024,
                'MB' => $value * 1024 * 1024,
                'KB' => $value * 1024,
                default => $value,
            };
        }

        return 0;
    }

    /**
     * Generate QR code as base64 encoded SVG.
     *
     * Creates a 400x400px SVG QR code for eSIM installation.
     * Returns base64 encoded string for embedding in emails and web pages.
     */
    private function generateQrCode(string $data): string
    {
        if (empty($data)) {
            Log::warning('FetchEsimProfile: Cannot generate QR code - empty data provided');

            return '';
        }

        try {
            // Generate QR code with no border (quiet zone = 0)
            $rendererStyle = new \BaconQrCode\Renderer\RendererStyle\RendererStyle(
                size: 400,
                margin: 0
            );
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                $rendererStyle,
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $svg = $writer->writeString($data);

            if (empty($svg)) {
                Log::error('FetchEsimProfile: QR code generation returned empty SVG');

                return '';
            }

            return base64_encode($svg);
        } catch (\Exception $e) {
            Log::error('FetchEsimProfile: Failed to generate QR code', [
                'error' => $e->getMessage(),
                'data_length' => strlen($data),
                'trace' => $e->getTraceAsString(),
            ]);

            return '';
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('FetchEsimProfile: Job failed permanently', [
            'order_id' => $this->orderId,
            'provider_order_id' => $this->providerOrderId,
            'error' => $exception->getMessage(),
        ]);

        OrderProfileFetchFailed::fire(
            order_id: $this->orderId,
            provider_order_id: $this->providerOrderId,
            failure_reason: $exception->getMessage(),
        );
    }
}
