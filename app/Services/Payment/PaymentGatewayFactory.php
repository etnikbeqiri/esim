<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\Enums\PaymentProvider;
use InvalidArgumentException;

class PaymentGatewayFactory
{
    /**
     * Create a payment gateway instance for the given provider.
     */
    public function make(PaymentProvider $provider): PaymentGatewayContract
    {
        return match ($provider) {
            PaymentProvider::Stripe => app(StripeGateway::class),
            PaymentProvider::Payrexx => app(PayrexxGateway::class),
            PaymentProvider::Paysera => app(PayseraGateway::class),
            PaymentProvider::Procard => app(ProcardGateway::class),
            PaymentProvider::Balance => app(BalanceGateway::class),
        };
    }

    /**
     * Get the default payment gateway.
     */
    public function default(): PaymentGatewayContract
    {
        $default = config('services.payment.default', 'paysera');
        $provider = PaymentProvider::tryFrom($default) ?? PaymentProvider::Paysera;

        return $this->make($provider);
    }

    /**
     * Create a gateway from string provider name.
     */
    public function fromString(string $provider): PaymentGatewayContract
    {
        $paymentProvider = PaymentProvider::tryFrom($provider);

        if (!$paymentProvider) {
            throw new InvalidArgumentException("Unknown payment provider: {$provider}");
        }

        return $this->make($paymentProvider);
    }
}
