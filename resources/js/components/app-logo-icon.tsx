import { SVGAttributes, useId } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const id = useId();
    const chipGradientId = `chipGradient-${id}`;
    const pinGradientId = `pinGradient-${id}`;

    return (
        <svg {...props} viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
            {/* SIM Card Base with notch */}
            <path
                d="M4 0h24l12 12v32a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4z"
                fill="currentColor"
                stroke="#f5f5f0"
                strokeWidth="1.5"
            />

            {/* Chip Background */}
            <rect
                x="6"
                y="16"
                width="28"
                height="20"
                rx="2"
                fill={`url(#${chipGradientId})`}
            />

            {/* Left vertical pin */}
            <rect
                x="9"
                y="19"
                width="6"
                height="14"
                rx="3"
                fill={`url(#${pinGradientId})`}
            />

            {/* Right horizontal pins - top */}
            <rect
                x="18"
                y="19"
                width="13"
                height="4"
                rx="2"
                fill={`url(#${pinGradientId})`}
            />

            {/* Right horizontal pins - middle */}
            <rect
                x="18"
                y="24"
                width="13"
                height="4"
                rx="2"
                fill={`url(#${pinGradientId})`}
            />

            {/* Right horizontal pins - bottom */}
            <rect
                x="18"
                y="29"
                width="13"
                height="4"
                rx="2"
                fill={`url(#${pinGradientId})`}
            />

            {/* Gradients for realistic metallic gold look */}
            <defs>
                <linearGradient id={chipGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4a574" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#c9a86c" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#b8956a" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id={pinGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e6c88a" />
                    <stop offset="25%" stopColor="#d4a54b" />
                    <stop offset="50%" stopColor="#c9983a" />
                    <stop offset="75%" stopColor="#d4a54b" />
                    <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
            </defs>
        </svg>
    );
}
