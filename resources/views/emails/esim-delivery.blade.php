<x-email.layout title="Your eSIM is Ready">
    <x-email.heading>Your eSIM is Ready</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Your eSIM for <strong>{{ $package->name }}</strong> has been successfully provisioned. Scan the QR code below to install it immediately.</x-email.text>

    @if($esimProfile->qr_code_data)
        <div style="margin: 32px 0; text-align: center;">
            <div style="display: inline-block; padding: 16px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
                <img src="data:image/svg+xml;base64,{{ $esimProfile->qr_code_data }}" alt="eSIM QR Code" style="display: block; width: 180px; height: 180px;">
            </div>
            <x-email.text small muted center class="mt-4">Scan with your phone's camera</x-email.text>
        </div>
    @endif

    <x-email.heading :level="2">Manual Installation</x-email.heading>
    <x-email.text>If you can't scan the QR code, enter these details manually in your settings:</x-email.text>

    <x-email.info-box title="SM-DP+ Address">
        {{ $esimProfile->smdp_address }}
    </x-email.info-box>

    <x-email.info-box title="Activation Code">
        {{ $esimProfile->activation_code }}
    </x-email.info-box>

    <x-email.heading :level="2">Installation Steps</x-email.heading>

    <x-email.step number="1" title="Go to Settings">
        <strong>iOS:</strong> Settings → Cellular → Add eSIM<br>
        <strong>Android:</strong> Settings → Network & Internet → SIMs → Add SIM
    </x-email.step>

    <x-email.step number="2" title="Scan QR Code">
        Scan the QR code above or select "Enter Details Manually" to use the codes provided.
    </x-email.step>

    <x-email.step number="3" title="Activate Data Roaming">
        Once installed, turn on "Data Roaming" for this eSIM to connect when you arrive.
    </x-email.step>

    <x-email.heading :level="2">Plan Summary</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Plan" :value="$package->name" />
        <x-email.summary-row label="Data" :value="$package->data_label" />
        <x-email.summary-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Region" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Order" :value="'#' . $order->order_number" />
    </x-email.summary>

    <x-email.alert type="info" title="Note">
        Your validity period starts only when your eSIM connects to a supported network at your destination.
    </x-email.alert>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/help'" variant="outline">Need Help?</x-email.button>
    </div>
</x-email.layout>
