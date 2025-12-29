@props(['level' => 1])

@if($level === 1)
    <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1a1a1a;">{{ $slot }}</h1>
@else
    <h2 style="margin: 24px 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">{{ $slot }}</h2>
@endif
