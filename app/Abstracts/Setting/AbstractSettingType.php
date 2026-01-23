<?php

namespace App\Abstracts\Setting;

use App\Contracts\Setting\SettingTypeContract;
use App\Enums\SettingType;

abstract class AbstractSettingType implements SettingTypeContract
{
    protected SettingType $enum;

    public function __construct(SettingType $enum)
    {
        $this->enum = $enum;
    }

    public function getType(): string
    {
        return $this->enum->value;
    }

    public function is(string $type): bool
    {
        return $this->enum->value === $type;
    }

    public function cast(mixed $value): mixed
    {
        return $this->enum->cast($value);
    }

    public function validate(mixed $value): bool
    {
        return $this->enum->validate($value);
    }

    public function toStorage(mixed $value): string
    {
        return $this->enum->toStorage($value);
    }

    public function fromStorage(string $value): mixed
    {
        return $this->enum->fromStorage($value);
    }

    public function getEnum(): SettingType
    {
        return $this->enum;
    }

    /**
     * Create a setting type instance from enum.
     */
    public static function fromEnum(SettingType $type): self
    {
        return match ($type) {
            SettingType::Boolean => new BooleanSettingType(),
            SettingType::String => new StringSettingType(),
            SettingType::Integer => new IntegerSettingType(),
            SettingType::Float => new FloatSettingType(),
            SettingType::Array => new ArraySettingType(),
            SettingType::Json => new JsonSettingType(),
        };
    }
}
