@props(['number', 'title' => null])

<div style="display: flex; margin-bottom: 16px;">
    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #006039 0%, #004528 100%); color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 16px; box-shadow: 0 2px 4px rgba(0, 96, 57, 0.2);">
        {{ $number }}
    </div>
    <div style="flex: 1;">
        @if($title)
            <div style="font-weight: 600; color: #002a18; margin-bottom: 4px;">{{ $title }}</div>
        @endif
        <div style="color: #004528; font-size: 14px;">{{ $slot }}</div>
    </div>
</div>
