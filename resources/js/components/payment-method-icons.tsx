import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    AlipayFlatRoundedIcon,
    AmexIcon,
    DinersClubFlatRoundedIcon,
    DiscoverFlatRoundedIcon,
    GenericFlatRoundedIcon,
    JCBFlatRoundedIcon,
    MaestroFlatRoundedIcon,
    MastercardFlatRoundedIcon,
    PayPalFlatRoundedIcon,
    UnionPayFlatRoundedIcon,
    VisaFlatRoundedIcon,
} from 'react-svg-credit-card-payment-icons';

interface PaymentMethodIconsProps {
    methods: Array<{ name: string; icon: string; logo_url?: string }>;
    className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconComponents: Record<string, React.ComponentType<any>> = {
    visa: VisaFlatRoundedIcon,
    mastercard: MastercardFlatRoundedIcon,
    amex: AmexIcon,
    maestro: MaestroFlatRoundedIcon,
    discover: DiscoverFlatRoundedIcon,
    diners: DinersClubFlatRoundedIcon,
    jcb: JCBFlatRoundedIcon,
    unionpay: UnionPayFlatRoundedIcon,
    paypal: PayPalFlatRoundedIcon,
    alipay: AlipayFlatRoundedIcon,
    generic: GenericFlatRoundedIcon,
};

function MethodIcon({ method, index }: { method: { name: string; icon: string; logo_url?: string }; index: number }) {
    if (method.logo_url) {
        return (
            <div
                key={`${method.icon}-${index}`}
                className="flex shrink-0 items-center justify-center"
                title={method.name}
            >
                <img
                    src={method.logo_url}
                    alt={method.name}
                    className="h-[22px] w-auto object-contain"
                    loading="lazy"
                />
            </div>
        );
    }

    if (method.icon === 'wallet') {
        return (
            <div
                className="shrink-0"
                title={method.name}
            >
                <Wallet className="h-[22px] w-[22px] text-muted-foreground" />
            </div>
        );
    }

    const IconComponent = iconComponents[method.icon];
    const Icon = IconComponent || GenericFlatRoundedIcon;

    return (
        <div
            className="shrink-0 overflow-hidden rounded"
            title={method.name}
        >
            <Icon width={38} height={24} />
        </div>
    );
}

export function PaymentMethodIcons({
    methods,
    className,
}: PaymentMethodIconsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const shouldScrollRef = useRef(false);
    const methodsKey = methods.map((m) => m.icon).join(',');

    useEffect(() => {
        // Reset on method change
        shouldScrollRef.current = false;
        setShouldScroll(false);

        const container = containerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;

        const check = () => {
            const divisor = shouldScrollRef.current ? 2 : 1;
            const singleWidth = track.scrollWidth / divisor;
            const overflows = singleWidth > container.clientWidth;
            if (overflows !== shouldScrollRef.current) {
                shouldScrollRef.current = overflows;
                setShouldScroll(overflows);
            }
        };

        // Delayed checks to catch image loads and layout shifts
        const raf = requestAnimationFrame(check);
        const t1 = setTimeout(check, 150);
        const t2 = setTimeout(check, 600);

        // Watch container and track for size changes
        const ro = new ResizeObserver(check);
        ro.observe(container);
        ro.observe(track);

        // Listen for image loads inside the track
        const onImgLoad = () => check();
        const images = track.querySelectorAll('img');
        images.forEach((img) => img.addEventListener('load', onImgLoad));

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t1);
            clearTimeout(t2);
            ro.disconnect();
            images.forEach((img) => img.removeEventListener('load', onImgLoad));
        };
    }, [methodsKey]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative min-w-0 overflow-hidden',
                shouldScroll && 'marquee-mask',
                className,
            )}
        >
            <div
                ref={trackRef}
                className={cn(
                    'flex w-max items-center gap-1.5',
                    shouldScroll && 'animate-marquee',
                )}
            >
                {methods.map((method, index) => (
                    <MethodIcon key={`${method.icon}-${index}`} method={method} index={index} />
                ))}

                {/* Duplicate for seamless loop */}
                {shouldScroll &&
                    methods.map((method, index) => (
                        <MethodIcon key={`dup-${method.icon}-${index}`} method={method} index={index} />
                    ))}
            </div>
        </div>
    );
}
