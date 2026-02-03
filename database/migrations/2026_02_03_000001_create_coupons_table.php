<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // percentage, fixed_amount
            $table->decimal('value', 10, 2);
            $table->decimal('min_order_amount', 10, 2)->default(0);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedInteger('per_customer_limit')->default(1);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_stackable')->default(false);
            $table->boolean('first_time_only')->default(false);
            $table->json('allowed_countries')->nullable(); // [1, 2, 3]
            $table->json('allowed_providers')->nullable(); // [1, 2, 3]
            $table->json('allowed_packages')->nullable(); // [1, 2, 3]
            $table->json('exclude_packages')->nullable(); // [1, 2, 3]
            $table->json('allowed_customer_types')->nullable(); // ['b2b', 'b2c']
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('is_active');
            $table->index('valid_from');
            $table->index('valid_until');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
