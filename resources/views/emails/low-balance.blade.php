<x-email.layout title="Low Balance Alert">
    <x-email.heading>Low Balance Alert ⚠️</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>This is a friendly reminder that your account balance is running low.</x-email.text>

    <x-email.alert type="warning">
        <strong>Current Balance: {{ $currency }}{{ number_format($balance, 2) }}</strong>
    </x-email.alert>

    <x-email.text>Your balance is below {{ $currency }}{{ number_format($threshold, 2) }}. To continue placing orders without interruption, we recommend topping up your account.</x-email.text>

    <x-email.heading :level="2">Why Top Up Now?</x-email.heading>

    <ul>
        <li>✓ Instant order processing - no payment delays</li>
        <li>✓ Never miss a customer order</li>
        <li>✓ Access to wholesale pricing</li>
        <li>✓ Bulk purchase discounts</li>
    </ul>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/client/balance/top-up'">Top Up Now</x-email.button>
    </div>

    <x-email.text muted small center class="mt-4">
        Need help or have questions about billing? Contact our support team.
    </x-email.text>
</x-email.layout>
