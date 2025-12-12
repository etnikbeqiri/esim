<?php

namespace App\Contracts;

use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\PaymentProvider;
use App\Models\Order;
use App\Models\Payment;

interface PaymentGatewayContract
{
    /**
     * Get the provider identifier.
     */
    public function getProvider(): PaymentProvider;

    /**
     * Create a checkout session for an order.
     */
    public function createCheckout(
        Order $order,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        string $language = 'en',
    ): CheckoutResult;

    /**
     * Validate/check the status of a payment.
     */
    public function validatePayment(Payment $payment): PaymentValidationResult;

    /**
     * Process a refund for a payment.
     */
    public function refund(Payment $payment, float $amount, ?string $reason = null): bool;

    /**
     * Handle webhook payload from the provider.
     *
     * @return array{event: string, payment_id: ?string, status: ?string, data: array}
     */
    public function handleWebhook(array $payload, ?string $signature = null): array;
}
