<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only rename if old _eur columns exist (for environments where migrations ran before the fix)
        if (Schema::hasColumn('orders', 'coupon_discount_amount_eur')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->renameColumn('coupon_discount_amount_eur', 'coupon_discount_amount');
            });
        }

        if (Schema::hasColumn('coupon_usages', 'original_amount_eur')) {
            Schema::table('coupon_usages', function (Blueprint $table) {
                $table->renameColumn('original_amount_eur', 'original_amount');
                $table->renameColumn('discount_amount_eur', 'discount_amount');
                $table->renameColumn('final_amount_eur', 'final_amount');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'coupon_discount_amount')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->renameColumn('coupon_discount_amount', 'coupon_discount_amount_eur');
            });
        }

        if (Schema::hasColumn('coupon_usages', 'original_amount')) {
            Schema::table('coupon_usages', function (Blueprint $table) {
                $table->renameColumn('original_amount', 'original_amount_eur');
                $table->renameColumn('discount_amount', 'discount_amount_eur');
                $table->renameColumn('final_amount', 'final_amount_eur');
            });
        }
    }
};
