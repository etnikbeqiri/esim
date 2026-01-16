<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'name',
        'slug',
        'release_year',
        'model_identifiers',
        'esim_supported',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'release_year' => 'integer',
            'model_identifiers' => 'array',
            'esim_supported' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Device $device) {
            if (empty($device->slug)) {
                $device->slug = static::generateUniqueSlugForBrand(
                    $device->name,
                    $device->brand_id
                );
            }
        });

        static::updating(function (Device $device) {
            if ($device->isDirty('name') && !$device->isDirty('slug')) {
                $device->slug = static::generateUniqueSlugForBrand(
                    $device->name,
                    $device->brand_id,
                    $device->id
                );
            }
        });
    }

    public static function generateUniqueSlugForBrand(
        string $name,
        int $brandId,
        ?int $excludeId = null
    ): string {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)
            ->where('brand_id', $brandId)
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeEsimSupported($query)
    {
        return $query->where('esim_supported', true);
    }

    public function scopeAvailable($query)
    {
        return $query->active()->esimSupported();
    }

    public function scopeByBrand($query, int $brandId)
    {
        return $query->where('brand_id', $brandId);
    }

    public function scopeSearch($query, ?string $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhereHas('brand', function ($brandQuery) use ($search) {
                  $brandQuery->where('name', 'like', "%{$search}%");
              });
        });
    }

    public function getFullNameAttribute(): string
    {
        return $this->brand ? "{$this->brand->name} {$this->name}" : $this->name;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
