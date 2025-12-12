<?php

namespace App\Models;

use App\Enums\SyncJobStatus;
use App\Enums\SyncJobType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SyncJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'type',
        'status',
        'progress',
        'total',
        'processed_items',
        'failed_items',
        'retry_count',
        'max_retries',
        'next_retry_at',
        'started_at',
        'completed_at',
        'duration_ms',
        'error_message',
        'triggered_by',
        'triggered_by_user_id',
        'result',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => SyncJobType::class,
            'status' => SyncJobStatus::class,
            'progress' => 'integer',
            'total' => 'integer',
            'processed_items' => 'integer',
            'failed_items' => 'integer',
            'retry_count' => 'integer',
            'max_retries' => 'integer',
            'next_retry_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'duration_ms' => 'integer',
            'result' => 'array',
            'metadata' => 'array',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function triggeredByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }

    public function scopeByStatus($query, SyncJobStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, SyncJobType $type)
    {
        return $query->where('type', $type);
    }

    public function scopePending($query)
    {
        return $query->where('status', SyncJobStatus::Pending);
    }

    public function scopeRunning($query)
    {
        return $query->where('status', SyncJobStatus::Running);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', SyncJobStatus::Completed);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', SyncJobStatus::Failed);
    }

    public function scopeRetryable($query)
    {
        return $query->failed()
            ->where('retry_count', '<', \DB::raw('max_retries'));
    }

    public function scopeReadyForRetry($query)
    {
        return $query->retryable()
            ->where(function ($q) {
                $q->whereNull('next_retry_at')
                    ->orWhere('next_retry_at', '<=', now());
            });
    }

    public function getProgressPercentageAttribute(): float
    {
        if (!$this->total || $this->total === 0) {
            return 0;
        }
        return round(($this->progress / $this->total) * 100, 2);
    }

    public function getDurationSecondsAttribute(): ?float
    {
        if ($this->duration_ms === null) {
            return null;
        }
        return round($this->duration_ms / 1000, 2);
    }

    public function canRetry(): bool
    {
        return $this->status->canRetry() && $this->retry_count < $this->max_retries;
    }

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    public function markAsRunning(): void
    {
        $this->update([
            'status' => SyncJobStatus::Running,
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(array $result = []): void
    {
        $this->update([
            'status' => SyncJobStatus::Completed,
            'completed_at' => now(),
            'duration_ms' => $this->started_at
                ? now()->diffInMilliseconds($this->started_at)
                : null,
            'result' => $result,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => SyncJobStatus::Failed,
            'completed_at' => now(),
            'duration_ms' => $this->started_at
                ? now()->diffInMilliseconds($this->started_at)
                : null,
            'error_message' => $errorMessage,
        ]);
    }

    public function updateProgress(int $progress, ?int $total = null): void
    {
        $data = ['progress' => $progress];
        if ($total !== null) {
            $data['total'] = $total;
        }
        $this->update($data);
    }
}
