<x-email.layout title="Low Stock Warning">
    <x-email.heading>Low Stock Alert 📦</x-email.heading>

    <x-email.text>A package is running low on stock and may need attention.</x-email.text>

    <x-email.alert type="warning">
        <strong>{{ $packageName }}</strong> has only <strong>{{ $stockCount }}</strong> units remaining.
    </x-email.alert>

    <x-email.heading :level="2">Stock Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Package" :value="$packageName" />
        <x-email.table-row label="Current Stock" :value="$stockCount . ' units'" />
        <x-email.table-row label="Threshold" :value="$threshold . ' units'" />
        <x-email.table-row label="Alert Time" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.table>

    <x-email.heading :level="2">Recommended Actions</x-email.heading>

    <ul>
        <li>Contact the provider to check stock levels</li>
        <li>Consider temporarily disabling the package if stock is critical</li>
        <li>Run a sync job to update stock from the provider</li>
    </ul>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/packages'">View Packages</x-email.button>
        <x-email.button :href="config('app.url') . '/admin/sync-jobs'" variant="secondary">Run Sync</x-email.button>
    </div>
</x-email.layout>
