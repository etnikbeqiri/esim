<?php

namespace App\Models;

use App\Enums\CustomerType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'type',
        'stripe_customer_id',
        'discount_percentage',
        'is_active',
        'phone',
        'address',
        'vat_number',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => CustomerType::class,
            'discount_percentage' => 'decimal:2',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function balance(): HasOne
    {
        return $this->hasOne(CustomerBalance::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function balanceTransactions(): HasMany
    {
        return $this->hasMany(BalanceTransaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeB2B($query)
    {
        return $query->where('type', CustomerType::B2B);
    }

    public function scopeB2C($query)
    {
        return $query->where('type', CustomerType::B2C);
    }

    public function isB2B(): bool
    {
        return $this->type === CustomerType::B2B;
    }

    public function isB2C(): bool
    {
        return $this->type === CustomerType::B2C;
    }

    public function hasBalance(): bool
    {
        return $this->type->hasBalance();
    }

    public function getAvailableBalanceAttribute(): float
    {
        return $this->balance?->available_balance ?? 0.00;
    }

    public function calculateDiscountedPrice(float $price): float
    {
        if ($this->discount_percentage <= 0) {
            return $price;
        }
        return round($price * (1 - $this->discount_percentage / 100), 2);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->company_name ?? $this->user->name;
    }
}
