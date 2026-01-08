<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Only rename if old columns exist (make migration idempotent)
            if (Schema::hasColumn('invoices', 'subtotal_eur')) {
                $table->renameColumn('subtotal_eur', 'subtotal');
            }
            if (Schema::hasColumn('invoices', 'vat_amount_eur')) {
                $table->renameColumn('vat_amount_eur', 'vat_amount');
            }
            if (Schema::hasColumn('invoices', 'total_eur')) {
                $table->renameColumn('total_eur', 'total');
            }
            if (Schema::hasColumn('invoices', 'balance_before_eur')) {
                $table->renameColumn('balance_before_eur', 'balance_before');
            }
            if (Schema::hasColumn('invoices', 'balance_after_eur')) {
                $table->renameColumn('balance_after_eur', 'balance_after');
            }

            // Add currency relationship if not exists
            if (!Schema::hasColumn('invoices', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->after('total')->constrained()->nullOnDelete();
            }

            // Drop old currency_code column if exists
            if (Schema::hasColumn('invoices', 'currency_code')) {
                $table->dropColumn('currency_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('subtotal', 'subtotal_eur');
            $table->renameColumn('vat_amount', 'vat_amount_eur');
            $table->renameColumn('total', 'total_eur');
            $table->renameColumn('balance_before', 'balance_before_eur');
            $table->renameColumn('balance_after', 'balance_after_eur');

            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
            $table->string('currency_code', 3)->default('EUR');
        });
    }
};
