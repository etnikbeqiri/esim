<?php

namespace Database\Seeders;

use App\Enums\SettingType;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        // All settings are registered in SettingsRegistrar
        // We don't need to seed defaults as they are defined in code
        // But we can seed some initial custom values if needed

        SystemSetting::firstOrCreate(
            ['key' => 'platform.site_name'],
            [
                'value' => 'eSIM Provider',
                'type' => SettingType::String->value,
                'group' => 'platform',
                'label' => 'Site Name',
                'description' => 'Site name displayed in emails and UI',
            ]
        );
    }
}
