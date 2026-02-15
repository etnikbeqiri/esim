<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory;

    /**
     * Hide sensitive provider-related fields from API responses.
     */
    protected $hidden = [
        'provider_id',
        'provider_package_id',
        'cost_price',
        'source_cost_price',
        'source_currency_id',
        'custom_retail_price',
    ];

    protected $fillable = [
        'provider_id',
        'country_id',
        'provider_package_id',
        'source_currency_id',
        'source_cost_price',
        'name',
        'slug',
        'description',
        'data_mb',
        'validity_days',
        'cost_price',
        'retail_price',
        'custom_retail_price',
        'network_type',
        'supported_networks',
        'coverage_type',
        'coverage_countries',
        'sms_included',
        'voice_included',
        'hotspot_allowed',
        'is_active',
        'in_stock',
        'is_popular',
        'is_featured',
        'show_on_homepage',
        'featured_order',
        'featured_label',
        'metadata',
        'last_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'data_mb' => 'integer',
            'validity_days' => 'integer',
            'source_cost_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'retail_price' => 'decimal:2',
            'custom_retail_price' => 'decimal:2',
            'featured_order' => 'integer',
            'supported_networks' => 'array',
            'coverage_countries' => 'array',
            'sms_included' => 'boolean',
            'voice_included' => 'boolean',
            'hotspot_allowed' => 'boolean',
            'is_active' => 'boolean',
            'in_stock' => 'boolean',
            'is_popular' => 'boolean',
            'is_featured' => 'boolean',
            'show_on_homepage' => 'boolean',
            'metadata' => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Package $package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function sourceCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'source_currency_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    public function scopeAvailable($query)
    {
        return $query->active()->inStock();
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCountry($query, int $countryId)
    {
        return $query->where('country_id', $countryId);
    }

    public function scopeByProvider($query, int $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    public function getDataGbAttribute(): float
    {
        return round($this->data_mb / 1024, 2);
    }

    public function getDataLabelAttribute(): string
    {
        if ($this->data_mb >= 1024) {
            $gb = round($this->data_mb / 1024, 1);
            return $gb == intval($gb) ? intval($gb) . ' GB' : $gb . ' GB';
        }
        return $this->data_mb . ' MB';
    }

    public function getValidityLabelAttribute(): string
    {
        return $this->validity_days . ' ' . Str::plural('day', $this->validity_days);
    }

    public function getProfitMarginAttribute(): float
    {
        if ($this->cost_price == 0) {
            return 0;
        }
        return round(($this->retail_price - $this->cost_price) / $this->cost_price * 100, 2);
    }

    public function isAvailable(): bool
    {
        return $this->is_active && $this->in_stock;
    }

    /**
     * Get the effective retail price (custom if set, otherwise system calculated).
     */
    public function getEffectiveRetailPriceAttribute(): string
    {
        return $this->custom_retail_price ?? $this->retail_price;
    }

    /**
     * Check if using custom price override.
     */
    public function hasCustomPrice(): bool
    {
        return $this->custom_retail_price !== null;
    }
}
