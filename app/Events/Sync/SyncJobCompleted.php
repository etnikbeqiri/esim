<?php

namespace App\Events\Sync;

use App\Enums\SyncJobStatus;
use App\Models\Provider;
use App\Models\SyncJob;
use App\States\SyncJobState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class SyncJobCompleted extends Event
{
    #[StateId(SyncJobState::class)]
    public int $sync_job_id;

    public function __construct(
        int $sync_job_id,
        public array $result = [],
    ) {
        $this->sync_job_id = $sync_job_id;
    }

    public function apply(SyncJobState $state): void
    {
        $state->status = SyncJobStatus::Completed;
        $state->completed_at_ms = (int) (microtime(true) * 1000);
        if ($state->started_at_ms) {
            $state->duration_ms = $state->completed_at_ms - $state->started_at_ms;
        }
    }

    public function handle(SyncJobState $state): void
    {
        // Get final counts from result
        $processed = $this->result['processed'] ?? $state->progress;
        $total = $this->result['total'] ?? $state->total;

        SyncJob::where('id', $this->sync_job_id)->update([
            'status' => SyncJobStatus::Completed,
            'completed_at' => now(),
            'duration_ms' => $state->duration_ms,
            'progress' => $processed,
            'total' => $total,
            'processed_items' => $this->result['processed'] ?? $state->processed_items,
            'failed_items' => $this->result['failed'] ?? $state->failed_items,
            'result' => $this->result,
        ]);

        // Update provider's last_synced_at
        Provider::where('id', $state->provider_id)->update([
            'last_synced_at' => now(),
        ]);
    }
}
