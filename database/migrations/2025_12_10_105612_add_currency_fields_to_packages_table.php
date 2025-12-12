<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            // Source currency (what provider charges in)
            $table->foreignId('source_currency_id')->nullable()->after('provider_package_id')->constrained('currencies');
            $table->decimal('source_cost_price', 10, 2)->nullable()->after('source_currency_id'); // Original price from provider

            // Rename existing columns for clarity (these are in EUR - system currency)
            // cost_price_eur and retail_price_eur already exist, they stay as EUR
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['source_currency_id']);
            $table->dropColumn(['source_currency_id', 'source_cost_price']);
        });
    }
};
