@props(['title' => null])

<div style="background: linear-gradient(135deg, #eef5f0 0%, #fefce8 100%); border: 1px solid #d5e8da; border-radius: 12px; padding: 20px; margin: 20px 0;">
    @if($title)
        <div style="font-weight: 600; color: #002a18; margin-bottom: 10px; font-size: 14px;">{{ $title }}</div>
    @endif
    <div style="color: #004528; font-family: 'Courier New', monospace; word-break: break-all; font-size: 14px;">{{ $slot }}</div>
</div>
