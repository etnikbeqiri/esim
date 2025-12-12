<?php

namespace App\States;

use App\Enums\EsimProfileStatus;
use Carbon\Carbon;
use Thunk\Verbs\State;

class EsimProfileState extends State
{
    public int $esim_profile_id;
    public int $order_id;
    public string $iccid;
    public string $activation_code;
    public ?string $smdp_address = null;
    public ?string $qr_code_data = null;
    public ?string $lpa_string = null;
    public EsimProfileStatus $status;
    public int $data_used_bytes = 0;
    public int $data_total_bytes;
    public bool $is_activated = false;
    public bool $topup_available = false;
    public ?Carbon $activated_at = null;
    public ?Carbon $expires_at = null;
    public ?Carbon $last_usage_check_at = null;

    public function isUsable(): bool
    {
        return $this->status->isUsable();
    }

    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }
        return $this->expires_at->isPast();
    }

    public function isDataConsumed(): bool
    {
        return $this->getDataRemainingBytes() <= 0;
    }

    public function getDataRemainingBytes(): int
    {
        return max(0, $this->data_total_bytes - $this->data_used_bytes);
    }

    public function getDataUsagePercentage(): float
    {
        if ($this->data_total_bytes === 0) {
            return 0;
        }
        return round(($this->data_used_bytes / $this->data_total_bytes) * 100, 2);
    }

    public function getDataUsedMb(): float
    {
        return round($this->data_used_bytes / (1024 * 1024), 2);
    }

    public function getDataTotalMb(): float
    {
        return round($this->data_total_bytes / (1024 * 1024), 2);
    }

    public function getDataRemainingMb(): float
    {
        return round($this->getDataRemainingBytes() / (1024 * 1024), 2);
    }

    public function getLpaString(): ?string
    {
        if ($this->lpa_string) {
            return $this->lpa_string;
        }
        if ($this->smdp_address && $this->activation_code) {
            return "LPA:1\${$this->smdp_address}\${$this->activation_code}";
        }
        return null;
    }
}
