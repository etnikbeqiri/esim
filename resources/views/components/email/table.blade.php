@props(['title' => null])

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    @if($title)
        <tr>
            <th colspan="2" style="padding: 14px 16px; text-align: left; background: linear-gradient(135deg, #eef5f0 0%, #d5e8da 100%); font-weight: 600; color: #003720; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #aad1b6;">
                {{ $title }}
            </th>
        </tr>
    @endif
    {{ $slot }}
</table>
