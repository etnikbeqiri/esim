<?php

namespace App\DTOs\Payment;

use App\Enums\PaymentStatus;

readonly class PaymentValidationResult
{
    public function __construct(
        public bool $success,
        public PaymentStatus $status,
        public ?string $gatewayStatus = null,
        public ?string $transactionId = null,
        public ?float $amount = null,
        public ?string $errorMessage = null,
        public array $metadata = [],
    ) {}

    public static function confirmed(
        ?string $transactionId = null,
        ?float $amount = null,
        ?string $gatewayStatus = null,
        array $metadata = [],
    ): self {
        return new self(
            success: true,
            status: PaymentStatus::Completed,
            gatewayStatus: $gatewayStatus,
            transactionId: $transactionId,
            amount: $amount,
            metadata: $metadata,
        );
    }

    public static function pending(
        ?string $gatewayStatus = null,
        array $metadata = [],
    ): self {
        return new self(
            success: true,
            status: PaymentStatus::Pending,
            gatewayStatus: $gatewayStatus,
            metadata: $metadata,
        );
    }

    public static function failed(
        string $errorMessage,
        ?string $gatewayStatus = null,
        array $metadata = [],
    ): self {
        return new self(
            success: false,
            status: PaymentStatus::Failed,
            gatewayStatus: $gatewayStatus,
            errorMessage: $errorMessage,
            metadata: $metadata,
        );
    }

    public function isCompleted(): bool
    {
        return $this->status === PaymentStatus::Completed;
    }

    public function isPending(): bool
    {
        return $this->status === PaymentStatus::Pending;
    }

    public function isFailed(): bool
    {
        return $this->status === PaymentStatus::Failed;
    }
}
