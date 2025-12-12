<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Currency the customer paid in (for display/receipts)
            $table->foreignId('currency_id')->nullable()->after('type')->constrained('currencies');

            // Original amount in customer's currency (if different from EUR)
            $table->decimal('original_amount', 10, 2)->nullable()->after('amount_eur');

            // Exchange rate used at time of order (for audit trail)
            $table->decimal('exchange_rate_used', 12, 6)->nullable()->after('original_amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn(['currency_id', 'original_amount', 'exchange_rate_used']);
        });
    }
};
