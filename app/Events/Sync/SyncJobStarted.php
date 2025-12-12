<?php

namespace App\Events\Sync;

use App\Enums\SyncJobStatus;
use App\Models\SyncJob;
use App\States\SyncJobState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class SyncJobStarted extends Event
{
    #[StateId(SyncJobState::class)]
    public int $sync_job_id;

    public function __construct(
        int $sync_job_id,
        public ?int $total = null,
    ) {
        $this->sync_job_id = $sync_job_id;
    }

    public function validate(SyncJobState $state): void
    {
        $this->assert(
            $state->status === SyncJobStatus::Pending || $state->sync_job_id === null,
            "Sync job cannot start from status: {$state->status->value}"
        );
    }

    public function apply(SyncJobState $state): void
    {
        $state->status = SyncJobStatus::Running;
        $state->started_at_ms = (int) (microtime(true) * 1000);
        if ($this->total !== null) {
            $state->total = $this->total;
        }
    }

    public function handle(SyncJobState $state): void
    {
        SyncJob::where('id', $this->sync_job_id)->update([
            'status' => SyncJobStatus::Running,
            'started_at' => now(),
            'total' => $state->total,
        ]);
    }
}
