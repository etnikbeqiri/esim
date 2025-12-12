<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');
            $table->foreignId('package_id')->constrained()->onDelete('restrict');
            $table->foreignId('provider_id')->constrained()->onDelete('restrict');
            $table->string('type');
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('pending');
            $table->decimal('amount_eur', 10, 2);
            $table->decimal('cost_price_eur', 10, 2);
            $table->decimal('profit_eur', 10, 2)->default(0.00);
            $table->string('provider_order_id')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->unsignedTinyInteger('max_retries')->default(10);
            $table->timestamp('next_retry_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->string('failure_code')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['status', 'next_retry_at']);
            $table->index('provider_order_id');
            $table->index('order_number');
            $table->index('created_at');
            $table->index('type');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
