<?php

namespace App\Events\Sync;

use App\Enums\SyncJobStatus;
use App\Enums\SyncJobType;
use App\Models\SyncJob;
use App\States\SyncJobState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class SyncJobCreated extends Event
{
    #[StateId(SyncJobState::class)]
    public int $sync_job_id;

    public function __construct(
        public int $provider_id,
        public SyncJobType $type,
        public string $triggered_by = 'manual',
        public ?int $triggered_by_user_id = null,
    ) {
        $this->sync_job_id = snowflake_id();
    }

    public function apply(SyncJobState $state): void
    {
        $state->sync_job_id = $this->sync_job_id;
        $state->provider_id = $this->provider_id;
        $state->type = $this->type;
        $state->status = SyncJobStatus::Pending;
    }

    public function handle(SyncJobState $state): SyncJob
    {
        return SyncJob::create([
            'id' => $state->sync_job_id,
            'provider_id' => $this->provider_id,
            'type' => $this->type,
            'status' => SyncJobStatus::Pending,
            'triggered_by' => $this->triggered_by,
            'triggered_by_user_id' => $this->triggered_by_user_id,
        ]);
    }
}
