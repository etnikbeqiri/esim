<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->string('status')->default('pending');
            $table->unsignedInteger('progress')->default(0);
            $table->unsignedInteger('total')->nullable();
            $table->unsignedInteger('processed_items')->default(0);
            $table->unsignedInteger('failed_items')->default(0);
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->unsignedTinyInteger('max_retries')->default(3);
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->text('error_message')->nullable();
            $table->string('triggered_by')->default('manual');
            $table->foreignId('triggered_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->json('result')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['provider_id', 'type', 'status']);
            $table->index(['status', 'next_retry_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_jobs');
    }
};
