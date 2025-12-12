<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rename customer_balances columns
        Schema::table('customer_balances', function (Blueprint $table) {
            $table->renameColumn('balance_eur', 'balance');
            $table->renameColumn('reserved_eur', 'reserved');
        });

        // Rename balance_transactions columns
        Schema::table('balance_transactions', function (Blueprint $table) {
            $table->renameColumn('amount_eur', 'amount');
            $table->renameColumn('balance_before_eur', 'balance_before');
            $table->renameColumn('balance_after_eur', 'balance_after');
        });
    }

    public function down(): void
    {
        // Reverse customer_balances columns
        Schema::table('customer_balances', function (Blueprint $table) {
            $table->renameColumn('balance', 'balance_eur');
            $table->renameColumn('reserved', 'reserved_eur');
        });

        // Reverse balance_transactions columns
        Schema::table('balance_transactions', function (Blueprint $table) {
            $table->renameColumn('amount', 'amount_eur');
            $table->renameColumn('balance_before', 'balance_before_eur');
            $table->renameColumn('balance_after', 'balance_after_eur');
        });
    }
};
