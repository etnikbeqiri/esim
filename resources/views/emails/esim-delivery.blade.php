<x-email.layout title="Your eSIM is Ready!">
    <x-email.heading>Your eSIM is Ready!</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Great news! Your eSIM for <strong>{{ $package->name }}</strong> is ready to install. Follow the instructions below to get connected.</x-email.text>

    {{-- QR Code --}}
    @if($esimProfile->qr_code_data)
        <x-email.qr-code caption="Scan this QR code with your phone's camera" :data="$esimProfile->qr_code_data" />
    @endif

    <x-email.heading :level="2">Manual Installation</x-email.heading>
    <x-email.text>If you can't scan the QR code, use these details:</x-email.text>

    <x-email.info-box title="SM-DP+ Address">
        {{ $esimProfile->smdp_address }}
    </x-email.info-box>

    <x-email.info-box title="Activation Code">
        {{ $esimProfile->activation_code }}
    </x-email.info-box>

    @if($esimProfile->lpa_string)
        <x-email.info-box title="LPA String">
            {{ $esimProfile->lpa_string }}
        </x-email.info-box>
    @endif

    <x-email.heading :level="2">How to Install</x-email.heading>

    <x-email.step number="1" title="Open Settings">
        <strong>iPhone:</strong> Settings → Cellular → Add eSIM<br>
        <strong>Android:</strong> Settings → Network → SIM → Add eSIM
    </x-email.step>

    <x-email.step number="2" title="Scan QR Code">
        Use your phone's camera to scan the QR code above, or enter the details manually.
    </x-email.step>

    <x-email.step number="3" title="Confirm Installation">
        Follow the on-screen prompts to complete the installation.
    </x-email.step>

    <x-email.step number="4" title="Enable Data Roaming">
        When you arrive at your destination, enable data roaming and set the eSIM as your data line.
    </x-email.step>

    <x-email.heading :level="2">Package Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Package" :value="$package->name" />
        <x-email.summary-row label="Data" :value="$package->data_label" />
        <x-email.summary-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Coverage" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
    </x-email.summary>

    <x-email.alert type="info" title="Important">
        Your data plan will start when your eSIM first connects to a supported network at your destination, not when you install it.
    </x-email.alert>

    <div style="text-align: center; margin-top: 16px;">
        <x-email.button :href="config('app.url') . '/help'">Need Help?</x-email.button>
    </div>

    <x-email.text muted small center>
        Keep this email safe - you may need these details if you reinstall your eSIM.
    </x-email.text>
</x-email.layout>
