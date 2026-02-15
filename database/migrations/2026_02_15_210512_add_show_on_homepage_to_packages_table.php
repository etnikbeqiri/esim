<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->boolean('show_on_homepage')->default(false)->after('is_featured');
        });

        // Migrate: packages that already have featured_label or featured_order
        // from the previous migration were homepage-featured via the old setting
        DB::table('packages')
            ->where('featured_label', '!=', null)
            ->orWhere(function ($q) {
                $q->where('is_featured', true)
                    ->where('featured_order', '>', 0);
            })
            ->update(['show_on_homepage' => true]);

        // Also migrate from the system_settings as a fallback
        if (Schema::hasTable('system_settings')) {
            $setting = DB::table('system_settings')
                ->where('key', 'homepage.featured_package_ids')
                ->first();

            if ($setting && !empty($setting->value)) {
                $entries = array_filter(array_map('trim', explode(',', $setting->value)));
                $ids = [];

                foreach ($entries as $entry) {
                    if (str_contains($entry, '|')) {
                        [$id] = explode('|', $entry, 2);
                    } else {
                        $id = $entry;
                    }
                    $id = (int) $id;
                    if ($id > 0) {
                        $ids[] = $id;
                    }
                }

                if (!empty($ids)) {
                    DB::table('packages')
                        ->whereIn('id', $ids)
                        ->update(['show_on_homepage' => true]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('show_on_homepage');
        });
    }
};
