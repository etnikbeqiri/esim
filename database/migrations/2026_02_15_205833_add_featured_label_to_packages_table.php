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
            $table->string('featured_label', 20)->nullable()->after('featured_order');
        });

        // Migrate data from the homepage.featured_package_ids setting
        if (!Schema::hasTable('system_settings')) {
            return;
        }

        $setting = DB::table('system_settings')->where('key', 'homepage.featured_package_ids')->first();

        if ($setting && !empty($setting->value)) {
            $entries = array_filter(array_map('trim', explode(',', $setting->value)));

            foreach ($entries as $order => $entry) {
                $id = null;
                $label = null;

                if (str_contains($entry, '|')) {
                    [$id, $label] = explode('|', $entry, 2);
                } else {
                    $id = $entry;
                }

                $id = (int) $id;
                if ($id <= 0) {
                    continue;
                }

                DB::table('packages')->where('id', $id)->update([
                    'is_featured' => true,
                    'featured_order' => $order,
                    'featured_label' => $label ?: null,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('featured_label');
        });
    }
};
