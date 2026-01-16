<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\PaymentProvider;
use App\Models\Currency;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeGateway implements PaymentGatewayContract
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function getProvider(): PaymentProvider
    {
        return PaymentProvider::Stripe;
    }

    // Stripe minimum amounts by currency (in cents/smallest unit)
    private const MINIMUM_AMOUNTS = [
        'eur' => 50,  // €0.50
        'usd' => 50,  // $0.50
        'gbp' => 30,  // £0.30
        'chf' => 50,  // CHF 0.50
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

            // Check Stripe minimum amount
            $minimumCents = self::MINIMUM_AMOUNTS[$currencyCode] ?? 50;
            if ($amountCents < $minimumCents) {
                $minimumAmount = $minimumCents / 100;
                return CheckoutResult::failed(
                    provider: PaymentProvider::Stripe,
                    errorMessage: "Minimum order amount is €{$minimumAmount}",
                    amount: $order->amount,
                );
            }

            // Build line item description
            $description = $order->package
                ? "eSIM Package: {$order->package->name}"
                : "eSIM Order #{$order->order_number}";

            $session = Session::create([
                'payment_method_types' => ['card'],
                'mode' => 'payment',
                'line_items' => [[
                    'price_data' => [
                        'currency' => $currencyCode,
                        'product_data' => [
                            'name' => $description,
                        ],
                        'unit_amount' => $amountCents,
                    ],
                    'quantity' => 1,
                ]],
                'client_reference_id' => $order->uuid,
                'customer_email' => $order->customer_email,
                'success_url' => $this->appendParams($successUrl, $order->uuid, 'success'),
                'cancel_url' => $this->appendParams($cancelUrl, $order->uuid, 'cancelled'),
                'expires_at' => now()->addMinutes(30)->timestamp,
                'metadata' => [
                    'order_uuid' => $order->uuid,
                    'order_id' => $order->id,
                ],
            ]);

            Log::info('Stripe checkout created', [
                'order_uuid' => $order->uuid,
                'session_id' => $session->id,
                'url' => $session->url,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Stripe,
                checkoutUrl: $session->url,
                gatewayId: $session->id,
                referenceId: $order->uuid,
                amount: $order->amount,
                currencyId: $currency?->id,
                metadata: [
                    'stripe_session_id' => $session->id,
                    'expires_at' => $session->expires_at,
                ],
            );
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout failed', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);

            // Provide user-friendly error messages
            $errorMessage = match (true) {
                str_contains($e->getMessage(), 'Invalid URL') ||
                str_contains($e->getMessage(), 'Not a valid URL') =>
                    'Payment service configuration error. Please contact support or try again later.',
                str_contains($e->getMessage(), 'api_key') =>
                    'Payment service is temporarily unavailable. Please try again later.',
                default => 'Unable to process payment. Please try again or use a different payment method.',
            };

            return CheckoutResult::failed(
                provider: PaymentProvider::Stripe,
                errorMessage: $errorMessage,
                amount: $order->amount,
            );
        }
    }

    public function validatePayment(Payment $payment): PaymentValidationResult
    {
        try {
            $sessionId = $payment->gateway_id;
            if (!$sessionId) {
                return PaymentValidationResult::failed('No session ID found for payment');
            }

            $session = Session::retrieve($sessionId);
            $status = $session->payment_status;

            Log::info('Stripe payment validation', [
                'payment_uuid' => $payment->uuid,
                'session_status' => $session->status,
                'payment_status' => $status,
            ]);

            return match ($status) {
                'paid' => PaymentValidationResult::confirmed(
                    transactionId: $session->payment_intent,
                    amount: $session->amount_total / 100,
                    gatewayStatus: $status,
                    metadata: [
                        'session_id' => $session->id,
                        'payment_intent' => $session->payment_intent,
                    ],
                ),
                'unpaid' => PaymentValidationResult::pending(
                    gatewayStatus: $status,
                ),
                'no_payment_required' => PaymentValidationResult::confirmed(
                    transactionId: $session->id,
                    amount: 0,
                    gatewayStatus: $status,
                ),
                default => PaymentValidationResult::pending(
                    gatewayStatus: $status,
                ),
            };
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment validation failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return PaymentValidationResult::failed($e->getMessage());
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): bool
    {
        Log::info('Stripe refund requested', [
            'payment_uuid' => $payment->uuid,
            'amount' => $amount,
            'reason' => $reason,
        ]);

        // TODO: Implement Stripe refund
        return false;
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        $event = $payload;

        // If signature provided, verify it
        if ($signature && config('services.stripe.webhook_secret')) {
            try {
                $rawPayload = json_encode($payload);
                $event = Webhook::constructEvent(
                    $rawPayload,
                    $signature,
                    config('services.stripe.webhook_secret')
                );
                $event = $event->toArray();
            } catch (\Exception $e) {
                Log::warning('Stripe webhook signature verification failed', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $type = $event['type'] ?? null;
        $data = $event['data']['object'] ?? [];

        Log::info('Stripe webhook received', [
            'type' => $type,
            'data' => $data,
        ]);

        $eventType = match ($type) {
            'checkout.session.completed' => 'payment.success',
            'checkout.session.expired' => 'payment.failed',
            'payment_intent.succeeded' => 'payment.success',
            'payment_intent.payment_failed' => 'payment.failed',
            'charge.refunded' => 'payment.refunded',
            default => 'payment.unknown',
        };

        $referenceId = $data['client_reference_id']
            ?? $data['metadata']['order_uuid']
            ?? null;

        return [
            'event' => $eventType,
            'payment_id' => $referenceId,
            'status' => $type,
            'data' => [
                'gateway_id' => $data['id'] ?? null,
                'payment_intent' => $data['payment_intent'] ?? null,
                'amount' => isset($data['amount_total']) ? $data['amount_total'] / 100 : null,
                'currency' => $data['currency'] ?? 'eur',
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
        ?string $customerEmail = null,
    ): CheckoutResult {
        try {
            $amountCents = (int) round($amount * 100);

            // Check Stripe minimum amount
            $minimumCents = self::MINIMUM_AMOUNTS['eur'] ?? 50;
            if ($amountCents < $minimumCents) {
                $minimumAmount = $minimumCents / 100;
                return CheckoutResult::failed(
                    provider: PaymentProvider::Stripe,
                    errorMessage: "Minimum top-up amount is €{$minimumAmount}",
                    amount: $amount,
                );
            }

            $session = Session::create([
                'payment_method_types' => ['card'],
                'mode' => 'payment',
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => 'Balance Top-Up',
                            'description' => 'Add €' . number_format($amount, 2) . ' to your account balance',
                        ],
                        'unit_amount' => $amountCents,
                    ],
                    'quantity' => 1,
                ]],
                'client_reference_id' => $payment->uuid,
                'customer_email' => $customerEmail,
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'expires_at' => now()->addMinutes(30)->timestamp,
                'metadata' => [
                    'payment_uuid' => $payment->uuid,
                    'payment_id' => $payment->id,
                    'type' => 'balance_topup',
                ],
            ]);

            Log::info('Stripe balance top-up checkout created', [
                'payment_uuid' => $payment->uuid,
                'session_id' => $session->id,
                'amount' => $amount,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Stripe,
                checkoutUrl: $session->url,
                gatewayId: $session->id,
                referenceId: $payment->uuid,
                amount: $amount,
                metadata: [
                    'stripe_session_id' => $session->id,
                    'expires_at' => $session->expires_at,
                    'type' => 'balance_topup',
                ],
            );
        } catch (ApiErrorException $e) {
            Log::error('Stripe balance top-up checkout failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            $errorMessage = match (true) {
                str_contains($e->getMessage(), 'Invalid URL') ||
                str_contains($e->getMessage(), 'Not a valid URL') =>
                    'Payment service configuration error. Please contact support or try again later.',
                str_contains($e->getMessage(), 'api_key') =>
                    'Payment service is temporarily unavailable. Please try again later.',
                default => 'Unable to process payment. Please try again or use a different payment method.',
            };

            return CheckoutResult::failed(
                provider: PaymentProvider::Stripe,
                errorMessage: $errorMessage,
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
        // Stripe uses webhooks for payment confirmation
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
