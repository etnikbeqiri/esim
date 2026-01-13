@props(['muted' => false, 'small' => false, 'center' => false, 'bold' => false])

@php
$color = $muted ? '#71717a' : '#09090b';
$size = $small ? '13px' : '14px';
$margin = '0 0 16px 0';
$weight = $bold ? 'font-weight: 600;' : '';
$align = $center ? 'text-align: center;' : '';
@endphp

<p style="{{ $margin }}; {{ $align }} color: {{ $color }}; font-size: {{ $size }}; line-height: 1.5; {{ $weight }} font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    {{ $slot }}
</p>
