<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Rename _eur columns to simpler names
            $table->renameColumn('subtotal_eur', 'subtotal');
            $table->renameColumn('vat_amount_eur', 'vat_amount');
            $table->renameColumn('total_eur', 'total');
            $table->renameColumn('balance_before_eur', 'balance_before');
            $table->renameColumn('balance_after_eur', 'balance_after');

            // Add currency relationship
            $table->foreignId('currency_id')->nullable()->after('total')->constrained()->nullOnDelete();

            // Drop old currency_code column
            $table->dropColumn('currency_code');
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
