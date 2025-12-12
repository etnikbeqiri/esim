<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name')->nullable();
            $table->string('type')->default('b2c');
            $table->string('stripe_customer_id')->nullable()->unique();
            $table->decimal('discount_percentage', 5, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('vat_number')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index('stripe_customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
