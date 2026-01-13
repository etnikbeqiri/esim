@props(['title' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0; border-collapse: separate;">
    @if($title)
        <tr>
            <th colspan="2" style="padding: 10px 14px; text-align: left; background-color: #fafafa; border: 1px solid #e4e4e7; border-bottom: none; border-radius: 6px 6px 0 0; font-weight: 600; color: #18181b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; mso-line-height-rule: exactly;">
                {{ $title }}
            </th>
        </tr>
    @endif
    {{ $slot }}
</table>
