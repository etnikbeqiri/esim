<x-email.layout title="B2B Balance Top Up">
    <x-email.heading>B2B Balance Top Up 💰</x-email.heading>

    <x-email.text>A B2B customer has topped up their account balance.</x-email.text>

    <x-email.alert type="success">
        <strong>{{ $currency }}{{ number_format($amount, 2) }}</strong> has been added.
    </x-email.alert>

    <x-email.heading :level="2">Top Up Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Customer" :value="$customerName ?? 'Unknown'" />
        <x-email.table-row label="Email" :value="$customerEmail ?? 'Unknown'" />
        <x-email.table-row label="Top Up Amount" :value="$currency . number_format($amount, 2)" />
        <x-email.table-row label="New Balance" :value="$currency . number_format($newBalance, 2)" />
        <x-email.table-row label="Date" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.table>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/customers/' . ($customerId ?? '')">View Customer</x-email.button>
    </div>
</x-email.layout>
