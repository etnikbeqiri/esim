<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('iso_code', 2)->unique();
            $table->string('iso_code_3', 3)->nullable();
            $table->string('name');
            $table->string('region')->nullable();
            $table->string('flag_emoji', 10)->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'iso_code']);
            $table->index('region');
            $table->index('is_popular');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
