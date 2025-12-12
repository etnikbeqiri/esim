<?php

namespace App\Enums;

enum PaymentProvider: string
{
    case Stripe = 'stripe';
    case Payrexx = 'payrexx';
    case Balance = 'balance';

    public function label(): string
    {
        return match ($this) {
            self::Stripe => 'Stripe',
            self::Payrexx => 'Payrexx',
            self::Balance => 'Balance',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Stripe => 'Pay securely with card',
            self::Payrexx => 'Pay securely with card or other methods',
            self::Balance => 'Pay from your account balance',
        };
    }

    /**
     * Get the payment methods supported by this provider.
     * These are used for displaying icons on the checkout page.
     *
     * @return array<string, array{name: string, icon: string}>
     */
    public function paymentMethods(): array
    {
        return match ($this) {
            self::Stripe => [
                'visa' => ['name' => 'Visa', 'icon' => 'visa'],
                'mastercard' => ['name' => 'Mastercard', 'icon' => 'mastercard'],
                'amex' => ['name' => 'American Express', 'icon' => 'amex'],
                'discover' => ['name' => 'Discover', 'icon' => 'discover'],
                'diners' => ['name' => 'Diners Club', 'icon' => 'diners'],
                'jcb' => ['name' => 'JCB', 'icon' => 'jcb'],
            ],
            self::Payrexx => [
                'visa' => ['name' => 'Visa', 'icon' => 'visa'],
                'mastercard' => ['name' => 'Mastercard', 'icon' => 'mastercard'],
                'amex' => ['name' => 'American Express', 'icon' => 'amex'],
                'maestro' => ['name' => 'Maestro', 'icon' => 'maestro'],
                'discover' => ['name' => 'Discover', 'icon' => 'discover'],
                'diners' => ['name' => 'Diners Club', 'icon' => 'diners'],
                'jcb' => ['name' => 'JCB', 'icon' => 'jcb'],
                'unionpay' => ['name' => 'UnionPay', 'icon' => 'unionpay'],
                'paypal' => ['name' => 'PayPal', 'icon' => 'paypal'],
            ],
            self::Balance => [
                'balance' => ['name' => 'Account Balance', 'icon' => 'wallet'],
            ],
        };
    }

    /**
     * Get provider info array for frontend display.
     */
    public function toArray(): array
    {
        return [
            'id' => $this->value,
            'name' => $this->label(),
            'description' => $this->description(),
            'payment_methods' => array_values($this->paymentMethods()),
        ];
    }

    public function supportsWebhooks(): bool
    {
        return match ($this) {
            self::Stripe => true,
            self::Payrexx => true,
            self::Balance => false,
        };
    }

    public function supportsRefunds(): bool
    {
        return true;
    }

    /**
     * Get the default payment provider from config.
     */
    public static function default(): self
    {
        $default = config('services.payment.default', 'stripe');

        return self::tryFrom($default) ?? self::Stripe;
    }

    /**
     * Check if this payment provider is active/configured.
     */
    public function isActive(): bool
    {
        return match ($this) {
            self::Stripe => !empty(config('services.stripe.key')) && !empty(config('services.stripe.secret')),
            self::Payrexx => !empty(config('services.payrexx.instance')) && !empty(config('services.payrexx.secret')),
            self::Balance => true, // Balance is always available for B2B
        };
    }

    /**
     * Get all available providers for public checkout (excludes Balance).
     *
     * @return array<self>
     */
    public static function publicProviders(): array
    {
        return [self::Stripe, self::Payrexx];
    }

    /**
     * Get all active providers for public checkout (excludes Balance, only configured ones).
     *
     * @return array<self>
     */
    public static function activePublicProviders(): array
    {
        return array_filter(
            self::publicProviders(),
            fn (self $provider) => $provider->isActive()
        );
    }

    /**
     * Get active providers as array for frontend.
     *
     * @return array<array{id: string, name: string, description: string, payment_methods: array}>
     */
    public static function activePublicProvidersArray(): array
    {
        return array_values(
            array_map(
                fn (self $provider) => $provider->toArray(),
                self::activePublicProviders()
            )
        );
    }
}
