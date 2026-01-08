import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/ui/gold-button';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Globe, Search, Shield, Sparkles, X, Zap } from 'lucide-react';
import { useState } from 'react';

interface HeroSectionProps {
    badge?: string;
    title: string;
    titleHighlight?: string;
    description: string;
    showSearch?: boolean;
    showStats?: boolean;
    totalCountries?: number;
    // Controlled search props for local filtering
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
}

export function HeroSection({
    badge = 'Instant Activation',
    title,
    titleHighlight,
    description,
    showSearch = false,
    showStats = true,
    totalCountries = 0,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Where are you traveling to?',
}: HeroSectionProps) {
    const { name } = usePage<SharedData>().props;
    const [internalQuery, setInternalQuery] = useState('');

    // Use controlled value if provided, otherwise use internal state
    const isControlled =
        searchValue !== undefined && onSearchChange !== undefined;
    const searchQuery = isControlled ? searchValue : internalQuery;
    const setSearchQuery = isControlled ? onSearchChange : setInternalQuery;

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        // Only navigate if not in controlled mode
        if (!isControlled && searchQuery.trim()) {
            router.visit(
                `/destinations?search=${encodeURIComponent(searchQuery)}`,
            );
        }
    }

    return (
        <section className="bg-mesh relative overflow-hidden pt-8 pb-12 md:pt-24 md:pb-28">
            {/* Abstract Background Shapes */}
            <div className="animate-float absolute top-20 -left-20 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl filter md:h-96 md:w-96" />
            <div className="animate-float-delayed bg-accent-200/30 absolute -right-20 bottom-20 h-64 w-64 rounded-full blur-3xl filter md:h-96 md:w-96" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <Badge
                        variant="outline"
                        className={`animate-fade-in-up mb-4 inline-flex rounded-full border border-primary-100 bg-white/50 px-4 py-1.5 text-xs font-medium text-primary-800 shadow-sm backdrop-blur-md transition-transform hover:scale-105 md:mb-8 md:px-6 md:py-2 md:text-sm`}
                    >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent-500 md:mr-2 md:h-4 md:w-4" />
                        <span className="bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                            {badge}
                        </span>
                    </Badge>

                    <h1 className="mb-4 text-3xl leading-[1.15] font-extrabold tracking-tight text-primary-900 sm:text-4xl md:mb-6 md:text-6xl lg:text-7xl">
                        {title}
                        {titleHighlight && (
                            <span className="relative block whitespace-nowrap">
                                <span className="absolute -inset-1 -skew-y-3 bg-primary-100/50 blur-lg filter" />
                                <span className="relative bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                    {titleHighlight}
                                </span>
                            </span>
                        )}
                    </h1>

                    <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-primary-600 sm:text-base md:mb-10 md:text-xl">
                        {description}
                    </p>

                    {showSearch && (
                        <div className="max-w-xl mx-auto transform transition-all duration-500 hover:-translate-y-1">
                            <form
                                onSubmit={handleSearch}
                                className="group relative"
                            >
                                {/* Glow Effect */}
                                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-primary-300 via-accent-300 to-primary-300 opacity-30 blur-lg transition-all duration-500 group-hover:opacity-50 group-hover:blur-xl" />
                                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary-200 to-accent-200 opacity-40 blur-sm" />

                                {/* Search Container */}
                                <div className="relative flex items-center gap-2 rounded-full border border-white/80 bg-white py-1.5 pr-1.5 pl-4 shadow-xl">
                                    <Search className="h-5 w-5 shrink-0 text-primary-400" />
                                    <input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        className="h-10 min-w-0 flex-1 bg-transparent text-base text-primary-800 placeholder:text-primary-400 focus:outline-none"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    {isControlled && searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="shrink-0 rounded-full p-1.5 text-primary-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    <GoldButton
                                        type="submit"
                                        className="h-10 shrink-0 rounded-full px-4 text-sm md:px-6"
                                    >
                                        Search
                                    </GoldButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {showStats && (
                        <div className="mt-6 flex items-center justify-center gap-4 md:mt-12 md:gap-x-12">
                            {[
                                {
                                    icon: Globe,
                                    label: 'Countries',
                                    value: `${totalCountries}+`,
                                },
                                {
                                    icon: Zap,
                                    label: 'Activation',
                                    value: 'Instant',
                                },
                                {
                                    icon: Shield,
                                    label: 'Payment',
                                    value: 'Secure',
                                },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="group flex items-center gap-2 md:gap-3"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-500 shadow-md ring-1 ring-primary-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg md:h-11 md:w-11 md:rounded-xl">
                                        <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-primary-900 md:text-base">
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] font-medium text-primary-400 md:text-xs">
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll Indicator - hidden on mobile */}
            <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-50 md:flex">
                <span className="text-xs font-medium tracking-widest text-primary-400 uppercase">
                    Scroll
                </span>
                <div className="h-12 w-0.5 overflow-hidden rounded-full bg-primary-100">
                    <div className="animate-pulse-slow h-1/2 w-full bg-primary-300" />
                </div>
            </div>
        </section>
    );
}
