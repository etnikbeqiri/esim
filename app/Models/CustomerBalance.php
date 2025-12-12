<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'balance',
        'reserved',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'reserved' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function getAvailableBalanceAttribute(): float
    {
        return round($this->balance - $this->reserved, 2);
    }

    public function canDeduct(float $amount): bool
    {
        return $this->available_balance >= $amount;
    }

    public function canReserve(float $amount): bool
    {
        return $this->available_balance >= $amount;
    }

    public function hasInsufficientBalance(float $amount): bool
    {
        return !$this->canDeduct($amount);
    }
}
