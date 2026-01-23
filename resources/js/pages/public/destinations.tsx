import { DestinationCard } from '@/components/destination-card';
import { HeroSection } from '@/components/hero-section';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { useAnalytics, usePageViewTracking, useScrollTracking } from '@/lib/analytics';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

    // Analytics hooks
    const { viewItemList, selectItem, search: trackSearch, filterApplied, createItem } = useAnalytics();
    usePageViewTracking('destinations', 'Destinations');
    useScrollTracking('guide', 'destinations-page', 'Destinations');

    const hasTrackedInitialList = useRef(false);
    const lastTrackedListKey = useRef<string>('');

    // Filter countries locally for instant feedback
    const filteredCountries = useMemo(() => {
        let result = countries;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (country) =>
                    country.name.toLowerCase().includes(query) ||
                    country.iso_code.toLowerCase().includes(query),
            );
        }

        if (activeRegion !== 'all') {
            result = result.filter(
                (country) => country.region === activeRegion,
            );
        }

        return result;
    }, [countries, searchQuery, activeRegion]);

    useEffect(() => {
        const listKey = `${activeRegion}-${searchQuery}-${filteredCountries.length}`;

        if (!hasTrackedInitialList.current || lastTrackedListKey.current !== listKey) {
            hasTrackedInitialList.current = true;
            lastTrackedListKey.current = listKey;

            if (filteredCountries.length > 0) {
                const items = filteredCountries.slice(0, 20).map((country, index) =>
                    createItem({
                        id: `country-${country.id}`,
                        name: country.name,
                        category: 'destination',
                        category2: country.region || undefined,
                        price: country.min_price || undefined,
                        index,
                    })
                );

                const listId = activeRegion !== 'all' ? `destinations-${activeRegion}` : 'destinations-all';
                const listName = activeRegion !== 'all' ? `Destinations - ${activeRegion}` : 'All Destinations';

                viewItemList(listId, listName, items);
            }
        }
    }, [filteredCountries, activeRegion, searchQuery, viewItemList, createItem]);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTrackedSearch = useRef<string>('');

    const handleSearchChange = useCallback((value: string) => {
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
    }, [trackSearch, filteredCountries.length]);

    const handleRegionChange = useCallback((region: string) => {
        setActiveRegion(region);
        filterApplied('region', region, 'destinations');
    }, [filterApplied]);

    const handleDestinationClick = useCallback((country: Country, index: number) => {
        const item = createItem({
            id: `country-${country.id}`,
            name: country.name,
            category: 'destination',
            category2: country.region || undefined,
            price: country.min_price || undefined,
            index,
        });

        const listId = activeRegion !== 'all' ? `destinations-${activeRegion}` : 'destinations-all';
        const listName = activeRegion !== 'all' ? `Destinations - ${activeRegion}` : 'All Destinations';

        selectItem(item, listId, listName);
    }, [activeRegion, createItem, selectItem]);

    function clearFilters() {
        setSearchQuery('');
        setActiveRegion('all');
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

            {/* Region Tabs */}
            <section className="sticky top-16 z-40 border-b border-primary-100 bg-white/90 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    <div className="no-scrollbar -mb-px flex gap-2 overflow-x-auto py-3">
                        {activeRegion === 'all' ? (
                            <GoldButton
                                size="sm"
                                onClick={() => handleRegionChange('all')}
                            >
                                {trans('destinations.tabs.all_regions')}
                            </GoldButton>
                        ) : (
                            <button
                                onClick={() => handleRegionChange('all')}
                                className="shrink-0 rounded-full border border-transparent bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-colors duration-200 hover:bg-primary-100"
                            >
                                {trans('destinations.tabs.all_regions')}
                            </button>
                        )}
                        {regions.map((region) =>
                            activeRegion === region ? (
                                <GoldButton
                                    key={region}
                                    size="sm"
                                    onClick={() => handleRegionChange(region)}
                                >
                                    {trans(
                                        `destinations.tabs.${region.toLowerCase().replace(' ', '_')}` as any,
                                    )}
                                </GoldButton>
                            ) : (
                                <button
                                    key={region}
                                    onClick={() => handleRegionChange(region)}
                                    className="shrink-0 rounded-full border border-transparent bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-colors duration-200 hover:bg-primary-100"
                                >
                                    {trans(
                                        `destinations.tabs.${region.toLowerCase().replace(' ', '_')}` as any,
                                    )}
                                </button>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* Countries Grid */}
            <section className="relative min-h-[60vh] overflow-hidden bg-white py-12 md:py-16">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-[0.02]" />

                <div className="relative z-10 container mx-auto px-4">
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
                        <>
                            <div className="mb-6">
                                <p className="text-sm font-medium text-primary-600">
                                    {trans('destinations.results.showing', {
                                        count: String(filteredCountries.length),
                                    })}{' '}
                                    {activeRegion !== 'all' &&
                                        trans(
                                            'destinations.results.in_region',
                                            { region: activeRegion },
                                        )}
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCountries.map((country, index) => (
                                    <DestinationCard
                                        key={country.id}
                                        id={country.id}
                                        name={country.name}
                                        iso_code={country.iso_code}
                                        package_count={country.package_count}
                                        min_price={country.min_price}
                                        onClick={() => handleDestinationClick(country, index)}
                                    />
                                ))}
                            </div>
                        </>
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
                                href="/how-it-works"
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
