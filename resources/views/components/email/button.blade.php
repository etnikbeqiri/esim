@props(['href' => '#', 'variant' => 'default', 'size' => 'default'])

@php
$variant = strtolower($variant);

$variants = [
    'default' => ['bg' => '#09090b', 'text' => '#ffffff', 'border' => '#09090b'], // Primary
    'primary' => ['bg' => '#09090b', 'text' => '#ffffff', 'border' => '#09090b'],
    'secondary' => ['bg' => '#f4f4f5', 'text' => '#09090b', 'border' => '#f4f4f5'],
    'outline' => ['bg' => '#ffffff', 'text' => '#09090b', 'border' => '#e4e4e7'],
    'ghost' => ['bg' => 'transparent', 'text' => '#09090b', 'border' => 'transparent'],
    'destructive' => ['bg' => '#ef4444', 'text' => '#ffffff', 'border' => '#ef4444'],
];

$sizes = [
    'sm' => ['padding' => '8px 16px', 'fontSize' => '13px', 'height' => '32px'],
    'default' => ['padding' => '10px 20px', 'fontSize' => '14px', 'height' => '40px'],
    'lg' => ['padding' => '12px 24px', 'fontSize' => '15px', 'height' => '48px'],
];

$style = $variants[$variant] ?? $variants['default'];
$padding = $sizes[$size] ?? $sizes['default'];
@endphp

@if($variant === 'link')
    <a href="{{ $href }}" class="button-link" style="color: #09090b; text-decoration: underline; font-weight: 500; font-size: {{ $padding['fontSize'] }}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        {{ $slot }}
    </a>
@else
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; margin: 4px 0;">
        <tr>
            <td style="background-color: {{ $style['bg'] }}; border-radius: 6px; text-align: center;">
                <a href="{{ $href }}" class="button-link" style="display: inline-block; padding: {{ $padding['padding'] }}; color: {{ $style['text'] }}; text-decoration: none; font-weight: 500; font-size: {{ $padding['fontSize'] }}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; mso-line-height-rule: exactly; line-height: 1.5; border: 1px solid {{ $style['border'] }}; border-radius: 6px;">
                    {{ $slot }}
                </a>
            </td>
        </tr>
    </table>
@endif
