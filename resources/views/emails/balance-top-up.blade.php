<x-email.layout title="Top-Up Confirmed">
    <x-email.heading>Balance Top-Up Successful</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>We're pleased to confirm that your account balance has been successfully credited and is ready for use.</x-email.text>

    <x-email.alert type="success" title="Credit Added">
        <strong>{{ number_format($amount, 2) }} {{ config('invoice.currency') }}</strong> has been added to your account.
    </x-email.alert>

    <x-email.heading :level="2">Updated Balance</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Amount Added" :value="'+' . number_format($amount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="Current Balance" :value="number_format($newBalance, 2) . ' ' . config('invoice.currency')" :bold="true" />
    </x-email.summary>

    <x-email.text>Your balance is now available for instant eSIM purchases. B2B transactions are processed immediately against your balance.</x-email.text>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/client/packages'">Browse Plans</x-email.button>
        <x-email.button :href="config('app.url') . '/client/balance'" variant="secondary">View Balance</x-email.button>
    </div>
</x-email.layout>
