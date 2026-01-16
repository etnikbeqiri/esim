<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Events\Payment\WebhookReceived;
use App\Events\Payment\PaymentSucceeded;
use App\Models\Currency;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PayseraGateway implements PaymentGatewayContract
{
    private string $projectId;
    private string $password;
    private bool $testMode;

    public function __construct()
    {
        $this->projectId = config('services.paysera.project_id', '');
        $this->password = config('services.paysera.password', '');
        $this->testMode = config('services.paysera.test_mode', false);
    }

    public function getProvider(): PaymentProvider
    {
        return PaymentProvider::Paysera;
    }

    // Paysera minimum amounts by currency (in cents)
    private const MINIMUM_AMOUNTS = [
        'eur' => 100,  // €1.00
        'usd' => 100,  // $1.00
        'gbp' => 100,  // £1.00
        'pln' => 100,  // 1.00 PLN
    ];

    public function createCheckout(
        Order $order,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        string $language = 'en',
    ): CheckoutResult {
        try {
            $currency = $order->currency ?? Currency::getDefault();
            $currencyCode = strtolower($currency?->code ?? 'eur');

            // Amount in cents
            $amountCents = (int) round($order->amount * 100);

            // Check Paysera minimum amount
            $minimumCents = self::MINIMUM_AMOUNTS[$currencyCode] ?? 100;
            if ($amountCents < $minimumCents) {
                $minimumAmount = $minimumCents / 100;
                return CheckoutResult::failed(
                    provider: PaymentProvider::Paysera,
                    errorMessage: "Minimum order amount is {$minimumAmount} {$currencyCode}",
                    amount: $order->amount,
                );
            }

            // Build payment data
            $orderId = $order->uuid;
            $acceptUrl = $this->appendParams($successUrl, $order->uuid, 'success');
            $cancelUrl = $this->appendParams($cancelUrl, $order->uuid, 'cancelled');
            $rejectUrl = $failUrl ? $this->appendParams($failUrl, $order->uuid, 'failed') : $cancelUrl;
            $callbackUrl = route('webhooks.paysera');

            $paymentData = [
                'projectid' => $this->projectId,
                'orderid' => $orderId,
                'amount' => $amountCents,
                'currency' => strtoupper($currencyCode),
                'accepturl' => $acceptUrl,
                'cancelurl' => $cancelUrl,
                'rejecturl' => $rejectUrl,
                'callbackurl' => $callbackUrl,
                'test' => $this->testMode ? 1 : 0,
                'language' => $this->mapLanguage($language),
                'payment' => 'Cards', // Default to card payments
                'country' => 'AL', // Albania
                'version' => '1.9',
            ];

            // Add order information
            if ($order->package) {
                $paymentData['p_email'] = $order->customer_email;
                $paymentData['paytext'] = "eSIM Package: {$order->package->name}";
            }

            $encodedData = $this->encodePaymentData($paymentData);
            $sign = $this->generateSign($encodedData);

            $baseUrl = 'https://www.paysera.com/pay/';
            $checkoutUrl = $baseUrl . '?data=' . $encodedData . '&sign=' . $sign;

            Log::info('Paysera checkout created', [
                'order_uuid' => $order->uuid,
                'amount' => $order->amount,
                'currency' => $currencyCode,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Paysera,
                checkoutUrl: $checkoutUrl,
                gatewayId: $orderId, // Paysera uses orderid as reference
                referenceId: $order->uuid,
                amount: $order->amount,
                currencyId: $currency?->id,
                metadata: [
                    'paysera_order_id' => $orderId,
                    'test_mode' => $this->testMode,
                ],
            );
        } catch (\Exception $e) {
            Log::error('Paysera checkout failed', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Paysera,
                errorMessage: 'Unable to process payment. Please try again.',
                amount: $order->amount,
            );
        }
    }

    public function validatePayment(Payment $payment): PaymentValidationResult
    {
        try {
            // For Paysera, we validate by checking the payment status
            // Paysera sends callbacks via webhooks, so we rely on that
            // This method can be used to manually check if needed

            if ($payment->status === PaymentStatus::Completed) {
                return PaymentValidationResult::confirmed(
                    transactionId: $payment->transaction_id,
                    amount: $payment->amount,
                    gatewayStatus: 'completed',
                );
            }

            if ($payment->status === PaymentStatus::Pending) {
                return PaymentValidationResult::pending(
                    gatewayStatus: 'pending',
                );
            }

            return PaymentValidationResult::failed(
                errorMessage: 'Payment validation failed',
            );
        } catch (\Exception $e) {
            Log::error('Paysera payment validation failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return PaymentValidationResult::failed($e->getMessage());
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): bool
    {
        Log::info('Paysera refund requested', [
            'payment_uuid' => $payment->uuid,
            'amount' => $amount,
            'reason' => $reason,
        ]);

        // TODO: Implement Paysera refund API when needed
        // Paysera supports refunds via their API
        return false;
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        $data = $payload;

        Log::info('Paysera webhook received', [
            'data' => $data,
        ]);

        // Verify the signature
        if (!$this->verifyWebhookSignature($data)) {
            Log::warning('Paysera webhook signature verification failed');
            return [
                'event' => 'payment.unknown',
                'payment_id' => null,
                'status' => null,
                'data' => [],
            ];
        }

        $orderId = $data['orderid'] ?? null;
        $status = $data['status'] ?? null;

        // Map Paysera statuses to our event types
        $eventType = match ($status) {
            '1' => 'payment.success',      // Payment successful
            '2' => 'payment.pending',      // Payment is processing
            '0' => 'payment.failed',       // Payment declined/failed
            '3' => 'payment.cancelled',    // Payment cancelled
            default => 'payment.unknown',
        };

        return [
            'event' => $eventType,
            'payment_id' => $orderId,
            'status' => $status,
            'data' => [
                'gateway_id' => $data['paysera_transaction_id'] ?? null,
                'amount' => isset($data['amount']) ? $data['amount'] / 100 : null,
                'currency' => $data['currency'] ?? 'EUR',
                'payamount' => isset($data['payamount']) ? $data['payamount'] / 100 : null,
            ],
        ];
    }

    /**
     * Create a checkout session for balance top-up.
     */
    public function createBalanceTopUpCheckout(
        Payment $payment,
        float $amount,
        string $successUrl,
        string $cancelUrl,
        string $failUrl,
        ?string $customerEmail = null,
    ): CheckoutResult {
        try {
            $amountCents = (int) round($amount * 100);

            // Check Paysera minimum amount
            $minimumCents = self::MINIMUM_AMOUNTS['eur'] ?? 100;
            if ($amountCents < $minimumCents) {
                $minimumAmount = $minimumCents / 100;
                return CheckoutResult::failed(
                    provider: PaymentProvider::Paysera,
                    errorMessage: "Minimum top-up amount is €{$minimumAmount}",
                    amount: $amount,
                );
            }

            $orderId = 'topup_' . $payment->uuid;
            $callbackUrl = route('webhooks.paysera');

            $paymentData = [
                'projectid' => $this->projectId,
                'orderid' => $orderId,
                'amount' => $amountCents,
                'currency' => 'EUR',
                'accepturl' => $successUrl,
                'cancelurl' => $cancelUrl,
                'rejecturl' => $failUrl,
                'callbackurl' => $callbackUrl,
                'test' => $this->testMode ? 1 : 0,
                'language' => 'en',
                'payment' => 'Cards',
                'p_email' => $customerEmail,
                'paytext' => 'Balance Top-Up: €' . number_format($amount, 2),
                'version' => '1.9',
            ];

            $encodedData = $this->encodePaymentData($paymentData);
            $sign = $this->generateSign($encodedData);

            $baseUrl = 'https://www.paysera.com/pay/';
            $checkoutUrl = $baseUrl . '?data=' . $encodedData . '&sign=' . $sign;

            Log::info('Paysera balance top-up checkout created', [
                'payment_uuid' => $payment->uuid,
                'amount' => $amount,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Paysera,
                checkoutUrl: $checkoutUrl,
                gatewayId: $orderId,
                referenceId: $payment->uuid,
                amount: $amount,
                metadata: [
                    'type' => 'balance_topup',
                    'paysera_order_id' => $orderId,
                ],
            );
        } catch (\Exception $e) {
            Log::error('Paysera balance top-up checkout failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Paysera,
                errorMessage: 'Unable to process payment. Please try again.',
                amount: $amount,
            );
        }
    }

    private function encodePaymentData(array $data): string
    {
        unset($data['sign']);

        ksort($data);

        $query = http_build_query($data, '', '&', PHP_QUERY_RFC3986);
        $query = str_replace(['%20', '%7E'], ['+', '~'], $query);

        $b64 = base64_encode($query);

        return str_replace(['/', '+'], ['_', '-'], $b64);
    }

    private function generateSign(string $data): string
    {
        return md5($data . $this->password);
    }

    private function verifyWebhookSignature(array $data): bool
    {
        $providedSign = $data['sign'] ?? null;
        if (!$providedSign) {
            return false;
        }

        unset($data['sign']);

        ksort($data);

        $query = http_build_query($data, '', '&', PHP_QUERY_RFC3986);
        $query = str_replace(['%20', '%7E'], ['+', '~'], $query);

        $b64 = base64_encode($query);
        $encodedData = str_replace(['/', '+'], ['_', '-'], $b64);

        $expectedSign = md5($encodedData . $this->password);

        return hash_equals($expectedSign, $providedSign);
    }

    /**
     * Map language code to Paysera supported languages.
     */
    private function mapLanguage(string $language): string
    {
        $languages = [
            'en' => 'en',
            'lt' => 'lt',
            'lv' => 'lv',
            'ee' => 'et',
            'ru' => 'ru',
            'pl' => 'pl',
            'de' => 'de',
            'fr' => 'fr',
            'it' => 'it',
            'es' => 'es',
            'no' => 'no',
            'sv' => 'sv',
            'da' => 'da',
            'nl' => 'nl',
            'fi' => 'fi',
        ];

        return $languages[strtolower($language)] ?? 'en';
    }

    private function appendParams(string $url, string $uuid, string $status): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';
        return "{$url}{$separator}payment_id={$uuid}&status={$status}";
    }

    /**
     * Decode Paysera callback data and verify signature.
     *
     * @param string $data Base64-encoded data from Paysera
     * @param string $ss1 MD5 signature (md5(data + password))
     * @return array|null Decoded parameters or null if verification fails
     */
    public function decodeCallback(string $data, string $ss1): ?array
    {
        // Verify ss1 signature first
        $expectedSign = md5($data . $this->password);

        if (!hash_equals($expectedSign, $ss1)) {
            Log::warning('Paysera callback signature verification failed', [
                'expected' => $expectedSign,
                'provided' => $ss1,
            ]);
            return null;
        }

        // Decode: change - to + and _ to /, then base64 decode
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);

        if ($decoded === false) {
            Log::error('Paysera callback base64 decode failed');
            return null;
        }

        // Parse query string
        parse_str($decoded, $params);

        Log::info('Paysera callback decoded', [
            'orderid' => $params['orderid'] ?? null,
            'status' => $params['status'] ?? null,
            'amount' => $params['amount'] ?? null,
        ]);

        return $params;
    }

    /**
     * Check if the request contains Paysera callback parameters.
     */
    public function canHandleCallback(Request $request): bool
    {
        return !empty($request->query('data')) && !empty($request->query('ss1'));
    }

    /**
     * Map Paysera status to internal status.
     * 0 = failed, 1 = success, 2 = pending, 3 = additional info
     */
    public function mapStatus(string $payseraStatus): string
    {
        return match ($payseraStatus) {
            '1' => 'success',
            '0' => 'failed',
            '2' => 'pending',
            '3' => 'success', // Additional info - treat as success
            default => 'pending',
        };
    }

    /**
     * Handle Paysera callback and return standardized result.
     *
     * @return array{order_id: string, status: string, raw_status: string}|null
     */
    public function handleCallback(Request $request): ?array
    {
        $data = $request->query('data');
        $ss1 = $request->query('ss1');

        if (!$data || !$ss1) {
            return null;
        }

        $decoded = $this->decodeCallback($data, $ss1);

        if (!$decoded) {
            return null;
        }

        $orderId = $decoded['orderid'] ?? null;
        $payseraStatus = $decoded['status'] ?? null;

        if (!$orderId) {
            return null;
        }

        // If payment is successful, confirm it immediately
        if ($payseraStatus === '1') {
            $this->confirmPayment($orderId, $decoded);
        }

        return [
            'order_id' => $orderId,
            'status' => $this->mapStatus($payseraStatus ?? ''),
            'raw_status' => $payseraStatus,
        ];
    }

    /**
     * Confirm payment based on Paysera callback data.
     */
    private function confirmPayment(string $orderUuid, array $data): void
    {
        $order = Order::where('uuid', $orderUuid)->first();

        if (!$order) {
            Log::warning('Paysera callback: order not found', ['order_uuid' => $orderUuid]);
            return;
        }

        $payment = $order->payments()->latest()->first();

        if (!$payment) {
            Log::warning('Paysera callback: payment not found', ['order_uuid' => $orderUuid]);
            return;
        }

        // Skip if already successful
        if ($payment->isSuccessful()) {
            Log::info('Paysera callback: payment already successful, skipping', ['payment_uuid' => $payment->uuid]);
            return;
        }

        // Record webhook/callback received
        WebhookReceived::fire(
            payment_id: $payment->id,
            event_type: 'payment.success',
            gateway_status: '1',
            payload: $data,
        );

        // Fire payment success event
        PaymentSucceeded::fire(
            payment_id: $payment->id,
            transaction_id: $data['requestid'] ?? $orderUuid,
            confirmed_amount: ($data['payamount'] ?? $data['amount'] ?? 0) / 100,
            gateway_status: '1',
            metadata: [
                'paysera_status' => '1',
                'test' => $data['test'] ?? '0',
                'payment_method' => $data['payment'] ?? null,
                'payamount' => $data['payamount'] ?? null,
            ],
        );

        Log::info('Paysera payment confirmed via callback', [
            'order_uuid' => $orderUuid,
            'payment_uuid' => $payment->uuid,
        ]);
    }
}
