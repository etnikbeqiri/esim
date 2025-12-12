<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rename package price columns (remove _eur suffix)
        Schema::table('packages', function (Blueprint $table) {
            $table->renameColumn('cost_price_eur', 'cost_price');
            $table->renameColumn('retail_price_eur', 'retail_price');
        });

        // Rename order price columns (remove _eur suffix)
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('amount_eur', 'amount');
            $table->renameColumn('cost_price_eur', 'cost_price');
            $table->renameColumn('profit_eur', 'profit');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->renameColumn('cost_price', 'cost_price_eur');
            $table->renameColumn('retail_price', 'retail_price_eur');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('amount', 'amount_eur');
            $table->renameColumn('cost_price', 'cost_price_eur');
            $table->renameColumn('profit', 'profit_eur');
        });
    }
};
