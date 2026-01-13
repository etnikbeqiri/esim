@props(['muted' => false, 'small' => false, 'center' => false])

@php
$color = $muted ? '#71717a' : '#52525b';
$size = $small ? '13px' : '15px';
$margin = $small ? '0 0 10px 0' : '0 0 12px 0';
$align = $center ? 'text-align: center;' : '';
@endphp

<p style="{{ $margin }}; color: {{ $color }}; font-size: {{ $size }}; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; {{ $align }}">
    {{ $slot }}
</p>
