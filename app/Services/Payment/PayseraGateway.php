<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Models\Currency;
use App\Models\Order;
use App\Models\Payment;
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
}
