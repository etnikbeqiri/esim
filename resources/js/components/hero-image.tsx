import { cn } from '@/lib/utils';

type HeroImageVariant = 'esim-card' | 'savings' | 'abstract';

interface HeroImageProps {
    variant: HeroImageVariant;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    withGlow?: boolean;
    withFloat?: boolean;
}

const images: Record<
    HeroImageVariant,
    { webp: string; png: string; alt: string }
> = {
    'esim-card': {
        webp: '/img/hero/hero-1.webp',
        png: '/img/hero/hero-1.png',
        alt: 'eSIM Card Icon',
    },
    savings: {
        webp: '/img/hero/hero-2.webp',
        png: '/img/hero/hero-2.png',
        alt: 'Savings and Value',
    },
    abstract: {
        webp: '/img/hero/hero-3.webp',
        png: '/img/hero/hero-3.png',
        alt: 'Abstract Design',
    },
};

const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
};

export function HeroImage({
    variant,
    className,
    size = 'lg',
    withGlow = false,
    withFloat = false,
}: HeroImageProps) {
    const image = images[variant];

    return (
        <div className={cn('relative', className)}>
            {withGlow && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-300/40 to-primary-300/40 blur-3xl" />
            )}
            <picture
                className={cn(
                    'relative block',
                    sizes[size],
                    withFloat && 'animate-float',
                )}
            >
                <source srcSet={image.webp} type="image/webp" />
                <img
                    src={image.png}
                    alt={image.alt}
                    className="h-full w-full object-contain drop-shadow-2xl"
                    loading="lazy"
                />
            </picture>
        </div>
    );
}
