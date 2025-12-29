<x-email.layout title="Balance Top Up Confirmation">
    <x-email.heading>Balance Top Up Successful 💰</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Your account balance has been successfully topped up.</x-email.text>

    <x-email.alert type="success">
        <strong>{{ $currency }}{{ number_format($amount, 2) }}</strong> has been added to your account.
    </x-email.alert>

    <x-email.heading :level="2">Account Summary</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Top Up Amount" :value="'+' . $currency . number_format($amount, 2)" />
        <x-email.summary-row label="New Balance" :value="$currency . number_format($newBalance, 2)" :bold="true" />
    </x-email.summary>

    <x-email.text>Your balance is now ready to use for purchasing eSIM packages.</x-email.text>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/client/packages'">Browse Packages</x-email.button>
        <x-email.button :href="config('app.url') . '/client/balance'" variant="secondary">View Balance</x-email.button>
    </div>

    <x-email.text muted small center class="mt-4">
        All B2B purchases are deducted instantly from your balance.
    </x-email.text>
</x-email.layout>
