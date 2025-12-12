<?php

namespace App\Events\Sync;

use App\Enums\SyncJobStatus;
use App\Models\SyncJob;
use App\States\SyncJobState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class SyncJobFailed extends Event
{
    #[StateId(SyncJobState::class)]
    public int $sync_job_id;

    public function __construct(
        int $sync_job_id,
        public string $error_message,
    ) {
        $this->sync_job_id = $sync_job_id;
    }

    public function apply(SyncJobState $state): void
    {
        $state->status = SyncJobStatus::Failed;
        $state->completed_at = now();
        $state->error_message = $this->error_message;
        if ($state->started_at) {
            $state->duration_ms = now()->diffInMilliseconds($state->started_at);
        }
    }

    public function handle(SyncJobState $state): void
    {
        SyncJob::where('id', $this->sync_job_id)->update([
            'status' => SyncJobStatus::Failed,
            'completed_at' => $state->completed_at,
            'duration_ms' => $state->duration_ms,
            'error_message' => $this->error_message,
        ]);
    }
}
