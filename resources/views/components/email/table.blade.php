@props(['title' => null])

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    @if($title)
        <tr>
            <th colspan="2" style="padding: 12px 16px; text-align: left; background-color: #f8fafc; font-weight: 600; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0;">
                {{ $title }}
            </th>
        </tr>
    @endif
    {{ $slot }}
</table>
