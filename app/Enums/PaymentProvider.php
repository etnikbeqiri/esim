<?php

namespace App\Enums;

enum PaymentProvider: string
{
    case Stripe = 'stripe';
    case Payrexx = 'payrexx';
    case Paysera = 'paysera';
    case Procard = 'procard';
    case Cryptomus = 'cryptomus';
    case Balance = 'balance';

    public function label(): string
    {
        return __('messages.payment_providers.' . $this->value . '.label');
    }

    public function description(): string
    {
        return __('messages.payment_providers.' . $this->value . '.description');
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
                'maestro' => ['name' => 'Maestro', 'icon' => 'maestro'],
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
            self::Paysera => [
                'visa' => ['name' => 'Visa', 'icon' => 'visa'],
                'mastercard' => ['name' => 'Mastercard', 'icon' => 'mastercard'],
                'maestro' => ['name' => 'Maestro', 'icon' => 'maestro'],
                'amex' => ['name' => 'American Express', 'icon' => 'amex'],
            ],
            self::Procard => [
                'visa' => ['name' => 'Visa', 'icon' => 'visa'],
                'mastercard' => ['name' => 'Mastercard', 'icon' => 'mastercard'],
            ],
            self::Cryptomus => [
                'btc' => ['name' => 'Bitcoin', 'icon' => 'btc', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/btc.svg'],
                'eth' => ['name' => 'Ethereum', 'icon' => 'eth', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/eth.svg'],
                'usdt' => ['name' => 'USDT', 'icon' => 'usdt', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/usdt.svg'],
                'bnb' => ['name' => 'BNB', 'icon' => 'bnb', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/bnb.svg'],
                'xrp' => ['name' => 'XRP', 'icon' => 'xrp', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/xrp.svg'],
                'sol' => ['name' => 'Solana', 'icon' => 'sol', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/sol.svg'],
                'ada' => ['name' => 'Cardano', 'icon' => 'ada', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/ada.svg'],
                'doge' => ['name' => 'Dogecoin', 'icon' => 'doge', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/doge.svg'],
                'trx' => ['name' => 'TRON', 'icon' => 'trx', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/trx.svg'],
                'dot' => ['name' => 'Polkadot', 'icon' => 'dot', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/dot.svg'],
                'ltc' => ['name' => 'Litecoin', 'icon' => 'ltc', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/ltc.svg'],
                'usdc' => ['name' => 'USDC', 'icon' => 'usdc', 'logo_url' => 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/usdc.svg'],
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
            self::Paysera => true,
            self::Procard => true,
            self::Cryptomus => true,
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
        $default = config('services.payment.default', 'paysera');

        return self::tryFrom($default) ?? self::Paysera;
    }

    /**
     * Check if this payment provider is active/configured.
     */
    public function isActive(): bool
    {
        return match ($this) {
            self::Stripe => ! empty(config('services.stripe.key')) && ! empty(config('services.stripe.secret')),
            self::Payrexx => ! empty(config('services.payrexx.instance')) && ! empty(config('services.payrexx.secret')),
            self::Paysera => ! empty(config('services.paysera.project_id')) && ! empty(config('services.paysera.password')),
            self::Procard => ! empty(config('services.procard.merchant_id')) && ! empty(config('services.procard.secret_key')),
            self::Cryptomus => ! empty(config('services.cryptomus.payment_key')) && ! empty(config('services.cryptomus.merchant_id')),
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
        return [self::Procard, self::Paysera, self::Cryptomus];
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
