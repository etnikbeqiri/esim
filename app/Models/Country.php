<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'iso_code',
        'iso_code_3',
        'name',
        'region',
        'flag_emoji',
        'is_popular',
        'is_active',
        'is_region',
    ];

    protected function casts(): array
    {
        return [
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'is_region' => 'boolean',
        ];
    }

    public function scopeRegions($query)
    {
        return $query->where('is_region', true);
    }

    public function scopeCountriesOnly($query)
    {
        return $query->where('is_region', false);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    public function scopeByRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->flag_emoji
            ? "{$this->flag_emoji} {$this->name}"
            : $this->name;
    }
}
