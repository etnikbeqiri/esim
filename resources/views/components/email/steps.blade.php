@props(['title' => null])

@if($title)
    <x-email.heading :level="2">{{ $title }}</x-email.heading>
@endif

<div style="margin: 24px 0;">
    {{ $slot }}
</div>
