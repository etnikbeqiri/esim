<?php

namespace App\Events\Sync;

use App\Models\SyncJob;
use App\States\SyncJobState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class SyncJobProgressUpdated extends Event
{
    #[StateId(SyncJobState::class)]
    public int $sync_job_id;

    public function __construct(
        int $sync_job_id,
        public int $progress,
        public ?int $total = null,
        public int $processed_items = 0,
        public int $failed_items = 0,
    ) {
        $this->sync_job_id = $sync_job_id;
    }

    public function apply(SyncJobState $state): void
    {
        $state->progress = $this->progress;
        if ($this->total !== null) {
            $state->total = $this->total;
        }
        $state->processed_items += $this->processed_items;
        $state->failed_items += $this->failed_items;
    }

    public function handle(SyncJobState $state): void
    {
        SyncJob::where('id', $this->sync_job_id)->update([
            'progress' => $state->progress,
            'total' => $state->total,
            'processed_items' => $state->processed_items,
            'failed_items' => $state->failed_items,
        ]);
    }
}
