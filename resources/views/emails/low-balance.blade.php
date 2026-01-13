<x-email.layout title="Low Balance">
    <x-email.heading>Low Balance Alert</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Your account balance has fallen below the recommended threshold. Top up soon to ensure uninterrupted service.</x-email.text>

    <x-email.alert type="warning" title="Current Balance">
        <strong>Available Balance: {{ config('invoice.currency') }}{{ number_format($balance, 2) }}</strong>
    </x-email.alert>

    <x-email.text>Your balance is currently below {{ config('invoice.currency') }}{{ number_format($threshold, 2) }}.</x-email.text>

    <x-email.heading :level="2">Why Maintain a Balance?</x-email.heading>

    <x-email.step number="✓" title="Instant Processing">
        Orders are provisioned immediately without payment delays.
    </x-email.step>

    <x-email.step number="✓" title="Uninterrupted Service">
        Never miss a customer order due to insufficient funds.
    </x-email.step>

    <x-email.step number="✓" title="Wholesale Pricing">
        Continue accessing competitive B2B rates on all purchases.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/client/balance/top-up'">Add Funds</x-email.button>
    </div>

    <x-email.text muted small center class="mt-4">
        Need help with billing or pricing? Contact our account team.
    </x-email.text>
</x-email.layout>
