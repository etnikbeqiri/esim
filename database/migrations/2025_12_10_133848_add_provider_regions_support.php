<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add custom_regions to providers for provider-specific region codes
        Schema::table('providers', function (Blueprint $table) {
            $table->json('custom_regions')->nullable()->after('metadata');
        });

        // Add is_region to countries to distinguish regions from actual countries
        Schema::table('countries', function (Blueprint $table) {
            $table->boolean('is_region')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn('custom_regions');
        });

        Schema::table('countries', function (Blueprint $table) {
            $table->dropColumn('is_region');
        });
    }
};
