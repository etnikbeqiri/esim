<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('esim_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('iccid')->unique();
            $table->string('activation_code');
            $table->string('smdp_address')->nullable();
            $table->text('qr_code_data')->nullable();
            $table->string('lpa_string')->nullable();
            $table->string('pin')->nullable();
            $table->string('puk')->nullable();
            $table->string('apn')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('data_used_bytes')->default(0);
            $table->unsignedBigInteger('data_total_bytes');
            $table->boolean('is_activated')->default(false);
            $table->boolean('topup_available')->default(false);
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_usage_check_at')->nullable();
            $table->json('provider_data')->nullable();
            $table->timestamps();

            $table->index('iccid');
            $table->index(['status', 'expires_at']);
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('esim_profiles');
    }
};
