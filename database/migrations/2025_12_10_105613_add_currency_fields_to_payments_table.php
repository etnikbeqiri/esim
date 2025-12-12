<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Currency payment was made in
            $table->foreignId('currency_id')->nullable()->after('type')->constrained('currencies');

            // Original amount in payment currency
            $table->decimal('original_amount', 10, 2)->nullable()->after('amount_eur');

            // Exchange rate used
            $table->decimal('exchange_rate_used', 12, 6)->nullable()->after('original_amount');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn(['currency_id', 'original_amount', 'exchange_rate_used']);
        });
    }
};
