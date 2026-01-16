@props(['level' => 1])

@php
$classes = match ($level) {
    1 => 'font-size: 24px; letter-spacing: -0.025em; margin: 0 0 24px 0;',
    2 => 'font-size: 20px; letter-spacing: -0.025em; margin: 32px 0 16px 0;',
    3 => 'font-size: 18px; letter-spacing: -0.025em; margin: 24px 0 12px 0;',
    default => 'font-size: 16px; margin: 16px 0 8px 0;',
};
$tag = 'h' . $level;
@endphp

<{{ $tag }} style="font-weight: 600; color: #09090b; line-height: 1.25; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; {{ $classes }}">
    {{ $slot }}
</{{ $tag }}>
