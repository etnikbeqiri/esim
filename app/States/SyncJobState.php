<?php

namespace App\States;

use App\Enums\SyncJobStatus;
use App\Enums\SyncJobType;
use Thunk\Verbs\State;

class SyncJobState extends State
{
    public ?int $sync_job_id = null;
    public ?int $provider_id = null;
    public ?SyncJobType $type = null;
    public SyncJobStatus $status = SyncJobStatus::Pending;
    public int $progress = 0;
    public ?int $total = null;
    public int $processed_items = 0;
    public int $failed_items = 0;
    public int $retry_count = 0;
    public int $max_retries = 3;
    public ?int $started_at_ms = null;  // Unix timestamp in milliseconds
    public ?int $completed_at_ms = null; // Unix timestamp in milliseconds
    public ?int $duration_ms = null;
    public ?string $error_message = null;

    public function getProgressPercentage(): float
    {
        if (!$this->total || $this->total === 0) {
            return 0;
        }
        return round(($this->progress / $this->total) * 100, 2);
    }

    public function canRetry(): bool
    {
        return $this->status->canRetry() && $this->retry_count < $this->max_retries;
    }

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    public function isRunning(): bool
    {
        return $this->status === SyncJobStatus::Running;
    }

    public function isPending(): bool
    {
        return $this->status === SyncJobStatus::Pending;
    }

    public function isCompleted(): bool
    {
        return $this->status === SyncJobStatus::Completed;
    }

    public function isFailed(): bool
    {
        return $this->status === SyncJobStatus::Failed;
    }

    public function getDurationSeconds(): ?float
    {
        if ($this->duration_ms === null) {
            return null;
        }
        return round($this->duration_ms / 1000, 2);
    }

    public function getSuccessRate(): float
    {
        $total = $this->processed_items + $this->failed_items;
        if ($total === 0) {
            return 0;
        }
        return round(($this->processed_items / $total) * 100, 2);
    }
}
