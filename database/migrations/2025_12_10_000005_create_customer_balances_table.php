<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->decimal('balance_eur', 12, 2)->default(0.00);
            $table->decimal('reserved_eur', 12, 2)->default(0.00);
            $table->timestamps();

            $table->unique('customer_id');
            $table->index('balance_eur');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_balances');
    }
};
