@props(['type' => 'default', 'title' => null])

@php
if ($type === 'destructive') {
    $bg = '#fef2f2';
    $border = '#fecaca';
    $text = '#7f1d1d';
} elseif ($type === 'warning') {
    $bg = '#fefce8';
    $border = '#fde047';
    $text = '#854d0e';
} elseif ($type === 'success') {
    $bg = '#f0fdf4';
    $border = '#bbf7d0';
    $text = '#14532d';
} elseif ($type === 'info') {
    $bg = '#eff6ff';
    $border = '#bfdbfe';
    $text = '#1e3a8a';
} else {
    $bg = '#fafafa';
    $border = '#e4e4e7';
    $text = '#52525b';
}
@endphp

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
    <tr>
        <td style="background-color: {{ $bg }}; border: 1px solid {{ $border }}; border-radius: 6px; padding: 14px; color: {{ $text }}; font-size: 14px; line-height: 1.5;">
            @if($title)
                <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">
                    {{ $title }}
                </div>
            @endif
            <div style="mso-line-height-rule: exactly; line-height: 1.5;">
                {{ $slot }}
            </div>
        </td>
    </tr>
</table>
