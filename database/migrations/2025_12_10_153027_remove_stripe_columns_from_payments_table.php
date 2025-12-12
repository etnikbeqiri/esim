<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // For SQLite, we need to recreate the table without the unwanted columns
        // Drop indexes first
        Schema::table('payments', function (Blueprint $table) {
            // Try to drop indexes if they exist
            try {
                $table->dropIndex('payments_stripe_session_id_index');
            } catch (\Exception $e) {}
            try {
                $table->dropIndex('payments_stripe_payment_intent_id_index');
            } catch (\Exception $e) {}
        });

        // SQLite doesn't support dropping multiple columns in one statement
        // We need to drop them one at a time
        $columnsToDrop = [
            'stripe_session_id',
            'stripe_payment_intent_id',
            'stripe_charge_id',
            'stripe_customer_id',
            'stripe_payment_method_id',
            'card_brand',
            'card_last4',
            'card_exp_month',
            'card_exp_year',
            'stripe_metadata',
            'original_amount',
            'exchange_rate_used',
        ];

        foreach ($columnsToDrop as $column) {
            if (Schema::hasColumn('payments', $column)) {
                Schema::table('payments', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('stripe_session_id')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_payment_method_id')->nullable();
            $table->string('card_brand')->nullable();
            $table->string('card_last4', 4)->nullable();
            $table->unsignedTinyInteger('card_exp_month')->nullable();
            $table->unsignedSmallInteger('card_exp_year')->nullable();
            $table->json('stripe_metadata')->nullable();
            $table->decimal('original_amount', 10, 2)->nullable();
            $table->decimal('exchange_rate_used', 12, 6)->nullable();
        });
    }
};
