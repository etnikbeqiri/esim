<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case WaitingOnCustomer = 'waiting_on_customer';
    case Resolved = 'resolved';
    case Closed = 'closed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::InProgress => 'In Progress',
            self::WaitingOnCustomer => 'Waiting on Customer',
            self::Resolved => 'Resolved',
            self::Closed => 'Closed',
            self::Archived => 'Archived',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Open => 'green',
            self::InProgress => 'blue',
            self::WaitingOnCustomer => 'yellow',
            self::Resolved => 'green',
            self::Closed => 'gray',
            self::Archived => 'gray',
        };
    }

    public function canTransitionTo(self $new): bool
    {
        return match ($this) {
            self::Open => in_array($new, [self::InProgress, self::Closed]),
            self::InProgress => in_array($new, [self::WaitingOnCustomer, self::Resolved, self::Closed]),
            self::WaitingOnCustomer => in_array($new, [self::InProgress, self::Resolved, self::Closed]),
            self::Resolved => in_array($new, [self::Closed]),
            self::Closed => in_array($new, [self::Archived]),
            self::Archived => false,
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Closed, self::Archived]);
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Open, self::InProgress, self::WaitingOnCustomer]);
    }

    public function canAddMessage(): bool
    {
        return !$this->isTerminal();
    }
}
