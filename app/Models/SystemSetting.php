<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the setting value cast to its type.
     */
    public function getCastedValueAttribute(): mixed
    {
        return SettingType::from($this->type)->fromStorage($this->value);
    }
}
