<?php

namespace App\DTOs;

use DateTimeInterface;

readonly class EsimProfileData
{
    public function __construct(
        public string $iccid,
        public string $status,
        public int $dataUsedBytes,
        public int $dataTotalBytes,
        public ?DateTimeInterface $activatedAt = null,
        public ?DateTimeInterface $expiresAt = null,
        public bool $isActivated = false,
        public bool $topupAvailable = false,
        public array $metadata = [],
    ) {}

    public function toArray(): array
    {
        return [
            'iccid' => $this->iccid,
            'status' => $this->status,
            'data_used_bytes' => $this->dataUsedBytes,
            'data_total_bytes' => $this->dataTotalBytes,
            'activated_at' => $this->activatedAt?->format('Y-m-d H:i:s'),
            'expires_at' => $this->expiresAt?->format('Y-m-d H:i:s'),
            'is_activated' => $this->isActivated,
            'topup_available' => $this->topupAvailable,
            'metadata' => $this->metadata,
        ];
    }

    public function getDataRemainingBytes(): int
    {
        return max(0, $this->dataTotalBytes - $this->dataUsedBytes);
    }

    public function getDataUsagePercentage(): float
    {
        if ($this->dataTotalBytes === 0) {
            return 0;
        }
        return round(($this->dataUsedBytes / $this->dataTotalBytes) * 100, 2);
    }

    public function getDataUsedMb(): float
    {
        return round($this->dataUsedBytes / (1024 * 1024), 2);
    }

    public function getDataTotalMb(): float
    {
        return round($this->dataTotalBytes / (1024 * 1024), 2);
    }

    public function getDataRemainingMb(): float
    {
        return round($this->getDataRemainingBytes() / (1024 * 1024), 2);
    }

    public function isExpired(): bool
    {
        if ($this->expiresAt === null) {
            return false;
        }
        return $this->expiresAt < new \DateTime();
    }

    public function isDataConsumed(): bool
    {
        return $this->getDataRemainingBytes() <= 0;
    }
}
