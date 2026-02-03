<?php

namespace App\Models;

use App\Enums\CouponType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'usage_limit',
        'usage_count',
        'per_customer_limit',
        'valid_from',
        'valid_until',
        'is_active',
        'is_stackable',
        'first_time_only',
        'allowed_countries',
        'allowed_providers',
        'allowed_packages',
        'exclude_packages',
        'allowed_customer_types',
    ];

    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'usage_count' => 'integer',
            'per_customer_limit' => 'integer',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
            'is_stackable' => 'boolean',
            'first_time_only' => 'boolean',
            'allowed_countries' => 'array',
            'allowed_providers' => 'array',
            'allowed_packages' => 'array',
            'exclude_packages' => 'array',
            'allowed_customer_types' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Coupon $coupon) {
            if (empty($coupon->code)) {
                $coupon->code = self::generateCode();
            } else {
                $coupon->code = strtoupper(str_replace(' ', '', $coupon->code));
            }
        });

        static::updating(function (Coupon $coupon) {
            if ($coupon->isDirty('code')) {
                $coupon->code = strtoupper(str_replace(' ', '', $coupon->code));
            }
        });
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>', now());
            });
    }

    public function scopeOfType($query, CouponType $type)
    {
        return $query->where('type', $type);
    }

    public function scopeExpired($query)
    {
        return $query->where('valid_until', '<', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('valid_from', '>', now());
    }

    public function scopeForCountry($query, int $countryId)
    {
        return $query->where(function ($q) use ($countryId) {
            $q->whereNull('allowed_countries')
                ->orWhereJsonContains('allowed_countries', $countryId);
        });
    }

    public function scopeForProvider($query, int $providerId)
    {
        return $query->where(function ($q) use ($providerId) {
            $q->whereNull('allowed_providers')
                ->orWhereJsonContains('allowed_providers', $providerId);
        });
    }

    public function scopeForPackage($query, int $packageId)
    {
        return $query->where(function ($q) use ($packageId) {
            $q->whereNull('allowed_packages')
                ->orWhereJsonContains('allowed_packages', $packageId);
        });
    }

    public function scopeForCustomerType($query, string $customerType)
    {
        return $query->where(function ($q) use ($customerType) {
            $q->whereNull('allowed_customer_types')
                ->orWhereJsonContains('allowed_customer_types', $customerType);
        });
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->valid_from && $this->valid_from->isFuture()) {
            return false;
        }

        if ($this->valid_until && $this->valid_until->isPast()) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function isExpired(): bool
    {
        return $this->valid_until && $this->valid_until->isPast();
    }

    public function isUpcoming(): bool
    {
        return $this->valid_from && $this->valid_from->isFuture();
    }

    public function hasReachedUsageLimit(): bool
    {
        return $this->usage_limit !== null && $this->usage_count >= $this->usage_limit;
    }

    public function getRemainingUsagesAttribute(): ?int
    {
        if ($this->usage_limit === null) {
            return null;
        }

        return max(0, $this->usage_limit - $this->usage_count);
    }

    public function getUsagePercentageAttribute(): float
    {
        if ($this->usage_limit === null) {
            return 0;
        }

        if ($this->usage_limit == 0) {
            return 100;
        }

        return min(100, round(($this->usage_count / $this->usage_limit) * 100, 2));
    }

    public function getDiscountDisplayAttribute(): string
    {
        return $this->type->icon() . number_format($this->value, $this->type === CouponType::Percentage ? 0 : 2)
            . ($this->type === CouponType::Percentage ? '%' : '');
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    public function decrementUsage(): void
    {
        if ($this->usage_count > 0) {
            $this->decrement('usage_count');
        }
    }

    public function getCustomerUsageCount(int $customerId): int
    {
        return $this->usages()->where('customer_id', $customerId)->count();
    }

    public function hasCustomerReachedLimit(int $customerId): bool
    {
        return $this->getCustomerUsageCount($customerId) >= $this->per_customer_limit;
    }

    public static function generateCode(int $length = 8): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
        $code = '';

        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }

        return $code;
    }

    public static function findValidCode(string $code): ?self
    {
        return self::valid()
            ->where('code', strtoupper(str_replace(' ', '', $code)))
            ->first();
    }
}
