<?php

namespace App\Events\EsimProfile;

use App\Enums\EsimProfileStatus;
use App\Models\EsimProfile;
use App\States\EsimProfileState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class EsimProfileCreated extends Event
{
    #[StateId(EsimProfileState::class)]
    public int $esim_profile_id;

    public function __construct(
        public int $order_id,
        public string $iccid,
        public string $activation_code,
        public int $data_total_bytes,
        public ?string $smdp_address = null,
        public ?string $qr_code_data = null,
        public ?string $lpa_string = null,
        public ?string $pin = null,
        public ?string $puk = null,
        public ?string $apn = null,
        public array $provider_data = [],
    ) {
        $this->esim_profile_id = snowflake_id();
    }

    public function apply(EsimProfileState $state): void
    {
        $state->esim_profile_id = $this->esim_profile_id;
        $state->order_id = $this->order_id;
        $state->iccid = $this->iccid;
        $state->activation_code = $this->activation_code;
        $state->smdp_address = $this->smdp_address;
        $state->qr_code_data = $this->qr_code_data;
        $state->lpa_string = $this->lpa_string;
        $state->data_total_bytes = $this->data_total_bytes;
        $state->status = EsimProfileStatus::Active;
    }

    public function handle(EsimProfileState $state): EsimProfile
    {
        return EsimProfile::create([
            'id' => $state->esim_profile_id,
            'order_id' => $this->order_id,
            'iccid' => $this->iccid,
            'activation_code' => $this->activation_code,
            'smdp_address' => $this->smdp_address,
            'qr_code_data' => $this->qr_code_data,
            'lpa_string' => $this->lpa_string,
            'pin' => $this->pin,
            'puk' => $this->puk,
            'apn' => $this->apn,
            'status' => EsimProfileStatus::Active,
            'data_total_bytes' => $this->data_total_bytes,
            'provider_data' => $this->provider_data,
        ]);
    }
}
