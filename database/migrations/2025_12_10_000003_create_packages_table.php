<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->onDelete('cascade');
            $table->foreignId('country_id')->nullable()->constrained()->onDelete('set null');
            $table->string('provider_package_id');
            $table->string('name');
            $table->string('slug')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('data_mb');
            $table->unsignedInteger('validity_days');
            $table->decimal('cost_price_eur', 10, 2);
            $table->decimal('retail_price_eur', 10, 2);
            $table->string('network_type')->nullable();
            $table->json('supported_networks')->nullable();
            $table->string('coverage_type')->default('local');
            $table->json('coverage_countries')->nullable();
            $table->boolean('sms_included')->default(false);
            $table->boolean('voice_included')->default(false);
            $table->boolean('hotspot_allowed')->default(true);
            $table->boolean('is_active')->default(true);
            $table->boolean('in_stock')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['provider_id', 'provider_package_id']);
            $table->index(['is_active', 'in_stock', 'country_id']);
            $table->index('retail_price_eur');
            $table->index('data_mb');
            $table->index('is_popular');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
