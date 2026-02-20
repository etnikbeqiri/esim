import { howItWorks } from '@/actions/App/Http/Controllers/Public/HomeController';
import { DestinationCard } from '@/components/destination-card';
import { HeroSection } from '@/components/hero-section';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import {
    useAnalytics,
    usePageViewTracking,
    useScrollTracking,
} from '@/lib/analytics';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Globe, MapPin } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SortOption = 'name' | 'plans-desc' | 'price-asc';

interface Country {
    id: number;
    name: string;
    iso_code: string;
    region: string | null;
    package_count: number;
    min_price: number | null;
}

interface Props {
    countries: Country[];
    regions: string[];
    filters: {
        search?: string;
        region?: string;
    };
}

export default function Destinations({ countries, regions, filters }: Props) {
    const { name } = usePage<SharedData>().props;
    const { trans } = useTrans();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeRegion, setActiveRegion] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const hasActiveFilters = activeRegion !== 'all' || searchQuery.trim() !== '';

    // Analytics hooks
    const {
        viewItemList,
        selectItem,
        search: trackSearch,
        filterApplied,
        createItem,
    } = useAnalytics();
    usePageViewTracking('destinations', 'Destinations');
    useScrollTracking('guide', 'destinations-page', 'Destinations');

    const hasTrackedInitialList = useRef(false);
    const lastTrackedListKey = useRef<string>('');

    // Score a country's relevance to the search query
    function getRelevanceScore(country: Country, query: string): number {
        let score = 0;
        const name = country.name.toLowerCase();
        const iso = country.iso_code.toLowerCase();
        const region = (country.region || '').toLowerCase();

        if (name === query) score += 100;
        else if (name.startsWith(query)) score += 80;
        else if (name.includes(query)) score += 60;

        if (iso === query) score += 70;
        else if (iso.startsWith(query)) score += 50;

        if (region.startsWith(query)) score += 30;
        else if (region.includes(query)) score += 20;

        return score;
    }

    // Filter countries locally for instant feedback, sorted by relevance or chosen sort
    const filteredCountries = useMemo(() => {
        let result = [...countries];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (country) =>
                    country.name.toLowerCase().includes(query) ||
                    country.iso_code.toLowerCase().includes(query) ||
                    (country.region || '').toLowerCase().includes(query),
            );
        }

        if (activeRegion !== 'all') {
            result = result.filter(
                (country) => country.region === activeRegion,
            );
        }

        // Sort: search relevance takes priority, otherwise use chosen sort
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result.sort((a, b) => {
                const scoreA = getRelevanceScore(a, query);
                const scoreB = getRelevanceScore(b, query);
                if (scoreB !== scoreA) return scoreB - scoreA;
                return a.name.localeCompare(b.name);
            });
        } else {
            switch (sortBy) {
                case 'plans-desc':
                    result.sort((a, b) => b.package_count - a.package_count);
                    break;
                case 'price-asc':
                    result.sort(
                        (a, b) =>
                            (a.min_price ?? Infinity) -
                            (b.min_price ?? Infinity),
                    );
                    break;
                case 'name':
                default:
                    result.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        return result;
    }, [countries, searchQuery, activeRegion, sortBy]);

    useEffect(() => {
        const listKey = `${activeRegion}-${searchQuery}-${filteredCountries.length}`;

        if (
            !hasTrackedInitialList.current ||
            lastTrackedListKey.current !== listKey
        ) {
            hasTrackedInitialList.current = true;
            lastTrackedListKey.current = listKey;

            if (filteredCountries.length > 0) {
                const items = filteredCountries
                    .slice(0, 20)
                    .map((country, index) =>
                        createItem({
                            id: `country-${country.id}`,
                            name: country.name,
                            category: 'destination',
                            category2: country.region || undefined,
                            price: country.min_price || undefined,
                            index,
                        }),
                    );

                const listId =
                    activeRegion !== 'all'
                        ? `destinations-${activeRegion}`
                        : 'destinations-all';
                const listName =
                    activeRegion !== 'all'
                        ? `Destinations - ${activeRegion}`
                        : 'All Destinations';

                viewItemList(listId, listName, items);
            }
        }
    }, [
        filteredCountries,
        activeRegion,
        searchQuery,
        viewItemList,
        createItem,
    ]);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTrackedSearch = useRef<string>('');

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            if (value.trim() && value !== lastTrackedSearch.current) {
                searchTimeoutRef.current = setTimeout(() => {
                    lastTrackedSearch.current = value;
                    trackSearch(value, 'destination', filteredCountries.length);
                }, 500);
            }
        },
        [trackSearch, filteredCountries.length],
    );

    const handleRegionChange = useCallback(
        (region: string) => {
            setActiveRegion(region);
            filterApplied('region', region, 'destinations');
        },
        [filterApplied],
    );

    const handleDestinationClick = useCallback(
        (country: Country, index: number) => {
            const item = createItem({
                id: `country-${country.id}`,
                name: country.name,
                category: 'destination',
                category2: country.region || undefined,
                price: country.min_price || undefined,
                index,
            });

            const listId =
                activeRegion !== 'all'
                    ? `destinations-${activeRegion}`
                    : 'destinations-all';
            const listName =
                activeRegion !== 'all'
                    ? `Destinations - ${activeRegion}`
                    : 'All Destinations';

            selectItem(item, listId, listName);
        },
        [activeRegion, createItem, selectItem],
    );

    const handleSortChange = useCallback(
        (value: string) => {
            setSortBy(value as SortOption);
            filterApplied('sort', value, 'destinations');
        },
        [filterApplied],
    );

    function clearFilters() {
        setSearchQuery('');
        setActiveRegion('all');
        setSortBy('name');
    }

    return (
        <GuestLayout>
            <Head title={`${trans('nav.destinations')} - ${name}`}>
                <meta
                    name="description"
                    content={trans('destinations.meta_description', {
                        count: String(countries.length),
                    })}
                />
            </Head>

            <HeroSection
                badge={trans('destinations.hero.badge', {
                    count: String(countries.length),
                })}
                title={trans('destinations.hero.title')}
                titleHighlight={trans('destinations.hero.title_highlight')}
                description={trans('destinations.hero.description')}
                showSearch={true}
                showStats={false}
                totalCountries={countries.length}
                searchValue={searchQuery}
                onSearchChange={handleSearchChange}
                searchPlaceholder={trans(
                    'destinations.hero.search_placeholder',
                )}
            />

            {/* Filter & Sort Controls + Countries Grid */}
            <section className="relative min-h-[60vh] overflow-hidden bg-white pt-3 pb-8 md:pt-8 md:pb-16">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-[0.02]" />

                <div className="relative z-10 container mx-auto px-4">
                    {/* Filter Bar */}
                    <div className="mb-3 space-y-2.5 rounded-xl border border-primary-100 bg-white p-3 shadow-sm md:mb-8 md:space-y-3 md:rounded-2xl md:p-4">
                        {/* Header row: count + sort */}
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-1.5 text-xs font-bold text-primary-900 md:gap-3 md:text-lg">
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-accent-300 to-accent-400 px-1.5 py-0.5 text-[10px] font-extrabold text-accent-950 shadow-sm md:min-w-8 md:px-2 md:py-1 md:text-sm">
                                    {filteredCountries.length}
                                </span>
                                {trans('destinations.results.showing_label')}
                                {activeRegion !== 'all' && (
                                    <span className="hidden font-normal text-primary-500 md:inline">
                                        {' '}{trans('destinations.results.in_region', { region: activeRegion })}
                                    </span>
                                )}
                            </h2>
                            <Select
                                value={sortBy}
                                onValueChange={handleSortChange}
                            >
                                <SelectTrigger className="h-7 w-[130px] border-primary-200 bg-primary-50 text-[10px] text-primary-600 focus:ring-primary-400 md:h-8 md:w-[160px] md:text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-primary-200 bg-white">
                                    <SelectItem
                                        value="name"
                                        className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                    >
                                        {trans('destinations.sort.name')}
                                    </SelectItem>
                                    <SelectItem
                                        value="plans-desc"
                                        className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                    >
                                        {trans('destinations.sort.most_plans')}
                                    </SelectItem>
                                    <SelectItem
                                        value="price-asc"
                                        className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                    >
                                        {trans('destinations.sort.cheapest')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Region filter chips */}
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            <button
                                onClick={() => handleRegionChange('all')}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all md:px-4 md:py-2 md:text-xs ${
                                    activeRegion === 'all'
                                        ? 'border border-accent-600 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 text-accent-950 shadow-[0px_3px_10px_rgba(212,175,55,0.3)]'
                                        : 'border border-transparent bg-primary-50 text-primary-600 hover:bg-primary-100'
                                }`}
                            >
                                <Globe className="h-3 w-3" />
                                {trans('destinations.tabs.all_regions')}
                            </button>
                            {regions.map((region) => (
                                <button
                                    key={region}
                                    onClick={() =>
                                        handleRegionChange(
                                            activeRegion === region
                                                ? 'all'
                                                : region,
                                        )
                                    }
                                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-all md:px-4 md:py-2 md:text-xs ${
                                        activeRegion === region
                                            ? 'border border-accent-600 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 text-accent-950 shadow-[0px_3px_10px_rgba(212,175,55,0.3)]'
                                            : 'border border-transparent bg-primary-50 text-primary-600 hover:bg-primary-100'
                                    }`}
                                >
                                    {trans(
                                        `destinations.tabs.${region.toLowerCase().replace(/\s+/g, '_')}` as any,
                                    )}
                                </button>
                            ))}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="ml-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-red-500 transition-all hover:bg-red-50 md:px-3 md:py-1.5 md:text-xs"
                                >
                                    {trans('destinations.empty.clear_filters')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Countries Grid */}
                    {filteredCountries.length === 0 ? (
                        <div className="rounded-2xl border border-primary-100 bg-primary-50 py-16 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                                <MapPin className="h-7 w-7 text-primary-500" />
                            </div>
                            <h3 className="text-xl font-bold text-primary-900">
                                {trans('destinations.empty.title')}
                            </h3>
                            <p className="mt-2 text-primary-600">
                                {trans('destinations.empty.description')}
                            </p>
                            <GoldButton className="mt-5" onClick={clearFilters}>
                                {trans('destinations.empty.clear_filters')}
                            </GoldButton>
                        </div>
                    ) : (
                        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredCountries.map((country, index) => (
                                <DestinationCard
                                    key={country.id}
                                    id={country.id}
                                    name={country.name}
                                    iso_code={country.iso_code}
                                    package_count={country.package_count}
                                    min_price={country.min_price}
                                    onClick={() =>
                                        handleDestinationClick(
                                            country,
                                            index,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Help Section */}
            <section className="relative overflow-hidden border-t border-primary-100 py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />
                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-xl text-center">
                        <h2 className="mb-2 text-lg font-bold text-primary-900">
                            {trans('destinations.help.title')}
                        </h2>
                        <p className="mb-5 text-sm text-primary-600">
                            {trans('destinations.help.description')}
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link
                                href={howItWorks.url()}
                                className="inline-flex h-8 items-center justify-center rounded-full border border-primary-200 bg-white px-4 text-sm font-medium text-primary-700 shadow-sm transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
                            >
                                {trans('nav.how_it_works')}
                            </Link>
                            <Link
                                href="/help"
                                className="inline-flex h-8 items-center justify-center rounded-full border border-primary-200 bg-white px-4 text-sm font-medium text-primary-700 shadow-sm transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
                            >
                                {trans('destinations.help.get_help')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
