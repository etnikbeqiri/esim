@props(['href' => '#', 'variant' => 'gold', 'size' => 'default'])

@php
$variant = strtolower($variant);

// Gold gradient matching the TSX gold-button component
$goldGradient = 'background: linear-gradient(90deg, #fef9c3 0%, #fef08a 25%, #fde047 50%, #fef08a 75%, #fef9c3 100%); background-size: 200% auto;';
$goldBorder = 'border: 1px solid #b8860b;';
$goldText = 'color: #1a1a00;';
$goldShadow = 'box-shadow: 0px 4px 15px rgba(212,175,55,0.3);';

$styles = match($variant) {
    'secondary' => 'background-color: #aad1b6; color: #002a18;',
    'outline' => 'background-color: transparent; border: 2px solid #006039; color: #006039;',
    'ghost' => 'background-color: #eef5f0; color: #006039;',
    'gold', 'default' => $goldGradient . $goldBorder . $goldText . $goldShadow,
};

$sizes = match($size) {
    'sm' => 'padding: 10px 20px; font-size: 14px;',
    'lg' => 'padding: 16px 32px; font-size: 16px;',
    'default' => 'padding: 14px 28px; font-size: 15px;',
};
@endphp

<a href="{{ $href }}" style="display: inline-block; {{ $styles }} {{ $sizes }} border-radius: 12px; text-decoration: none; font-weight: 700; text-align: center; transition: all 0.2s;">
    {{ $slot }}
</a>
