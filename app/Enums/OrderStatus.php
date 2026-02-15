<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case AwaitingPayment = 'awaiting_payment';
    case Processing = 'processing';
    case ProviderPurchased = 'provider_purchased';
    case Completed = 'completed';
    case Failed = 'failed';
    case Refunded = 'refunded';
    case Cancelled = 'cancelled';
    case PendingRetry = 'pending_retry';
    case AdminReview = 'admin_review';

    public function canTransitionTo(self $new): bool
    {
        return match ($this) {
            self::Pending => in_array($new, [self::AwaitingPayment, self::Processing, self::Cancelled]),
            self::AwaitingPayment => in_array($new, [self::Processing, self::Cancelled, self::Failed]),
            self::Processing => in_array($new, [self::ProviderPurchased, self::Failed, self::PendingRetry, self::AdminReview]),
            self::ProviderPurchased => in_array($new, [self::Completed, self::Failed, self::AdminReview]),
            self::PendingRetry => in_array($new, [self::Processing, self::Failed, self::Cancelled]),
            self::AdminReview => in_array($new, [self::Processing, self::ProviderPurchased, self::Failed, self::Cancelled]),
            self::Completed => in_array($new, [self::Refunded]),
            self::Failed => in_array($new, [self::PendingRetry]),
            default => false,
        };
    }

    public function label(): string
    {
        return trans('messages.statuses.' . $this->value);
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'gray',
            self::AwaitingPayment => 'yellow',
            self::Processing => 'blue',
            self::ProviderPurchased => 'cyan',
            self::Completed => 'green',
            self::Failed => 'red',
            self::Refunded => 'purple',
            self::Cancelled => 'gray',
            self::PendingRetry => 'orange',
            self::AdminReview => 'red',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Refunded, self::Cancelled]);
    }

    public function isAwaitingAdminReview(): bool
    {
        return $this === self::AdminReview;
    }

    public function canRetry(): bool
    {
        return in_array($this, [self::Processing, self::Failed, self::PendingRetry, self::AdminReview, self::ProviderPurchased]);
    }
}
