<?php

namespace App\States;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Carbon\Carbon;
use Thunk\Verbs\State;

class PaymentState extends State
{
    public int $payment_id;
    public string $uuid;
    public int $customer_id;
    public ?int $order_id = null;
    public ?int $currency_id = null;
    public PaymentProvider $provider;
    public PaymentType $type;
    public PaymentStatus $status;
    public float $amount;
    public float $refunded_amount = 0.00;
    public ?string $gateway_id = null;
    public ?string $gateway_session_id = null;
    public ?string $transaction_id = null;
    public ?string $idempotency_key = null;
    public ?Carbon $expires_at = null;
    public ?Carbon $completed_at = null;
    public ?string $failure_code = null;
    public ?string $failure_message = null;
    public array $metadata = [];

    public function isSuccessful(): bool
    {
        return $this->status->isSuccessful();
    }

    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }
        return $this->expires_at->isPast();
    }

    public function canRefund(): bool
    {
        return $this->status->canRefund();
    }

    public function getRemainingRefundable(): float
    {
        return max(0, $this->amount - $this->refunded_amount);
    }

    public function canFullRefund(): bool
    {
        return $this->canRefund() && $this->refunded_amount === 0.00;
    }

    public function isPayrexxPayment(): bool
    {
        return $this->provider === PaymentProvider::Payrexx;
    }

    public function isBalancePayment(): bool
    {
        return $this->provider === PaymentProvider::Balance;
    }
}
