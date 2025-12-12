<?php

namespace App\Events\EsimProfile;

use App\Enums\EsimProfileStatus;
use App\Models\EsimProfile;
use App\States\EsimProfileState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class EsimUsageUpdated extends Event
{
    #[StateId(EsimProfileState::class)]
    public int $esim_profile_id;

    public function __construct(
        int $esim_profile_id,
        public int $data_used_bytes,
        public bool $is_activated = false,
        public bool $topup_available = false,
    ) {
        $this->esim_profile_id = $esim_profile_id;
    }

    public function apply(EsimProfileState $state): void
    {
        $state->data_used_bytes = $this->data_used_bytes;
        $state->is_activated = $this->is_activated;
        $state->topup_available = $this->topup_available;
        $state->last_usage_check_at = now();

        // Update status based on usage
        if ($state->data_used_bytes >= $state->data_total_bytes) {
            $state->status = EsimProfileStatus::Consumed;
        } elseif ($this->is_activated && $state->status === EsimProfileStatus::Active) {
            $state->status = EsimProfileStatus::Activated;
            $state->activated_at = now();
        }
    }

    public function handle(EsimProfileState $state): void
    {
        EsimProfile::where('id', $this->esim_profile_id)->update([
            'data_used_bytes' => $state->data_used_bytes,
            'is_activated' => $state->is_activated,
            'topup_available' => $state->topup_available,
            'status' => $state->status,
            'activated_at' => $state->activated_at,
            'last_usage_check_at' => $state->last_usage_check_at,
        ]);
    }
}
