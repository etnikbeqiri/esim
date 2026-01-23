<?php

namespace App\Contracts\Setting;

interface SettingTypeContract
{
    /**
     * Get the type identifier.
     */
    public function getType(): string;

    /**
     * Cast a value to this type.
     */
    public function cast(mixed $value): mixed;

    /**
     * Validate a value for this type.
     */
    public function validate(mixed $value): bool;

    /**
     * Convert value to storage format.
     */
    public function toStorage(mixed $value): string;

    /**
     * Convert value from storage format.
     */
    public function fromStorage(string $value): mixed;

    /**
     * Check if the given type matches this type.
     */
    public function is(string $type): bool;
}
