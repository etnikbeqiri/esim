<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\PaymentProvider;
use App\Models\Currency;
use App\Models\Order;
use App\Models\Payment;
use Cryptomus\Api\Client;
use Cryptomus\Api\RequestBuilderException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CryptomusGateway implements PaymentGatewayContract
{
    private string $paymentKey;
    private string $merchantId;

    public function __construct()
    {
        $this->paymentKey = config('services.cryptomus.payment_key', '');
        $this->merchantId = config('services.cryptomus.merchant_id', '');
    }

    public function getProvider(): PaymentProvider
    {
        return PaymentProvider::Cryptomus;
    }

    public function createCheckout(
        Order $order,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        string $language = 'en',
    ): CheckoutResult {
        try {
            $currency = $order->currency ?? Currency::getDefault();
            $currencyCode = strtoupper($currency?->code ?? 'EUR');
            $orderId = $order->uuid;
            $amount = number_format($order->amount, 2, '.', '');

            $description = $order->package
                ? "eSIM Package: {$order->package->name}"
                : "eSIM Order #{$order->order_number}";

            $payment = Client::payment($this->paymentKey, $this->merchantId);

            $data = [
                'amount' => $amount,
                'currency' => $currencyCode,
                'order_id' => $orderId,
                'url_return' => $this->appendParams($cancelUrl, $orderId, 'cancelled'),
                'url_success' => $this->appendParams($successUrl, $orderId, 'success'),
                'url_callback' => route('webhooks.cryptomus'),
                'is_payment_multiple' => false,
                'lifetime' => 7200,
            ];

            $result = $payment->create($data);

            if (!empty($result['url']) && !empty($result['uuid'])) {
                Log::info('Cryptomus checkout created', [
                    'order_uuid' => $orderId,
                    'cryptomus_uuid' => $result['uuid'],
                    'amount' => $amount,
                    'currency' => $currencyCode,
                ]);

                return CheckoutResult::success(
                    provider: PaymentProvider::Cryptomus,
                    checkoutUrl: $result['url'],
                    gatewayId: $result['uuid'],
                    referenceId: $orderId,
                    amount: $order->amount,
                    currencyId: $currency?->id,
                    metadata: [
                        'cryptomus_uuid' => $result['uuid'],
                        'cryptomus_order_id' => $result['order_id'] ?? $orderId,
                    ],
                );
            }

            Log::error('Cryptomus checkout failed: missing url or uuid', [
                'order_uuid' => $orderId,
                'response' => $result,
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Cryptomus,
                errorMessage: 'Unable to process crypto payment. Please try again.',
                amount: $order->amount,
            );
        } catch (RequestBuilderException $e) {
            Log::error('Cryptomus checkout exception', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Cryptomus,
                errorMessage: 'Unable to process crypto payment. Please try again.',
                amount: $order->amount,
            );
        }
    }

    public function validatePayment(Payment $payment): PaymentValidationResult
    {
        try {
            $cryptomusUuid = $payment->gateway_id;
            $orderId = $payment->order?->uuid;

            if (!$cryptomusUuid && !$orderId) {
                return PaymentValidationResult::failed('No payment reference found');
            }

            $client = Client::payment($this->paymentKey, $this->merchantId);

            $data = $cryptomusUuid
                ? ['uuid' => $cryptomusUuid]
                : ['order_id' => $orderId];

            $result = $client->info($data);

            $status = $result['payment_status'] ?? $result['status'] ?? null;

            Log::info('Cryptomus payment validation', [
                'payment_uuid' => $payment->uuid,
                'cryptomus_status' => $status,
            ]);

            return match ($status) {
                'paid', 'paid_over' => PaymentValidationResult::confirmed(
                    transactionId: $result['txid'] ?? $result['uuid'] ?? null,
                    amount: isset($result['amount']) ? (float) $result['amount'] : null,
                    gatewayStatus: $status,
                    metadata: array_filter([
                        'cryptomus_uuid' => $result['uuid'] ?? null,
                        'network' => $result['network'] ?? null,
                        'currency' => $result['currency'] ?? null,
                        'txid' => $result['txid'] ?? null,
                        'payment_amount' => $result['payment_amount'] ?? null,
                    ]),
                ),
                'cancel', 'fail', 'system_fail' => PaymentValidationResult::failed(
                    errorMessage: "Crypto payment {$status}",
                    gatewayStatus: $status,
                ),
                default => PaymentValidationResult::pending(
                    gatewayStatus: $status,
                ),
            };
        } catch (RequestBuilderException $e) {
            Log::error('Cryptomus payment validation failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return PaymentValidationResult::failed($e->getMessage());
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): bool
    {
        Log::info('Cryptomus refund requested', [
            'payment_uuid' => $payment->uuid,
            'amount' => $amount,
            'reason' => $reason,
        ]);

        // Cryptomus refunds are handled manually through their dashboard
        return false;
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        if (!$this->verifyWebhookSignature($payload)) {
            Log::warning('Cryptomus webhook signature verification failed');
            return [
                'event' => 'payment.unknown',
                'payment_id' => null,
                'status' => null,
                'data' => [],
            ];
        }

        $status = $payload['status'] ?? null;

        $eventType = match ($status) {
            'paid', 'paid_over' => 'payment.success',
            'cancel', 'fail', 'system_fail' => 'payment.failed',
            'process', 'confirm_check', 'check', 'wrong_amount_waiting' => 'payment.pending',
            'refund_paid' => 'payment.refunded',
            default => 'payment.unknown',
        };

        return [
            'event' => $eventType,
            'payment_id' => $payload['order_id'] ?? null,
            'status' => $status,
            'data' => [
                'gateway_id' => $payload['uuid'] ?? null,
                'amount' => isset($payload['amount']) ? (float) $payload['amount'] : null,
                'currency' => $payload['currency'] ?? null,
                'network' => $payload['network'] ?? null,
                'txid' => $payload['txid'] ?? null,
                'payment_amount' => $payload['payment_amount'] ?? null,
                'payer_currency' => $payload['payer_currency'] ?? null,
            ],
        ];
    }

    public function canHandleCallback(Request $request): bool
    {
        return $request->has('payment_id')
            && $request->has('status')
            && !$request->has('data')
            && !$request->has('ss1')
            && !$request->has('merchantSignature');
    }

    public function handleCallback(Request $request): ?array
    {
        $paymentId = $request->query('payment_id');
        $status = $request->query('status');

        if (!$paymentId || !$status) {
            return null;
        }

        return [
            'order_id' => $paymentId,
            'status' => $status,
        ];
    }

    private function verifyWebhookSignature(array $payload): bool
    {
        $sign = $payload['sign'] ?? null;

        if (!$sign) {
            return false;
        }

        $data = $payload;
        unset($data['sign']);

        $expectedSign = md5(
            base64_encode(json_encode($data, JSON_UNESCAPED_UNICODE)) . $this->paymentKey
        );

        return hash_equals($expectedSign, $sign);
    }

    private function appendParams(string $url, string $uuid, string $status): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';

        return "{$url}{$separator}payment_id={$uuid}&status={$status}";
    }
}
