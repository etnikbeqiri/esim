@props(['href' => '#', 'variant' => 'default', 'size' => 'default'])

@php
$variant = strtolower($variant);

if ($variant === 'default') {
    $bg = '#18181b';
    $text = '#ffffff';
    $border = '#18181b';
} elseif ($variant === 'secondary') {
    $bg = '#f4f4f5';
    $text = '#18181b';
    $border = '#e4e4e7';
} elseif ($variant === 'outline') {
    $bg = '#ffffff';
    $text = '#18181b';
    $border = '#e4e4e7';
} elseif ($variant === 'ghost') {
    $bg = 'transparent';
    $text = '#18181b';
    $border = 'transparent';
} else {
    $bg = '#18181b';
    $text = '#ffffff';
    $border = '#18181b';
}

if ($size === 'sm') {
    $padding = '8px 14px';
    $paddingMso = '8px 14px';
    $fontSize = '13px';
} elseif ($size === 'lg') {
    $padding = '12px 20px';
    $paddingMso = '12px 20px';
    $fontSize = '15px';
} else {
    $padding = '10px 16px';
    $paddingMso = '10px 16px';
    $fontSize = '14px';
}
@endphp

@if($variant === 'link')
    <a href="{{ $href }}" class="button-link" style="color: #09090b; text-decoration: underline; font-weight: 500; font-size: {{ $fontSize }};">
        {{ $slot }}
    </a>
@else
    <!--[if mso]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; margin: 0 4px 8px 0;">
        <tr>
            <td style="background-color: {{ $bg }}; border: 1px solid {{ $border }}; border-radius: 6px; padding: {{ $paddingMso }};">
                <a href="{{ $href }}" class="button-link" style="color: {{ $text }}; text-decoration: none; font-weight: 500; font-size: {{ $fontSize }}; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly; line-height: normal;">
                    {{ $slot }}
                </a>
            </td>
        </tr>
    </table>
    <![endif]-->
    <!--[if !mso]><!-->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; margin: 0 4px 8px 0;">
        <tr>
            <td style="background-color: {{ $bg }}; border: 1px solid {{ $border }}; border-radius: 6px;">
                <a href="{{ $href }}" class="button-link" style="display: inline-block; padding: {{ $padding }}; color: {{ $text }}; text-decoration: none; font-weight: 500; font-size: {{ $fontSize }}; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;">
                    {{ $slot }}
                </a>
            </td>
        </tr>
    </table>
    <!--<![endif]-->
@endif
