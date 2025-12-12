<?php

namespace App\DTOs\Payment;

use App\Enums\PaymentProvider;

readonly class CheckoutResult
{
    public function __construct(
        public bool $success,
        public PaymentProvider $provider,
        public ?string $checkoutUrl,
        public ?string $gatewayId,
        public ?string $referenceId,
        public float $amount,
        public ?int $currencyId,
        public ?string $errorMessage = null,
        public array $metadata = [],
    ) {}

    public static function success(
        PaymentProvider $provider,
        string $checkoutUrl,
        string $gatewayId,
        string $referenceId,
        float $amount,
        ?int $currencyId = null,
        array $metadata = [],
    ): self {
        return new self(
            success: true,
            provider: $provider,
            checkoutUrl: $checkoutUrl,
            gatewayId: $gatewayId,
            referenceId: $referenceId,
            amount: $amount,
            currencyId: $currencyId,
            metadata: $metadata,
        );
    }

    public static function failed(
        PaymentProvider $provider,
        string $errorMessage,
        float $amount = 0,
        ?int $currencyId = null,
    ): self {
        return new self(
            success: false,
            provider: $provider,
            checkoutUrl: null,
            gatewayId: null,
            referenceId: null,
            amount: $amount,
            currencyId: $currencyId,
            errorMessage: $errorMessage,
        );
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'provider' => $this->provider->value,
            'checkout_url' => $this->checkoutUrl,
            'gateway_id' => $this->gatewayId,
            'reference_id' => $this->referenceId,
            'amount' => $this->amount,
            'currency_id' => $this->currencyId,
            'error_message' => $this->errorMessage,
            'metadata' => $this->metadata,
        ];
    }
}
