<x-email.layout title="B2B Balance Top-Up">
    <x-email.heading>Account Balance Credited</x-email.heading>

    <x-email.text>A B2B customer has successfully added funds to their account balance.</x-email.text>

    <x-email.alert type="success" title="Credit Added">
        <strong>{{ number_format($amount, 2) }} {{ config('invoice.currency') }}</strong> has been deposited to customer account.
    </x-email.alert>

    <x-email.heading :level="2">Transaction Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Customer Name" :value="$customerName ?? 'Unknown'" />
        <x-email.summary-row label="Email Address" :value="$customerEmail ?? 'Unknown'" />
        <x-email.summary-row label="Deposit Amount" :value="number_format($amount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="New Balance" :value="number_format($newBalance, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="Transaction Date" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.summary>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/customers/' . ($customerId ?? '')">View Customer Account</x-email.button>
    </div>
</x-email.layout>
