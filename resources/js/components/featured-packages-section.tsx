import { CountryFlag } from '@/components/country-flag';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Flame,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Package {
    id: number;
    name: string;
    data_mb: number;
    data_label: string;
    validity_days: number;
    validity_label: string;
    retail_price: number | string;
    country: {
        name: string;
        iso_code: string;
    } | null;
    badge_label?: string;
}

interface FeaturedPackagesSectionProps {
    packages: Package[];
}

export function FeaturedPackagesSection({
    packages,
}: FeaturedPackagesSectionProps) {
    const { trans } = useTrans();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const maxScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;

            setCanScrollLeft(currentScroll > 10);
            setCanScrollRight(currentScroll < maxScroll - 10);

            // Calculate active index based on scroll position
            const cardWidth = window.innerWidth < 768 ? 280 : 320;
            const gap = window.innerWidth < 768 ? 16 : 24;
            const itemWidth = cardWidth + gap;
            const newIndex = Math.round(currentScroll / itemWidth);
            setActiveIndex(Math.min(newIndex, packages.length - 1));
        }
    };

    // Scroll to center card on load
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container && packages.length > 0) {
            // Calculate middle card index
            const middleIndex = Math.floor(packages.length / 2);
            setActiveIndex(middleIndex);

            // Calculate scroll position to center the middle card
            const cardWidth = window.innerWidth < 768 ? 280 : 320;
            const gap = window.innerWidth < 768 ? 16 : 24;
            const containerWidth = container.clientWidth;
            const scrollPosition =
                middleIndex * (cardWidth + gap) -
                containerWidth / 2 +
                cardWidth / 2;

            container.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth',
            });
            checkScrollButtons();
        }
    }, [packages.length]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons, {
                passive: true,
            });
            return () =>
                container.removeEventListener('scroll', checkScrollButtons);
        }
    }, []);

    // Check on resize
    useEffect(() => {
        const handleResize = () => {
            checkScrollButtons();
            // Re-center on resize
            const container = scrollContainerRef.current;
            if (container && packages.length > 0) {
                const cardWidth = window.innerWidth < 768 ? 280 : 320;
                const gap = window.innerWidth < 768 ? 16 : 24;
                const containerWidth = container.clientWidth;
                const scrollPosition =
                    activeIndex * (cardWidth + gap) -
                    containerWidth / 2 +
                    cardWidth / 2;
                container.scrollLeft = Math.max(0, scrollPosition);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeIndex, packages.length]);

    if (packages.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const cardWidth = window.innerWidth < 768 ? 280 : 320;
            const gap = window.innerWidth < 768 ? 16 : 24;
            const scrollAmount = cardWidth + gap;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const getPackageBadge = (pkg: Package, index: number) => {
        // Badge label mapping with fallbacks
        const badgeLabels: Record<string, string> = {
            featured: 'Featured',
            best_value: 'Best Value',
            popular: 'Popular',
            hot_deal: 'Hot Deal',
        };

        // Use custom badge label from settings if provided
        if (pkg.badge_label) {
            const labelKey = pkg.badge_label.toLowerCase().trim();
            const translatedLabel = badgeLabels[labelKey] || pkg.badge_label;

            // Determine style based on label type
            if (labelKey === 'best_value') {
                return {
                    text: translatedLabel,
                    icon: Flame,
                    className: 'from-accent-400 to-accent-500 text-accent-950',
                    shadow: 'shadow-accent-500/25',
                };
            }
            if (labelKey === 'popular') {
                return {
                    text: translatedLabel,
                    icon: Sparkles,
                    className: 'from-primary-400 to-primary-500 text-white',
                    shadow: 'shadow-primary-500/25',
                };
            }
            if (labelKey === 'hot_deal') {
                return {
                    text: translatedLabel,
                    icon: Zap,
                    className: 'from-orange-400 to-orange-500 text-white',
                    shadow: 'shadow-orange-500/25',
                };
            }
            // Default for 'featured' or any custom label
            return {
                text: translatedLabel,
                icon: Sparkles,
                className: 'from-primary-400 to-primary-500 text-white',
                shadow: 'shadow-primary-500/25',
            };
        }

        // Fallback to index-based badges if no custom label
        if (index === 0) {
            return {
                text: badgeLabels.best_value,
                icon: Flame,
                className: 'from-accent-400 to-accent-500 text-accent-950',
                shadow: 'shadow-accent-500/25',
            };
        }
        if (index === 1) {
            return {
                text: badgeLabels.popular,
                icon: Sparkles,
                className: 'from-primary-400 to-primary-500 text-white',
                shadow: 'shadow-primary-500/25',
            };
        }
        return {
            text: badgeLabels.hot_deal,
            icon: Zap,
            className: 'from-orange-400 to-orange-500 text-white',
            shadow: 'shadow-orange-500/25',
        };
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-white py-8 md:py-16">
            {/* Background decorations */}
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-accent-100/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-100/30 blur-3xl" />

            <div className="relative z-10 container mx-auto px-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between md:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 shadow-lg shadow-accent-500/20 md:h-12 md:w-12">
                            <Sparkles className="h-5 w-5 text-accent-950 md:h-6 md:w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-primary-900 md:text-2xl">
                                {trans('featured_packages.title')}
                            </h2>
                            <p className="hidden text-sm text-primary-500 md:block">
                                Handpicked plans for your next adventure
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Navigation arrows - desktop only */}
                        <div className="hidden gap-2 md:flex">
                            <button
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                                    canScrollLeft
                                        ? 'border-primary-200 bg-white text-primary-600 shadow-md hover:border-accent-400 hover:text-accent-600'
                                        : 'cursor-not-allowed border-primary-100 bg-primary-50 text-primary-300'
                                }`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                                    canScrollRight
                                        ? 'border-primary-200 bg-white text-primary-600 shadow-md hover:border-accent-400 hover:text-accent-600'
                                        : 'cursor-not-allowed border-primary-100 bg-primary-50 text-primary-300'
                                }`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <Link
                            href="/destinations"
                            className="group flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 hover:text-primary-900 md:px-5"
                        >
                            {trans('featured_packages.view_all')}
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {/* Cards container - horizontal scroll on mobile, compact grid on desktop */}
                <div className="relative overflow-visible">
                    <div
                        ref={scrollContainerRef}
                        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-6 pb-8 md:mx-auto md:grid md:max-w-4xl md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-4"
                    >
                        {packages.map((pkg, index) => {
                            const badge = getPackageBadge(pkg, index);
                            const BadgeIcon = badge.icon;

                            const isActive = index === activeIndex;

                            return (
                                <div
                                    key={pkg.id}
                                    className={`group relative shrink-0 snap-center transition-transform duration-300 ease-out ${
                                        isActive
                                            ? 'w-[280px] scale-100 md:w-full md:scale-100'
                                            : 'w-[260px] scale-[0.9] md:w-full md:scale-100'
                                    } ${index === packages.length - 1 ? 'mr-4 md:mr-0' : ''}`}
                                >
                                    {/* Badge */}
                                    <div
                                        className={`absolute -top-3 left-4 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r ${badge.className} ${badge.shadow} px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase shadow-lg transition-transform duration-300 ease-out md:left-5 md:px-4 md:group-hover:-translate-y-1`}
                                    >
                                        <BadgeIcon className="h-3 w-3" />
                                        {badge.text}
                                    </div>

                                    {/* Card */}
                                    <div
                                        className={`relative h-full overflow-hidden rounded-3xl border bg-white shadow-xl transition-all duration-300 ease-out md:hover:-translate-y-1 md:hover:border-accent-300 md:hover:shadow-accent-500/10 ${
                                            isActive
                                                ? 'border-accent-400 shadow-accent-500/30'
                                                : 'border-primary-100 shadow-primary-100/20'
                                        }`}
                                    >
                                        {/* Decorative gradient blobs */}
                                        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent-100/50 blur-2xl" />
                                        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-primary-100/50 blur-xl" />

                                        <div className="relative p-5 md:p-3 md:py-4 lg:p-4">
                                            {/* Country info */}
                                            {pkg.country && (
                                                <div className="mb-3 flex items-center gap-2 md:mb-2">
                                                    <CountryFlag
                                                        countryCode={
                                                            pkg.country.iso_code
                                                        }
                                                        size="md"
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm font-semibold text-primary-800 md:text-xs">
                                                        {pkg.country.name}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Package name */}
                                            <h3 className="mb-3 line-clamp-1 text-base font-bold text-primary-900 md:mb-2 md:text-sm">
                                                {pkg.name}
                                            </h3>

                                            {/* Data & Validity stats */}
                                            <div className="mb-4 grid grid-cols-2 gap-2 md:mb-3 md:gap-1.5">
                                                <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-2 text-center md:rounded-lg md:p-1.5">
                                                    <span className="mb-0.5 block text-[10px] font-bold tracking-wider text-primary-400 uppercase md:text-[9px]">
                                                        Data
                                                    </span>
                                                    <span className="block text-sm font-extrabold text-primary-900 md:text-xs">
                                                        {pkg.data_label}
                                                    </span>
                                                </div>
                                                <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-2 text-center md:rounded-lg md:p-1.5">
                                                    <span className="mb-0.5 block text-[10px] font-bold tracking-wider text-primary-400 uppercase md:text-[9px]">
                                                        Valid
                                                    </span>
                                                    <span className="block text-sm font-extrabold text-primary-900 md:text-xs">
                                                        {pkg.validity_label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price and CTA */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div>
                                                    <span className="block text-[10px] font-medium tracking-wider text-primary-400 uppercase md:text-[9px]">
                                                        From
                                                    </span>
                                                    <span className="text-xl font-extrabold tracking-tight text-primary-900 md:text-lg">
                                                        €
                                                        {Number(
                                                            pkg.retail_price,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <GoldButton
                                                    asChild
                                                    size="sm"
                                                    className="h-9 shrink-0 rounded-full px-4 text-xs font-bold md:h-8 md:px-3"
                                                >
                                                    <Link
                                                        href={`/checkout/${pkg.id}`}
                                                    >
                                                        <span className="hidden lg:inline">
                                                            {trans(
                                                                'featured_packages.buy_now',
                                                            )}
                                                        </span>
                                                        <span className="lg:hidden">
                                                            {trans(
                                                                'featured_packages.buy_now',
                                                            )}
                                                        </span>
                                                    </Link>
                                                </GoldButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile scroll indicator with navigation buttons */}
                <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                            canScrollLeft
                                ? 'border-primary-200 bg-white text-primary-600 shadow-md hover:border-accent-400 hover:text-accent-600'
                                : 'cursor-not-allowed border-primary-100 bg-primary-50 text-primary-300'
                        }`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex gap-1.5">
                        {packages.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === activeIndex
                                        ? 'w-6 bg-accent-500'
                                        : 'w-2 bg-primary-200'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                            canScrollRight
                                ? 'border-primary-200 bg-white text-primary-600 shadow-md hover:border-accent-400 hover:text-accent-600'
                                : 'cursor-not-allowed border-primary-100 bg-primary-50 text-primary-300'
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
