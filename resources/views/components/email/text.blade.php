@props(['muted' => false, 'small' => false, 'center' => false])

@php
$styles = 'margin: 0 0 16px 0;';
$styles .= $muted ? ' color: #64748b;' : ' color: #4a4a4a;';
$styles .= $small ? ' font-size: 14px;' : '';
$styles .= $center ? ' text-align: center;' : '';
@endphp

<p style="{{ $styles }}">{{ $slot }}</p>
