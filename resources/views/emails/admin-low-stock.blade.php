<x-email.layout title="Low Stock Warning">
    <x-email.heading>Inventory Alert</x-email.heading>

    <x-email.text>A package inventory level has fallen below the configured threshold and requires attention.</x-email.text>

    <x-email.alert type="warning" title="Low Stock Level">
        <strong>{{ $packageName }}</strong> has depleted to <strong>{{ $stockCount }}</strong> units remaining.
    </x-email.alert>

    <x-email.heading :level="2">Inventory Status</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Package Name" :value="$packageName" />
        <x-email.summary-row label="Current Stock" :value="$stockCount . ' units'" />
        <x-email.summary-row label="Alert Threshold" :value="$threshold . ' units'" />
        <x-email.summary-row label="Alert Generated" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.summary>

    <x-email.heading :level="2">Recommended Actions</x-email.heading>

    <x-email.step number="1" title="Contact Provider">
        Reach out to the service provider to verify current stock levels and replenishment timelines.
    </x-email.step>

    <x-email.step number="2" title="Consider Visibility Changes">
        Evaluate temporarily hiding the package from public listings if stock is critically low.
    </x-email.step>

    <x-email.step number="3" title="Run Inventory Sync">
        Execute a synchronization job to obtain the most current stock figures from the provider API.
    </x-email.step>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/packages'">Manage Packages</x-email.button>
        <x-email.button :href="config('app.url') . '/admin/sync-jobs'" variant="secondary">Run Sync Job</x-email.button>
    </div>
</x-email.layout>
