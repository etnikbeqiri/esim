<?php

namespace App\Enums;

enum SettingType: string
{
    case Boolean = 'boolean';
    case String = 'string';
    case Integer = 'integer';
    case Float = 'float';
    case Array = 'array';
    case Json = 'json';

    public function cast(mixed $value): mixed
    {
        return match ($this) {
            self::Boolean => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            self::Integer => (int) $value,
            self::Float => (float) $value,
            self::Array => is_array($value) ? $value : [$value],
            self::Json => is_string($value) ? json_decode($value, true) : $value,
            self::String => (string) $value,
        };
    }

    public function validate(mixed $value): bool
    {
        return match ($this) {
            self::Boolean => is_bool($value) || is_numeric($value) || in_array(strtolower($value), ['true', 'false', 'yes', 'no', 'on', 'off']),
            self::Integer => is_numeric($value) && (int) $value == $value,
            self::Float => is_numeric($value),
            self::Array => is_array($value),
            self::Json => is_string($value) || is_array($value) || is_object($value),
            self::String => is_string($value) || is_numeric($value) || is_bool($value),
        };
    }

    public function toStorage(mixed $value): string
    {
        return match ($this) {
            self::Boolean => $value ? '1' : '0',
            self::Json => json_encode($value),
            self::Array => json_encode($value),
            default => (string) $value,
        };
    }

    public function fromStorage(string $value): mixed
    {
        return match ($this) {
            self::Boolean => (bool) $value,
            self::Integer => (int) $value,
            self::Float => (float) $value,
            self::Json => json_decode($value, true),
            self::Array => json_decode($value, true) ?: [],
            self::String => $value,
        };
    }
}
