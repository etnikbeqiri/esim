<?php

namespace App\Models;

use App\Enums\BalanceTransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BalanceTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'customer_id',
        'order_id',
        'payment_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => BalanceTransactionType::class,
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (BalanceTransaction $transaction) {
            if (empty($transaction->uuid)) {
                $transaction->uuid = Str::uuid()->toString();
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function scopeByType($query, BalanceTransactionType $type)
    {
        return $query->where('type', $type);
    }

    public function scopeCredits($query)
    {
        return $query->whereIn('type', [
            BalanceTransactionType::TopUp,
            BalanceTransactionType::Refund,
            BalanceTransactionType::ReservationRelease,
        ]);
    }

    public function scopeDebits($query)
    {
        return $query->whereIn('type', [
            BalanceTransactionType::Purchase,
            BalanceTransactionType::Reservation,
        ]);
    }

    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function isCredit(): bool
    {
        // For adjustments, determine from balance change
        if ($this->type === BalanceTransactionType::Adjustment) {
            return $this->balance_after > $this->balance_before;
        }

        return $this->type->isCredit();
    }

    public function isDebit(): bool
    {
        // For adjustments, determine from balance change
        if ($this->type === BalanceTransactionType::Adjustment) {
            return $this->balance_after < $this->balance_before;
        }

        return $this->type->isDebit();
    }

    public function getSignedAmountAttribute(): float
    {
        // For adjustments, determine sign from balance change
        if ($this->type === BalanceTransactionType::Adjustment) {
            return $this->balance_after >= $this->balance_before ? $this->amount : -$this->amount;
        }

        return $this->isCredit() ? $this->amount : -$this->amount;
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
