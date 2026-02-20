<?php

namespace App\DTOs;

readonly class CompetitorPlanData
{
    public function __construct(
        public string $competitor,
        public string $planCode,
        public string $planName,
        public float $price,
        public string $currency,
        public int $dataGb,
        public int $durationDays,
        public string $destinationCode,
        public string $destinationName,
        /** @var string[] ISO codes of countries covered */
        public array $countryCodes = [],
        public bool $isRegional = false,
    ) {}

    public function toArray(): array
    {
        return [
            'competitor' => $this->competitor,
            'plan_code' => $this->planCode,
            'plan_name' => $this->planName,
            'price' => $this->price,
            'currency' => $this->currency,
            'data_gb' => $this->dataGb,
            'duration_days' => $this->durationDays,
            'destination_code' => $this->destinationCode,
            'destination_name' => $this->destinationName,
            'country_codes' => $this->countryCodes,
            'is_regional' => $this->isRegional,
        ];
    }

    public function getDataLabel(): string
    {
        return $this->dataGb === 0 ? 'Unlimited' : $this->dataGb . ' GB';
    }

    public function isUnlimited(): bool
    {
        return $this->dataGb === 0;
    }

    public function getDataMb(): int
    {
        return $this->dataGb * 1024;
    }
}
