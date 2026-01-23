<?php

namespace App\DTOs\Setting;

use App\Enums\SettingType;

class SettingData
{
    public function __construct(
        public readonly string $key,
        public readonly mixed $value,
        public readonly SettingType $type,
        public readonly ?string $group = null,
        public readonly ?string $label = null,
        public readonly ?string $description = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            key: $data['key'],
            value: $data['value'],
            type: SettingType::from($data['type']),
            group: $data['group'] ?? null,
            label: $data['label'] ?? null,
            description: $data['description'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'value' => $this->value,
            'type' => $this->type->value,
            'group' => $this->group,
            'label' => $this->label,
            'description' => $this->description,
        ];
    }

    public function hasMetadata(): bool
    {
        return $this->group !== null
            && $this->label !== null
            && $this->description !== null;
    }
}
