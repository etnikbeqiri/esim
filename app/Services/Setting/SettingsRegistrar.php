<?php

namespace App\Services\Setting;

use App\DTOs\Setting\SettingMetadata;
use App\Enums\SettingGroup;
use App\Enums\SettingType;

class SettingsRegistrar
{
    protected array $registry = [];

    public function __construct()
    {
        $this->registerDefaults();
    }

    /**
     * Register a setting definition.
     */
    public function register(
        string $key,
        string $label,
        string $description,
        SettingGroup $group,
        SettingType $type,
        mixed $default,
        bool $encrypted = false,
        bool $readOnly = false
    ): self {
        $this->registry[$key] = new SettingMetadata(
            key: $key,
            label: $label,
            description: $description,
            group: $group->value,
            type: $type,
            defaultValue: $default,
            isEncrypted: $encrypted,
            isReadOnly: $readOnly,
        );

        return $this;
    }

    /**
     * Get all registered setting definitions.
     */
    public function all(): array
    {
        return $this->registry;
    }

    /**
     * Get a setting definition by key.
     */
    public function get(string $key): ?SettingMetadata
    {
        return $this->registry[$key] ?? null;
    }

    /**
     * Check if a setting is registered.
     */
    public function has(string $key): bool
    {
        return isset($this->registry[$key]);
    }

    /**
     * Get settings grouped by category.
     */
    public function grouped(): array
    {
        $grouped = [];

        foreach ($this->registry as $setting) {
            $grouped[$setting->group][] = $setting;
        }

        return $grouped;
    }

    /**
     * Get all setting keys.
     */
    public function keys(): array
    {
        return array_keys($this->registry);
    }

    /**
     * Get default value for a setting key.
     */
    public function getDefault(string $key): mixed
    {
        return $this->registry[$key]->defaultValue ?? null;
    }

    /**
     * Register all default settings.
     */
    protected function registerDefaults(): void
    {
        // Email Settings
        $this->register(
            key: 'emails.order_confirmation',
            label: 'Order Confirmation',
            description: 'Send email when an order is placed',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.payment_succeeded',
            label: 'Payment Succeeded',
            description: 'Send email when payment is successful',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.payment_failed',
            label: 'Payment Failed',
            description: 'Send email when payment fails',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.esim_qr_code',
            label: 'eSIM QR Code',
            description: 'Send eSIM activation QR code via email',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.balance_topup',
            label: 'Balance Top-up',
            description: 'Send email when B2B balance is topped up',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.invoice_generated',
            label: 'Invoice Generated',
            description: 'Send email when an invoice is created',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.ticket_created',
            label: 'Ticket Created',
            description: 'Send email when a support ticket is created',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.ticket_reply',
            label: 'Ticket Reply',
            description: 'Send email when a ticket receives a reply',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.ticket_closed',
            label: 'Ticket Closed',
            description: 'Send email when a ticket is closed',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: false
        );

        $this->register(
            key: 'emails.email_verification',
            label: 'Email Verification',
            description: 'Send email verification link for new users',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.password_reset',
            label: 'Password Reset',
            description: 'Send password reset email',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.two_factor_enabled',
            label: 'Two-Factor Enabled',
            description: 'Send notification when 2FA is enabled',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.registration_welcome',
            label: 'Registration Welcome',
            description: 'Send welcome email to new registered users',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        // Admin Email Settings
        $this->register(
            key: 'emails.admin_new_order',
            label: 'Admin: New Order',
            description: 'Notify admin when a new order is placed',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_order_failed',
            label: 'Admin: Order Failed',
            description: 'Notify admin when an order fails',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_payment_failed',
            label: 'Admin: Payment Failed',
            description: 'Notify admin when a payment fails',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_low_stock',
            label: 'Admin: Low Stock',
            description: 'Notify admin when stock is low',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_new_b2b_customer',
            label: 'Admin: New B2B Customer',
            description: 'Notify admin when a new B2B customer registers',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_balance_topup',
            label: 'Admin: Balance Top-up',
            description: 'Notify admin when B2B balance is topped up',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_ticket_created',
            label: 'Admin: Ticket Created',
            description: 'Notify admin when a new support ticket is created',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        $this->register(
            key: 'emails.admin_ticket_reply',
            label: 'Admin: Ticket Reply',
            description: 'Notify admin when a customer replies to a ticket',
            group: SettingGroup::Emails,
            type: SettingType::Boolean,
            default: true
        );

        // Analytics Settings
        $this->register(
            key: 'analytics.enabled',
            label: 'Enable Analytics',
            description: 'Enable Google Analytics tracking on the site',
            group: SettingGroup::Analytics,
            type: SettingType::Boolean,
            default: false
        );

        $this->register(
            key: 'analytics.measurement_id',
            label: 'Measurement ID',
            description: 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)',
            group: SettingGroup::Analytics,
            type: SettingType::String,
            default: ''
        );

        $this->register(
            key: 'analytics.firebase_api_key',
            label: 'Firebase API Key',
            description: 'Firebase API key for analytics',
            group: SettingGroup::Analytics,
            type: SettingType::String,
            default: '',
            encrypted: true
        );

        $this->register(
            key: 'analytics.firebase_project_id',
            label: 'Firebase Project ID',
            description: 'Firebase project identifier',
            group: SettingGroup::Analytics,
            type: SettingType::String,
            default: ''
        );

        $this->register(
            key: 'analytics.firebase_app_id',
            label: 'Firebase App ID',
            description: 'Firebase application ID',
            group: SettingGroup::Analytics,
            type: SettingType::String,
            default: ''
        );
    }
}
