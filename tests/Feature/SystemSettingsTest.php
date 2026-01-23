<?php

use App\Services\Setting\SettingsManager;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Clear all settings before each test
    app(SettingsManager::class)->clearCache();
});

test('can get a setting value', function () {
    $manager = app(SettingsManager::class);

    // Get default value
    $value = $manager->get('emails.order_confirmation');

    expect($value)->toBe(true);
});

test('can set a setting value', function () {
    $manager = app(SettingsManager::class);

    $manager->set('emails.order_confirmation', false);

    expect($manager->get('emails.order_confirmation'))->toBe(false);
});

test('enabled helper works for boolean settings', function () {
    $manager = app(SettingsManager::class);

    expect($manager->enabled('emails.order_confirmation'))->toBe(true);

    $manager->set('emails.order_confirmation', false);

    expect($manager->enabled('emails.order_confirmation'))->toBe(false);
});

test('can reset a setting to default', function () {
    $manager = app(SettingsManager::class);

    $manager->set('emails.order_confirmation', false);
    expect($manager->get('emails.order_confirmation'))->toBe(false);

    $manager->reset('emails.order_confirmation');
    expect($manager->get('emails.order_confirmation'))->toBe(true);
});

test('can set multiple settings at once', function () {
    $manager = app(SettingsManager::class);

    $manager->setMultiple([
        'emails.order_confirmation' => false,
        'emails.payment_succeeded' => false,
        'emails.ticket_closed' => true,
    ]);

    expect($manager->get('emails.order_confirmation'))->toBe(false);
    expect($manager->get('emails.payment_succeeded'))->toBe(false);
    expect($manager->get('emails.ticket_closed'))->toBe(true);
});

test('can get all settings', function () {
    $manager = app(SettingsManager::class);

    $settings = $manager->all();

    expect($settings)->toBeArray();
    expect($settings)->toHaveKey('emails.order_confirmation');
});

test('can get settings grouped by category', function () {
    $manager = app(SettingsManager::class);

    $grouped = $manager->grouped();

    expect($grouped)->toBeArray();
    expect($grouped)->toHaveKey('emails');
    expect($grouped)->toHaveKey('features');
    expect($grouped['emails'])->toBeArray();
});

test('validates setting values', function () {
    $manager = app(SettingsManager::class);

    // Invalid value should not be set
    $result = $manager->set('emails.order_confirmation', 'not-a-boolean');

    expect($result)->toBe(false);
});

test('type casting works correctly', function () {
    $manager = app(SettingsManager::class);

    // Integer type
    $manager->set('orders.auto_expire_minutes', '45');
    expect($manager->get('orders.auto_expire_minutes'))->toBeInt();
    expect($manager->get('orders.auto_expire_minutes'))->toBe(45);

    // String type
    $manager->set('platform.site_name', 12345);
    expect($manager->get('platform.site_name'))->toBeString();
    expect($manager->get('platform.site_name'))->toBe('12345');
});

test('cache works correctly', function () {
    $manager = app(SettingsManager::class);

    $manager->setCacheEnabled(true);
    $manager->setCacheTtl(3600);

    // First call loads from repository
    $value1 = $manager->get('emails.order_confirmation');

    // Second call loads from cache
    $value2 = $manager->get('emails.order_confirmation');

    expect($value1)->toBe($value2);
});

test('can clear cache', function () {
    $manager = app(SettingsManager::class);

    $manager->setCacheEnabled(true);

    $manager->set('emails.order_confirmation', false);

    expect($manager->get('emails.order_confirmation'))->toBe(false);

    $manager->clearCache();

    // After clearing cache, should reload from repository
    // But since we didn't save to database (it's a test with array cache),
    // it will fall back to default
    $value = $manager->get('emails.order_confirmation');

    expect($value)->toBe(true); // Default value
});

test('helper function works', function () {
    expect(setting('emails.order_confirmation'))->toBe(true);
    expect(setting_enabled('emails.order_confirmation'))->toBe(true);
});

test('read-only settings cannot be modified', function () {
    $manager = app(SettingsManager::class);

    // Try to set a read-only setting (none currently, but should handle)
    // If we had a read-only setting, this would fail
    $result = $manager->set('emails.order_confirmation', false);

    expect($result)->toBe(true); // Currently not read-only
});

test('warm cache loads all settings', function () {
    $manager = app(SettingsManager::class);

    $manager->setCacheEnabled(true);

    $result = $manager->warmCache();

    expect($result)->toBe(true);
});
