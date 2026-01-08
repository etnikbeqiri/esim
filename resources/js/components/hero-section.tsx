import { Badge } from '@/components/ui/badge';
import { CountryFlag } from '@/components/country-flag';
import { GoldButton } from '@/components/ui/gold-button';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Globe, Loader2, MapPin, Search, Shield, Sparkles, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchResult {
    id: number;
    name: string;
    iso_code: string;
    package_count: number;
    min_price: number | null;
}

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
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Use controlled value if provided, otherwise use internal state
    const isControlled =
        searchValue !== undefined && onSearchChange !== undefined;
    const searchQuery = isControlled ? searchValue : internalQuery;
    const setSearchQuery = isControlled ? onSearchChange : setInternalQuery;

    // Debounced search function with minimum loading time
    const searchDestinations = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(false);

        // Minimum loading time of 500ms for better UX
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500));

        try {
            const [response] = await Promise.all([
                fetch(`/api/destinations/search?q=${encodeURIComponent(query)}`),
                minLoadingTime
            ]);
            const data = await response.json();
            setSearchResults(data);
            setShowDropdown(true);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle input change with debounce (only search API when not in controlled mode)
    const handleInputChange = useCallback((value: string) => {
        setSearchQuery(value);

        // Only do API search when NOT in controlled mode (i.e., on home page)
        if (isControlled) {
            return;
        }

        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new debounce timeout (300ms)
        debounceRef.current = setTimeout(() => {
            searchDestinations(value);
        }, 300);
    }, [setSearchQuery, searchDestinations, isControlled]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setShowDropdown(false);
        // Only navigate if not in controlled mode
        if (!isControlled && searchQuery.trim()) {
            router.visit(
                `/destinations?search=${encodeURIComponent(searchQuery)}`,
            );
        }
    }

    function handleSelectDestination(isoCode: string) {
        setShowDropdown(false);
        setSearchQuery('');
        router.visit(`/destinations/${isoCode.toLowerCase()}`);
    }

    return (
        <section className="bg-mesh relative overflow-x-clip pt-8 pb-12 md:pt-24 md:pb-28">
            {/* Abstract Background Shapes */}
            <div className="animate-float absolute top-20 -left-20 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl filter md:h-96 md:w-96" />
            <div className="animate-float-delayed bg-accent-200/30 absolute -right-20 bottom-20 h-64 w-64 rounded-full blur-3xl filter md:h-96 md:w-96" />

            <div className="relative z-10 container mx-auto px-4 overflow-visible">
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
                        <div ref={searchContainerRef} className={`relative z-50 max-w-xl mx-auto transition-all duration-300 ${showDropdown && !isControlled && (searchResults.length > 0 || hasSearched) ? 'mb-48 md:mb-56' : ''}`}>
                            <form
                                onSubmit={handleSearch}
                                className="group relative"
                            >
                                {/* Glow Effect */}
                                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-primary-300 via-accent-300 to-primary-300 opacity-30 blur-lg transition-all duration-500 group-hover:opacity-50 group-hover:blur-xl" />
                                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary-200 to-accent-200 opacity-40 blur-sm" />

                                {/* Search Container */}
                                <div className="relative flex items-center gap-2 rounded-full border border-white/80 bg-white py-1.5 pr-1.5 pl-4 shadow-xl">
                                    {isSearching ? (
                                        <Loader2 className="h-5 w-5 shrink-0 text-accent-500 animate-spin" />
                                    ) : (
                                        <Search className="h-5 w-5 shrink-0 text-primary-400" />
                                    )}
                                    <input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        className="h-10 min-w-0 flex-1 bg-transparent text-base text-primary-800 placeholder:text-primary-400 focus:outline-none"
                                        value={searchQuery}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSearchResults([]);
                                                setShowDropdown(false);
                                                setHasSearched(false);
                                            }}
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

                                {/* No Results Message - Only on home page (not controlled mode) */}
                                {!isControlled && showDropdown && hasSearched && searchResults.length === 0 && (
                                    <div className="absolute left-0 right-0 top-full z-[100] mt-2 rounded-xl border border-primary-100 bg-white p-6 shadow-2xl md:rounded-2xl">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                                                <MapPin className="h-6 w-6 text-primary-400" />
                                            </div>
                                            <p className="font-semibold text-primary-900">No destinations found</p>
                                            <p className="mt-1 text-sm text-primary-500">
                                                Try a different search term
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Search Results Dropdown - Only on home page (not controlled mode) */}
                                {!isControlled && showDropdown && searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-primary-100 bg-white shadow-2xl md:rounded-2xl">
                                        <div className="p-1.5 md:p-2">
                                            <p className="px-2 py-1.5 text-[10px] font-medium text-primary-400 md:px-3 md:py-2 md:text-xs">
                                                Quick results
                                            </p>
                                            {searchResults.map((result) => (
                                                <button
                                                    key={result.id}
                                                    type="button"
                                                    onClick={() => handleSelectDestination(result.iso_code)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent-50 md:gap-3 md:rounded-xl md:px-3 md:py-2.5"
                                                >
                                                    <div className="overflow-hidden rounded shadow-sm ring-1 ring-primary-100 md:rounded-md">
                                                        <CountryFlag
                                                            countryCode={result.iso_code}
                                                            size="sm"
                                                            className="h-5 w-7 md:h-6 md:w-8"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-primary-900 truncate md:text-base">
                                                            {result.name}
                                                        </p>
                                                        <p className="text-[10px] text-primary-500 md:text-xs">
                                                            {result.package_count} plan{result.package_count !== 1 ? 's' : ''}
                                                            {result.min_price != null && (
                                                                <span className="ml-1">
                                                                    · <span className="font-medium text-accent-600">€{Number(result.min_price).toFixed(2)}</span>
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-300 md:h-4 md:w-4" />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-primary-100 bg-primary-50/50 px-3 py-2 md:px-4 md:py-2.5">
                                            <button
                                                type="submit"
                                                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 md:gap-2 md:text-sm"
                                            >
                                                <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                <span className="truncate">View all for "{searchQuery}"</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
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
