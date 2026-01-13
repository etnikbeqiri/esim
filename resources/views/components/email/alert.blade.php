@props(['type' => 'default', 'title' => null])

@php
// Shadcn-like colors (Tailwind approximations)
$types = [
    'default' => ['bg' => '#f4f4f5', 'border' => '#e4e4e7', 'text' => '#09090b', 'title' => '#09090b'],
    'info' => ['bg' => '#f4f4f5', 'border' => '#e4e4e7', 'text' => '#09090b', 'title' => '#09090b'], // Neutral look for info
    'success' => ['bg' => '#f0fdf4', 'border' => '#bbf7d0', 'text' => '#166534', 'title' => '#15803d'],
    'warning' => ['bg' => '#fefce8', 'border' => '#fde047', 'text' => '#854d0e', 'title' => '#a16207'],
    'destructive' => ['bg' => '#fef2f2', 'border' => '#fecaca', 'text' => '#b91c1c', 'title' => '#b91c1c'],
    'error' => ['bg' => '#fef2f2', 'border' => '#fecaca', 'text' => '#b91c1c', 'title' => '#b91c1c'],
];
$style = $types[$type] ?? $types['default'];
@endphp

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
    <tr>
        <td style="background-color: {{ $style['bg'] }}; border: 1px solid {{ $style['border'] }}; border-radius: 6px; padding: 16px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                @if($title)
                    <tr>
                        <td style="padding-bottom: 4px; font-weight: 500; font-size: 14px; color: {{ $style['title'] }}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: -0.01em;">
                            {{ $title }}
                        </td>
                    </tr>
                @endif
                <tr>
                    <td style="color: {{ $style['text'] }}; font-size: 13px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
                        {{ $slot }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
