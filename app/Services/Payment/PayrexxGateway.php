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
use Illuminate\Support\Facades\Log;
use Payrexx\Models\Request\Gateway as PayrexxGatewayRequest;
use Payrexx\Models\Response\Gateway as PayrexxGatewayResponse;
use Payrexx\Payrexx;
use Payrexx\PayrexxException;

class PayrexxGateway implements PaymentGatewayContract
{
    private Payrexx $client;

    public function __construct()
    {
        $this->client = new Payrexx(
            config('services.payrexx.instance'),
            config('services.payrexx.secret')
        );
    }

    public function getProvider(): PaymentProvider
    {
        return PaymentProvider::Payrexx;
    }

    public function createCheckout(
        Order $order,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        string $language = 'en',
    ): CheckoutResult {
        try {
            // Get currency from order or default
            $currency = $order->currency ?? Currency::getDefault();
            $currencyCode = $currency?->code ?? 'EUR';

            $gateway = new PayrexxGatewayRequest();

            // Amount in cents
            $amountCents = (int) round($order->amount * 100);
            $gateway->setAmount($amountCents);
            $gateway->setVatRate(0);
            $gateway->setCurrency($currencyCode);

            // Reference
            $gateway->setReferenceId($order->uuid);
            $gateway->setSku($order->id);

            // Redirect URLs
            $gateway->setSuccessRedirectUrl($this->appendParams($successUrl, $order->uuid, 'success'));
            $gateway->setFailedRedirectUrl($this->appendParams($failUrl ?? $cancelUrl, $order->uuid, 'failed'));
            $gateway->setCancelRedirectUrl($this->appendParams($cancelUrl, $order->uuid, 'cancelled'));

            // Settings
            $gateway->setPreAuthorization(false);
            $gateway->setReservation(false);
            $gateway->setValidity(config('services.payrexx.checkout_validity_minutes', 30));

            // Optional: Set purpose/description
            if ($order->package) {
                $gateway->setPurpose([
                    1 => "eSIM Package: {$order->package->name}",
                ]);
            }

            /** @var PayrexxGatewayResponse $response */
            $response = $this->client->create($gateway);

            Log::info('Payrexx checkout created', [
                'order_uuid' => $order->uuid,
                'gateway_id' => $response->getId(),
                'link' => $response->getLink(),
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Payrexx,
                checkoutUrl: $response->getLink(),
                gatewayId: (string) $response->getId(),
                referenceId: $order->uuid,
                amount: $order->amount,
                currencyId: $currency?->id,
                metadata: [
                    'payrexx_id' => $response->getId(),
                    'created_at' => $response->getCreatedAt(),
                ],
            );
        } catch (PayrexxException $e) {
            Log::error('Payrexx checkout failed', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Payrexx,
                errorMessage: $e->getMessage(),
                amount: $order->amount,
            );
        }
    }

    public function validatePayment(Payment $payment): PaymentValidationResult
    {
        try {
            $gatewayId = $payment->gateway_id;
            if (!$gatewayId) {
                return PaymentValidationResult::failed('No gateway ID found for payment');
            }

            $gateway = new PayrexxGatewayRequest();
            $gateway->setId((int) $gatewayId);

            /** @var PayrexxGatewayResponse $response */
            $response = $this->client->getOne($gateway);
            $status = $response->getStatus();

            Log::info('Payrexx payment validation', [
                'payment_uuid' => $payment->uuid,
                'gateway_status' => $status,
            ]);

            return match ($status) {
                'confirmed', 'authorized' => PaymentValidationResult::confirmed(
                    transactionId: (string) $response->getId(),
                    amount: $response->getAmount() / 100,
                    gatewayStatus: $status,
                    metadata: [
                        'payrexx_id' => $response->getId(),
                        'invoices' => $response->getInvoices(),
                    ],
                ),
                'waiting' => PaymentValidationResult::pending(
                    gatewayStatus: $status,
                ),
                'declined', 'error', 'cancelled' => PaymentValidationResult::failed(
                    errorMessage: "Payment {$status}",
                    gatewayStatus: $status,
                ),
                default => PaymentValidationResult::pending(
                    gatewayStatus: $status,
                ),
            };
        } catch (PayrexxException $e) {
            Log::error('Payrexx payment validation failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return PaymentValidationResult::failed($e->getMessage());
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): bool
    {
        // Payrexx refunds are handled through their dashboard or separate API
        // For now, log the refund request
        Log::info('Payrexx refund requested', [
            'payment_uuid' => $payment->uuid,
            'amount' => $amount,
            'reason' => $reason,
        ]);

        // TODO: Implement Payrexx refund API when available
        return false;
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        $transaction = $payload['transaction'] ?? [];
        $status = $transaction['status'] ?? null;
        $referenceId = $transaction['referenceId'] ?? null;

        Log::info('Payrexx webhook received', [
            'status' => $status,
            'reference_id' => $referenceId,
            'payload' => $payload,
        ]);

        $eventType = match ($status) {
            'confirmed', 'authorized' => 'payment.success',
            'waiting' => 'payment.pending',
            'declined', 'error' => 'payment.failed',
            'cancelled' => 'payment.cancelled',
            'refunded', 'partially-refunded' => 'payment.refunded',
            default => 'payment.unknown',
        };

        return [
            'event' => $eventType,
            'payment_id' => $referenceId,
            'status' => $status,
            'data' => [
                'gateway_id' => $transaction['id'] ?? null,
                'amount' => isset($transaction['amount']) ? $transaction['amount'] / 100 : null,
                'currency' => $transaction['currency'] ?? 'EUR',
                'invoice' => $transaction['invoice'] ?? null,
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
            $gateway = new PayrexxGatewayRequest();

            // Amount in cents
            $amountCents = (int) round($amount * 100);
            $gateway->setAmount($amountCents);
            $gateway->setVatRate(0);
            $gateway->setCurrency('EUR');

            // Reference
            $gateway->setReferenceId($payment->uuid);

            // Redirect URLs
            $gateway->setSuccessRedirectUrl($successUrl);
            $gateway->setFailedRedirectUrl($failUrl);
            $gateway->setCancelRedirectUrl($cancelUrl);

            // Settings
            $gateway->setPreAuthorization(false);
            $gateway->setReservation(false);
            $gateway->setValidity(config('services.payrexx.checkout_validity_minutes', 30));

            // Purpose/description
            $gateway->setPurpose([
                1 => 'Balance Top-Up: €' . number_format($amount, 2),
            ]);

            /** @var PayrexxGatewayResponse $response */
            $response = $this->client->create($gateway);

            Log::info('Payrexx balance top-up checkout created', [
                'payment_uuid' => $payment->uuid,
                'gateway_id' => $response->getId(),
                'amount' => $amount,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Payrexx,
                checkoutUrl: $response->getLink(),
                gatewayId: (string) $response->getId(),
                referenceId: $payment->uuid,
                amount: $amount,
                metadata: [
                    'payrexx_id' => $response->getId(),
                    'created_at' => $response->getCreatedAt(),
                    'type' => 'balance_topup',
                ],
            );
        } catch (PayrexxException $e) {
            Log::error('Payrexx balance top-up checkout failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Payrexx,
                errorMessage: $e->getMessage(),
                amount: $amount,
            );
        }
    }

    private function appendParams(string $url, string $uuid, string $status): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';
        return "{$url}{$separator}payment_id={$uuid}&status={$status}";
    }

    public function canHandleCallback(\Illuminate\Http\Request $request): bool
    {
        // Payrexx uses webhooks for payment confirmation
        // Callbacks use standard payment_id + status params
        return !empty($request->query('payment_id')) && !empty($request->query('status'));
    }

    public function handleCallback(\Illuminate\Http\Request $request): ?array
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
}
