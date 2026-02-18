<x-email.layout title="Your eSIM is Ready">
    <x-email.heading>Your eSIM is Ready</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Your eSIM for <strong>{{ $package->name }}</strong> has been successfully provisioned and is ready to install.</x-email.text>

    {{-- QR Code --}}
    @if($esimProfile->qr_code_data)
        <x-email.qr-code :data="'data:image/svg+xml;base64,' . $esimProfile->qr_code_data" caption="Scan with your phone's camera" />
    @endif

    {{-- Install Buttons --}}
    @php
        $lpaString = $esimProfile->lpa_string;
        $iosDeeplink = $lpaString ? 'https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=' . urlencode($lpaString) : null;
        $androidDeeplink = $lpaString ? 'https://lpa.ds/?' . urlencode(str_replace('LPA:1$', '', $lpaString)) : null;
    @endphp

    @if($iosDeeplink || $androidDeeplink)
        <div style="text-align: center; margin: 24px 0;">
            @if($iosDeeplink)
                <x-email.button :href="$iosDeeplink" style="margin-right: 8px;">📱 Install on iPhone</x-email.button>
            @endif
            @if($androidDeeplink)
                <x-email.button :href="$androidDeeplink" variant="outline">🤖 Install on Android</x-email.button>
            @endif
        </div>
    @endif

    <x-email.heading :level="2">Manual Installation</x-email.heading>
    <x-email.text>If you can't scan the QR code or use the install buttons, enter these details manually:</x-email.text>

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

    <x-email.step number="2" title="Install Your eSIM">
        Use the install buttons above, scan the QR code, or enter the manual details.
    </x-email.step>

    <x-email.step number="3" title="Activate Data Roaming">
        Once installed, turn on "Data Roaming" for this eSIM to connect when you arrive.
    </x-email.step>

    <x-email.heading :level="2">Order Summary</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Plan" :value="$package->name" />
        <x-email.summary-row label="Data" :value="$package->data_label" />
        <x-email.summary-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Region" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Order" :value="'#' . $order->order_number" />
    </x-email.summary>

    <x-email.divider />

    <div style="text-align: center; margin: 24px 0;">
        <x-email.button :href="config('app.url') . '/order/' . $order->uuid . '/status'" size="lg">View Order Status</x-email.button>
    </div>

    <x-email.alert type="info" title="Important">
        Your validity period starts only when your eSIM connects to a supported network at your destination.
    </x-email.alert>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/help'" variant="outline">Need Help?</x-email.button>
    </div>
</x-email.layout>
