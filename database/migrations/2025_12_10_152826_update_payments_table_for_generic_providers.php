<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add generic provider columns
            $table->string('provider')->default('payrexx')->after('customer_id');
            $table->string('gateway_id')->nullable()->after('type');
            $table->string('gateway_session_id')->nullable()->after('gateway_id');
            $table->string('transaction_id')->nullable()->after('gateway_session_id');
            $table->json('metadata')->nullable();
        });

        // Rename amount columns
        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('amount_eur', 'amount');
            $table->renameColumn('refunded_amount_eur', 'refunded_amount');
        });

        // Add indexes
        Schema::table('payments', function (Blueprint $table) {
            $table->index('provider');
            $table->index('gateway_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['provider']);
            $table->dropIndex(['gateway_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('amount', 'amount_eur');
            $table->renameColumn('refunded_amount', 'refunded_amount_eur');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['provider', 'gateway_id', 'gateway_session_id', 'transaction_id', 'metadata']);
        });
    }
};
