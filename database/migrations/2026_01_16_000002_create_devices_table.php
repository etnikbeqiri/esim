<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->unsignedSmallInteger('release_year')->nullable();
            $table->json('model_identifiers')->nullable();
            $table->boolean('esim_supported')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['brand_id', 'slug']);
            $table->index(['esim_supported', 'is_active']);
            $table->index('release_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
