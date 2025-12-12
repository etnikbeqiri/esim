<?php

namespace App\DTOs;

readonly class PackageData
{
    public function __construct(
        public string $providerPackageId,
        public string $name,
        public ?string $description,
        public string $countryIso,
        public int $dataMb,
        public int $validityDays,
        public float $sourceCostPrice,
        public string $sourceCurrency = 'USD',
        public ?string $networkType = null,
        public array $supportedNetworks = [],
        public string $coverageType = 'local',
        public array $coverageCountries = [],
        public bool $smsIncluded = false,
        public bool $voiceIncluded = false,
        public bool $hotspotAllowed = true,
        public bool $inStock = true,
        public array $metadata = [],
    ) {}

    public function toArray(): array
    {
        return [
            'provider_package_id' => $this->providerPackageId,
            'name' => $this->name,
            'description' => $this->description,
            'country_iso' => $this->countryIso,
            'data_mb' => $this->dataMb,
            'validity_days' => $this->validityDays,
            'source_cost_price' => $this->sourceCostPrice,
            'source_currency' => $this->sourceCurrency,
            'network_type' => $this->networkType,
            'supported_networks' => $this->supportedNetworks,
            'coverage_type' => $this->coverageType,
            'coverage_countries' => $this->coverageCountries,
            'sms_included' => $this->smsIncluded,
            'voice_included' => $this->voiceIncluded,
            'hotspot_allowed' => $this->hotspotAllowed,
            'in_stock' => $this->inStock,
            'metadata' => $this->metadata,
        ];
    }

    public function getDataGb(): float
    {
        return round($this->dataMb / 1024, 2);
    }

    public function getDataLabel(): string
    {
        if ($this->dataMb >= 1024) {
            $gb = round($this->dataMb / 1024, 1);
            return $gb == intval($gb) ? intval($gb) . ' GB' : $gb . ' GB';
        }
        return $this->dataMb . ' MB';
    }
}
