<?php

namespace App\States;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use Carbon\Carbon;
use Thunk\Verbs\State;

class OrderState extends State
{
    public int $order_id;
    public string $uuid;
    public string $order_number;
    public int $customer_id;
    public int $package_id;
    public int $provider_id;
    public OrderType $type;
    public OrderStatus $status;
    public PaymentStatus $payment_status;
    public float $amount;
    public float $cost_price;
    public float $profit;
    public ?string $provider_order_id = null;
    public int $retry_count = 0;
    public int $max_retries = 10;
    public ?Carbon $next_retry_at = null;
    public ?string $failure_reason = null;
    public ?string $failure_code = null;
    public ?int $payment_id = null;
    public ?int $esim_profile_id = null;
    public ?Carbon $paid_at = null;
    public ?Carbon $completed_at = null;
    public ?Carbon $checkout_expires_at = null;

    public function canTransitionTo(OrderStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function canRetry(): bool
    {
        return $this->status->canRetry() && $this->retry_count < $this->max_retries;
    }

    public function isB2B(): bool
    {
        return $this->type === OrderType::B2B;
    }

    public function isB2C(): bool
    {
        return $this->type === OrderType::B2C;
    }

    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::Completed;
    }

    public function isFailed(): bool
    {
        return $this->status === OrderStatus::Failed;
    }

    public function isPending(): bool
    {
        return $this->status === OrderStatus::Pending;
    }

    public function isProcessing(): bool
    {
        return $this->status === OrderStatus::Processing;
    }

    public function isAwaitingPayment(): bool
    {
        return $this->status === OrderStatus::AwaitingPayment;
    }

    public function getNextRetryDelay(): int
    {
        // Exponential backoff: 5 minutes * 2^retry_count, max 1 hour
        $baseMinutes = 5;
        $delay = $baseMinutes * pow(2, $this->retry_count);
        return min($delay, 60);
    }
}
