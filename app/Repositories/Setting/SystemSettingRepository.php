<?php

namespace App\Repositories\Setting;

use App\Contracts\Setting\SettingRepositoryContract;
use App\Models\SystemSetting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SystemSettingRepository implements SettingRepositoryContract
{
    public function all(): Collection
    {
        return SystemSetting::all();
    }

    public function get(string $key): ?array
    {
        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return null;
        }

        return [
            'key' => $setting->key,
            'value' => $setting->value,
            'type' => $setting->type,
            'group' => $setting->group,
            'label' => $setting->label,
            'description' => $setting->description,
        ];
    }

    public function exists(string $key): bool
    {
        return SystemSetting::where('key', $key)->exists();
    }

    public function set(string $key, string $value, string $type): bool
    {
        return DB::table('system_settings')
            ->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'type' => $type, 'updated_at' => now()]
            ) > 0;
    }

    public function delete(string $key): bool
    {
        return SystemSetting::where('key', $key)->delete() > 0;
    }

    public function getByGroup(string $group): Collection
    {
        return SystemSetting::where('group', $group)->get();
    }

    public function clear(): bool
    {
        return SystemSetting::query()->delete() > 0;
    }

    public function getMultiple(array $keys): array
    {
        $settings = SystemSetting::whereIn('key', $keys)->get()->keyBy('key');

        $results = [];

        foreach ($keys as $key) {
            $setting = $settings->get($key);

            $results[$key] = $setting ? [
                'key' => $setting->key,
                'value' => $setting->value,
                'type' => $setting->type,
                'group' => $setting->group,
                'label' => $setting->label,
                'description' => $setting->description,
            ] : null;
        }

        return $results;
    }

    /**
     * Set multiple settings in a single transaction.
     */
    public function setMultiple(array $settings): bool
    {
        return DB::transaction(function () use ($settings) {
            foreach ($settings as $key => $data) {
                DB::table('system_settings')
                    ->updateOrInsert(
                        ['key' => $key],
                        [
                            'value' => $data['value'],
                            'type' => $data['type'],
                            'group' => $data['group'] ?? null,
                            'label' => $data['label'] ?? null,
                            'description' => $data['description'] ?? null,
                            'updated_at' => now(),
                        ]
                    );
            }

            return true;
        });
    }
}
