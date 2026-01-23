<?php

namespace App\DTOs\Setting;

use App\Enums\SettingType;

class SettingMetadata
{
    public function __construct(
        public readonly string $key,
        public readonly string $label,
        public readonly string $description,
        public readonly string $group,
        public readonly SettingType $type,
        public readonly mixed $defaultValue,
        public readonly bool $isEncrypted = false,
        public readonly bool $isReadOnly = false,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            key: $data['key'],
            label: $data['label'],
            description: $data['description'],
            group: $data['group'],
            type: SettingType::from($data['type']),
            defaultValue: $data['default'],
            isEncrypted: $data['encrypted'] ?? false,
            isReadOnly: $data['read_only'] ?? false,
        );
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'description' => $this->description,
            'group' => $this->group,
            'type' => $this->type->value,
            'default' => $this->defaultValue,
            'encrypted' => $this->isEncrypted,
            'read_only' => $this->isReadOnly,
        ];
    }
}
