<?php

namespace App\Contracts\Setting;

interface SettingContract
{
    /**
     * Get the setting key.
     */
    public function getKey(): string;

    /**
     * Get the setting value.
     */
    public function getValue(): mixed;

    /**
     * Get the default value.
     */
    public function getDefaultValue(): mixed;

    /**
     * Get the setting type.
     */
    public function getType(): SettingTypeContract;

    /**
     * Get the setting group.
     */
    public function getGroup(): string;

    /**
     * Get the setting label.
     */
    public function getLabel(): string;

    /**
     * Get the setting description.
     */
    public function getDescription(): ?string;

    /**
     * Check if the setting has a custom value set.
     */
    public function hasCustomValue(): bool;

    /**
     * Check if the setting is using its default value.
     */
    public function isDefault(): bool;

    /**
     * Validate a value for this setting.
     */
    public function validate(mixed $value): bool;

    /**
     * Convert the value to storage format.
     */
    public function toStorage(mixed $value): string;

    /**
     * Convert the value from storage format.
     */
    public function fromStorage(string $value): mixed;

    /**
     * Get the metadata as an array.
     */
    public function getMetadata(): array;
}
