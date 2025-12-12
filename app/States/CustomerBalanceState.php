<?php

namespace App\States;

use Thunk\Verbs\State;

class CustomerBalanceState extends State
{
    public int $customer_id;
    public float $balance = 0.00;
    public float $reserved = 0.00;

    public function getAvailableBalance(): float
    {
        return round($this->balance - $this->reserved, 2);
    }

    public function canDeduct(float $amount): bool
    {
        return $this->getAvailableBalance() >= $amount;
    }

    public function canReserve(float $amount): bool
    {
        return $this->getAvailableBalance() >= $amount;
    }

    public function hasInsufficientBalance(float $amount): bool
    {
        return !$this->canDeduct($amount);
    }

    public function getTotalBalance(): float
    {
        return $this->balance;
    }

    public function getReservedAmount(): float
    {
        return $this->reserved;
    }

    public function hasReservation(): bool
    {
        return $this->reserved > 0;
    }
}
