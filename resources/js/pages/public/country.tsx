import { BackButton } from '@/components/back-button';
import { CountryFlag } from '@/components/country-flag';
import { FeatureItem } from '@/components/feature-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { GoldButton } from '@/components/ui/gold-button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import {
    useAnalytics,
    usePageViewTracking,
    useScrollTracking,
} from '@/lib/analytics';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Database,
    Globe,
    Info,
    MessageSquare,
    Phone,
    Search,
    Shield,
    Smartphone,
    Star,
    Wifi,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface NetworkOperator {
    name: string;
    type: string;
}

interface CountryNetwork {
    country: string;
    iso_code?: string | null;
    operators: NetworkOperator[];
}

type NetworkData = NetworkOperator[] | CountryNetwork[];

interface Package {
    id: number;
    name: string;
    data_mb: number;
    data_label: string;
    validity_days: number;
    validity_label: string;
    retail_price: string | number;
    is_featured: boolean;
    is_popular: boolean;
    network_type: string | null;
    sms_included: boolean;
    voice_included: boolean;
    hotspot_allowed: boolean;
    coverage_type: string | null;
    description: string | null;
    networks?: NetworkData;
}

interface Country {
    id: number;
    name: string;
    iso_code: string;
    region: string | null;
}

interface RegionalBundlePackage {
    id: number;
    name: string;
    data_mb: number;
    data_label: string;
    validity_days: number;
    validity_label: string;
    retail_price: string | number;
}

interface RegionalBundle {
    region_name: string;
    region_iso: string | null;
    country_count: number;
    packages: RegionalBundlePackage[];
    total_count: number;
    min_price: string | number;
}

interface Props {
    country: Country;
    packages: Package[];
    regionalBundles?: RegionalBundle[];
}

type SortOption =
    | 'best-value'
    | 'data'
    | 'most-data'
    | 'price-asc'
    | 'price-desc'
    | 'validity';

type DurationFilter = 'all' | 'short' | 'medium' | 'long' | 'extended';
type DataFilter = 'all' | 'light' | 'standard' | 'heavy' | 'unlimited';

// Inline network preview + "View All" dialog
function NetworkCoverageSection({
    networks,
    isFeatured,
    onOpen,
}: {
    networks: NetworkData;
    isFeatured: boolean;
    onOpen?: () => void;
}) {
    const { trans } = useTrans();
    const [searchQuery, setSearchQuery] = useState('');

    const hasGroupedFormat =
        networks.length > 0 && 'country' in networks[0];

    // If grouped format but only 1 country, flatten to operator list
    const isTrueRegional =
        hasGroupedFormat && (networks as CountryNetwork[]).length > 1;

    // Get a flat operator list for single-country display
    const flatOperators: NetworkOperator[] = useMemo(() => {
        if (!hasGroupedFormat) return networks as NetworkOperator[];
        if (!isTrueRegional) {
            // Single country in grouped format — extract its operators
            return (networks as CountryNetwork[])[0]?.operators ?? [];
        }
        return [];
    }, [networks, hasGroupedFormat, isTrueRegional]);

    const filteredNetworks = useMemo(() => {
        if (!searchQuery.trim()) return networks;
        const query = searchQuery.toLowerCase();
        if (hasGroupedFormat) {
            return (networks as CountryNetwork[]).filter(
                (cn) =>
                    cn.country.toLowerCase().includes(query) ||
                    cn.operators.some((op) =>
                        op.name.toLowerCase().includes(query),
                    ),
            );
        } else {
            return (networks as NetworkOperator[]).filter((op) =>
                op.name.toLowerCase().includes(query),
            );
        }
    }, [networks, searchQuery, hasGroupedFormat]);

    // Single-country: show all operators inline if ≤ 5, otherwise preview 4 + "view all"
    // Regional: always preview 3 countries + "view all" (too many details to inline)
    const SINGLE_INLINE_MAX = 5;
    const REGIONAL_PREVIEW = 3;

    const operatorCount = isTrueRegional
        ? (networks as CountryNetwork[]).length
        : flatOperators.length;

    const fitsInline = !isTrueRegional && operatorCount <= SINGLE_INLINE_MAX;

    return (
        <div className="mt-3 md:mt-4">
            <div className={`rounded-xl border p-2.5 md:rounded-lg md:p-3 ${
                isFeatured
                    ? 'border-accent-200 bg-accent-50/50'
                    : 'border-primary-100 bg-primary-50/50'
            }`}>
                <p className={`mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider md:mb-2 md:text-[11px] ${
                    isFeatured ? 'text-accent-600' : 'text-primary-500'
                }`}>
                    <Wifi className="h-3 w-3" />
                    {isTrueRegional
                        ? operatorCount === 1
                            ? trans('country_page.coverage.country_label')
                            : trans('country_page.coverage.countries_label')
                        : operatorCount === 1
                          ? trans('country_page.coverage.network_label')
                          : trans('country_page.coverage.networks_label')}
                </p>

                {!isTrueRegional && fitsInline ? (
                    // Single country, few operators — show ALL inline, no dialog
                    <div className="space-y-1">
                        {flatOperators.map((op, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg border border-white/80 bg-white px-2.5 py-1.5 shadow-sm"
                            >
                                <span className="text-[11px] font-semibold text-primary-800 md:text-xs">
                                    {op.name}
                                </span>
                                <span className="rounded-md bg-accent-300 px-1.5 py-0.5 text-[9px] font-bold text-accent-950 md:text-[10px]">
                                    {op.type}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : !isTrueRegional ? (
                    // Single country, many operators — preview + "view all"
                    <>
                        <div className="space-y-1">
                            {flatOperators
                                .slice(0, SINGLE_INLINE_MAX - 1)
                                .map((op, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-lg border border-white/80 bg-white px-2.5 py-1.5 shadow-sm"
                                    >
                                        <span className="text-[11px] font-semibold text-primary-800 md:text-xs">
                                            {op.name}
                                        </span>
                                        <span className="rounded-md bg-accent-300 px-1.5 py-0.5 text-[9px] font-bold text-accent-950 md:text-[10px]">
                                            {op.type}
                                        </span>
                                    </div>
                                ))}
                        </div>
                        <Dialog onOpenChange={(open) => open && onOpen?.()}>
                            <DialogTrigger asChild>
                                <button className={`mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold transition-colors md:text-xs ${
                                    isFeatured
                                        ? 'bg-accent-200/60 text-accent-700 hover:bg-accent-200'
                                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                }`}>
                                    {trans(
                                        'country_page.coverage.more_networks',
                                        {
                                            count: (
                                                operatorCount -
                                                (SINGLE_INLINE_MAX - 1)
                                            ).toString(),
                                        },
                                    )}
                                    <ArrowRight className="h-2.5 w-2.5" />
                                </button>
                            </DialogTrigger>
                            <NetworkCoverageDialogContent
                                networks={networks}
                                isGrouped={hasGroupedFormat}
                                filteredNetworks={filteredNetworks}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                        </Dialog>
                    </>
                ) : (
                    // Regional (multiple countries): show country flag pills + "view all"
                    <>
                        <div className="flex flex-wrap gap-1.5">
                            {(networks as CountryNetwork[])
                                .slice(0, REGIONAL_PREVIEW)
                                .map((cn, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 rounded-md border border-white/80 bg-white px-2 py-1 text-[11px] font-medium text-primary-800 shadow-sm"
                                    >
                                        <CountryFlag
                                            countryCode={cn.iso_code || 'XX'}
                                            size="sm"
                                            className="h-3 w-4 rounded-sm"
                                        />
                                        {cn.country}
                                    </span>
                                ))}
                            {operatorCount > REGIONAL_PREVIEW && (
                                <Dialog
                                    onOpenChange={(open) =>
                                        open && onOpen?.()
                                    }
                                >
                                    <DialogTrigger asChild>
                                        <button
                                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
                                                isFeatured
                                                    ? 'bg-accent-200/60 text-accent-700 hover:bg-accent-200'
                                                    : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                            }`}
                                        >
                                            {trans(
                                                'country_page.coverage.more_countries',
                                                {
                                                    count: (
                                                        operatorCount -
                                                        REGIONAL_PREVIEW
                                                    ).toString(),
                                                },
                                            )}
                                            <ArrowRight className="h-2.5 w-2.5" />
                                        </button>
                                    </DialogTrigger>
                                    <NetworkCoverageDialogContent
                                        networks={networks}
                                        isGrouped={hasGroupedFormat}
                                        filteredNetworks={filteredNetworks}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />
                                </Dialog>
                            )}
                        </div>
                        {operatorCount <= REGIONAL_PREVIEW && (
                            <Dialog
                                onOpenChange={(open) => open && onOpen?.()}
                            >
                                <DialogTrigger asChild>
                                    <button
                                        className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold transition-colors md:text-xs ${
                                            isFeatured
                                                ? 'bg-accent-200/60 text-accent-700 hover:bg-accent-200'
                                                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                        }`}
                                    >
                                        <Info className="h-3 w-3" />
                                        {trans(
                                            'country_page.coverage.view_all',
                                        )}
                                    </button>
                                </DialogTrigger>
                                <NetworkCoverageDialogContent
                                    networks={networks}
                                    isGrouped={hasGroupedFormat}
                                    filteredNetworks={filteredNetworks}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                />
                            </Dialog>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Extracted dialog content (shared between all trigger buttons)
function NetworkCoverageDialogContent({
    networks,
    isGrouped,
    filteredNetworks,
    searchQuery,
    setSearchQuery,
}: {
    networks: NetworkData;
    isGrouped: boolean;
    filteredNetworks: NetworkData;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}) {
    const { trans } = useTrans();

    return (
        <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-xl border-primary-200 bg-white p-4 md:rounded-lg md:p-6">
            <DialogHeader className="pb-2 md:pb-4">
                <DialogTitle className="flex items-center gap-2 text-sm text-primary-900 md:text-base">
                    <Wifi className="h-4 w-4 text-primary-600 md:h-5 md:w-5" />
                    {trans('country_page.coverage.title')}
                </DialogTitle>
            </DialogHeader>

            {/* Search Input */}
            {isGrouped && (networks as CountryNetwork[]).length > 5 && (
                <div className="relative mb-2 md:mb-0">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-primary-400 md:left-3 md:h-4 md:w-4" />
                    <input
                        type="text"
                        placeholder={trans(
                            'country_page.coverage.search_placeholder',
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-primary-200 bg-primary-50 py-1.5 pr-3 pl-8 text-base text-gray-950 placeholder:text-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none md:rounded-lg md:py-2 md:pr-4 md:pl-10 md:text-sm"
                    />
                </div>
            )}

            <div className="max-h-[55vh] overflow-y-auto pr-1 md:pr-2">
                <p className="mb-2 text-xs text-primary-600 md:mb-4 md:text-sm">
                    {isGrouped
                        ? filteredNetworks.length === 1
                            ? trans('country_page.coverage.country_count', {
                                  count: filteredNetworks.length.toString(),
                              })
                            : trans(
                                  'country_page.coverage.countries_count',
                                  {
                                      count: filteredNetworks.length.toString(),
                                  },
                              )
                        : trans('country_page.coverage.available_networks')}
                </p>

                {filteredNetworks.length === 0 ? (
                    <p className="py-3 text-center text-xs text-primary-500 md:py-4 md:text-sm">
                        {trans('country_page.coverage.no_results', {
                            query: searchQuery,
                        })}
                    </p>
                ) : isGrouped ? (
                    <div className="space-y-3 md:space-y-4">
                        {(filteredNetworks as CountryNetwork[]).map(
                            (countryNet, idx) => (
                                <div key={idx}>
                                    <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary-900 md:mb-2 md:gap-2 md:text-sm">
                                        <CountryFlag
                                            countryCode={
                                                countryNet.iso_code || 'XX'
                                            }
                                            size="sm"
                                            className="h-4 w-5 rounded md:h-5 md:w-6"
                                        />
                                        {countryNet.country}
                                    </h4>
                                    <div className="space-y-1 pl-6 md:space-y-1.5 md:pl-8">
                                        {countryNet.operators.map(
                                            (op, opIdx) => (
                                                <div
                                                    key={opIdx}
                                                    className="flex items-center justify-between rounded-md border border-primary-100 bg-primary-50 px-2 py-1.5 md:rounded-lg md:px-3 md:py-2"
                                                >
                                                    <span className="text-xs font-medium text-primary-900 md:text-sm">
                                                        {op.name}
                                                    </span>
                                                    <span className="rounded bg-accent-300 px-1.5 py-0.5 text-[10px] font-bold text-accent-950 md:rounded-md md:px-2 md:text-xs">
                                                        {op.type}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                ) : (
                    <div className="space-y-1.5 md:space-y-2">
                        {(filteredNetworks as NetworkOperator[]).map(
                            (network, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-md border border-primary-100 bg-primary-50 px-2.5 py-2 md:rounded-lg md:px-4 md:py-3"
                                >
                                    <span className="text-xs font-semibold text-primary-900 md:text-base">
                                        {network.name}
                                    </span>
                                    <span className="rounded bg-accent-300 px-1.5 py-0.5 text-[10px] font-bold text-accent-950 md:rounded-md md:px-2 md:py-1 md:text-xs">
                                        {network.type}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
    );
}

export default function CountryPage({ country, packages, regionalBundles }: Props) {
    const { trans } = useTrans();
    const [sortBy, setSortBy] = useState<SortOption>('best-value');
    const [durationFilter, setDurationFilter] =
        useState<DurationFilter>('all');
    const [dataFilter, setDataFilter] = useState<DataFilter>('all');
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const {
        viewItemList,
        selectItem,
        filterApplied,
        createItem,
        viewNetworkCoverage,
    } = useAnalytics();

    const hasFeaturedPackages = packages.some((p) => p.is_featured);
    const hasActiveFilters =
        durationFilter !== 'all' || dataFilter !== 'all' || featuredOnly;

    usePageViewTracking('country', country.name, {
        country_code: country.iso_code,
    });

    useScrollTracking('guide', `country-${country.iso_code}`, country.name);

    // Create analytics items from packages
    const createAnalyticsItem = useCallback(
        (pkg: Package, index?: number) =>
            createItem({
                id: String(pkg.id),
                name: pkg.name,
                category: 'eSIM Package',
                category2: country.name,
                brand: 'eSIM',
                price: Number(pkg.retail_price),
                currency: 'EUR',
                index,
            }),
        [createItem, country.name],
    );

    useEffect(() => {
        if (packages.length > 0) {
            const items = packages.map((pkg, index) =>
                createAnalyticsItem(pkg, index),
            );
            viewItemList(
                `country_${country.iso_code}`,
                `${country.name} eSIM Packages`,
                items,
            );
        }
    }, [
        packages,
        country.iso_code,
        country.name,
        viewItemList,
        createAnalyticsItem,
    ]);

    const handleSortChange = useCallback(
        (value: string) => {
            const sortOption = value as SortOption;
            setSortBy(sortOption);
            filterApplied('sort', sortOption, 'country');
        },
        [filterApplied],
    );

    const handleDurationFilter = useCallback(
        (value: DurationFilter) => {
            setDurationFilter(value);
            filterApplied('duration', value, 'country');
        },
        [filterApplied],
    );

    const handleDataFilter = useCallback(
        (value: DataFilter) => {
            setDataFilter(value);
            filterApplied('data_size', value, 'country');
        },
        [filterApplied],
    );

    const clearFilters = useCallback(() => {
        setDurationFilter('all');
        setDataFilter('all');
        setFeaturedOnly(false);
    }, []);

    const handleSelectPlan = useCallback(
        (pkg: Package, index: number) => {
            const item = createAnalyticsItem(pkg, index);
            selectItem(
                item,
                `country_${country.iso_code}`,
                `${country.name} eSIM Packages`,
            );
        },
        [createAnalyticsItem, selectItem, country.iso_code, country.name],
    );

    const handleViewNetworkCoverage = useCallback(
        (pkg: Package) => {
            const operatorsCount = pkg.networks?.length ?? 0;
            viewNetworkCoverage(
                country.iso_code,
                String(pkg.id),
                operatorsCount,
            );
        },
        [viewNetworkCoverage, country.iso_code],
    );

    const filteredAndSortedPackages = useMemo(() => {
        let result = [...packages];

        // Apply featured filter
        if (featuredOnly) {
            result = result.filter((pkg) => pkg.is_featured);
        }

        // Apply duration filter
        if (durationFilter !== 'all') {
            result = result.filter((pkg) => {
                switch (durationFilter) {
                    case 'short':
                        return pkg.validity_days >= 1 && pkg.validity_days <= 7;
                    case 'medium':
                        return (
                            pkg.validity_days >= 8 && pkg.validity_days <= 15
                        );
                    case 'long':
                        return (
                            pkg.validity_days >= 16 && pkg.validity_days <= 30
                        );
                    case 'extended':
                        return pkg.validity_days > 30;
                    default:
                        return true;
                }
            });
        }

        // Apply data filter
        if (dataFilter !== 'all') {
            result = result.filter((pkg) => {
                switch (dataFilter) {
                    case 'light':
                        return pkg.data_mb < 1024;
                    case 'standard':
                        return pkg.data_mb >= 1024 && pkg.data_mb <= 3072;
                    case 'heavy':
                        return pkg.data_mb > 3072 && pkg.data_mb <= 10240;
                    case 'unlimited':
                        return pkg.data_mb > 10240;
                    default:
                        return true;
                }
            });
        }

        // Sort
        switch (sortBy) {
            case 'best-value':
                return result.sort((a, b) => {
                    const aPerGb = Number(a.retail_price) / (a.data_mb / 1024);
                    const bPerGb = Number(b.retail_price) / (b.data_mb / 1024);
                    return aPerGb - bPerGb;
                });
            case 'data':
                return result.sort((a, b) => a.data_mb - b.data_mb);
            case 'most-data':
                return result.sort((a, b) => b.data_mb - a.data_mb);
            case 'price-asc':
                return result.sort(
                    (a, b) => Number(a.retail_price) - Number(b.retail_price),
                );
            case 'price-desc':
                return result.sort(
                    (a, b) => Number(b.retail_price) - Number(a.retail_price),
                );
            case 'validity':
                return result.sort(
                    (a, b) => b.validity_days - a.validity_days,
                );
            default:
                return result;
        }
    }, [packages, sortBy, durationFilter, dataFilter, featuredOnly]);

    const lowestPrice =
        packages.length > 0
            ? Math.min(...packages.map((p) => Number(p.retail_price)))
            : 0;

    return (
        <GuestLayout>
            <Head
                title={`${country.name} ${trans('country_page.meta_title_suffix')}`}
            >
                <meta
                    name="description"
                    content={trans('country_page.meta_description', {
                        country: country.name,
                        count: packages.length.toString(),
                    })}
                />
            </Head>

            {/* Seamless bg-mesh for hero + packages */}
            <div className="bg-mesh relative">
                <div className="animate-float absolute top-10 -left-20 h-48 w-48 rounded-full bg-primary-200/40 blur-3xl md:h-80 md:w-80" />
                <div className="animate-float-delayed absolute -right-20 bottom-40 h-64 w-64 rounded-full bg-accent-200/30 blur-3xl md:h-96 md:w-96" />

            {/* Hero Header */}
            <section className="relative overflow-hidden pt-4 pb-2 md:pt-8 md:pb-12">

                <div className="relative z-10 container mx-auto px-4">
                    <BackButton
                        href="/destinations"
                        label={trans('country_page.back_to_destinations')}
                        className="mb-3 md:mb-6"
                    />

                    {/* Country Info */}
                    <div className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-10 md:text-left">
                        {/* Flag */}
                        <div className="group relative mb-4 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/60 md:mb-0 md:rounded-2xl md:shadow-xl">
                            <CountryFlag
                                countryCode={country.iso_code}
                                className="relative z-10 block h-16 w-24 transform transition-transform duration-500 group-hover:scale-110 md:h-28 md:w-40"
                            />
                            <div className="pointer-events-none absolute inset-0 z-20 rounded-xl ring-1 ring-inset ring-black/10 md:rounded-2xl" />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 md:mb-4 md:justify-start md:gap-2">
                                {country.region && (
                                    <Badge
                                        variant="secondary"
                                        className="border-primary-200 bg-primary-100 px-2 py-0.5 text-xs text-primary-800 md:px-3 md:py-1 md:text-sm"
                                    >
                                        <Globe className="mr-1 h-3 w-3 md:mr-1.5 md:h-3.5 md:w-3.5" />
                                        {country.region}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="border-primary-300 bg-white/50 px-2 py-0.5 text-xs text-primary-700 backdrop-blur-sm md:px-3 md:py-1 md:text-sm"
                                >
                                    {packages.length}{' '}
                                    {packages.length !== 1
                                        ? trans('country_page.plans_unit')
                                        : trans('country_page.plan_unit')}
                                </Badge>
                            </div>

                            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl md:mb-4 md:text-5xl lg:text-6xl">
                                {country.name}
                            </h1>

                            <p className="mb-4 max-w-2xl text-sm font-medium text-balance text-primary-700 md:mb-6 md:text-xl">
                                {trans('country_page.hero_description')}
                            </p>

                            {packages.length > 0 && (
                                <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm md:justify-start md:gap-4 md:rounded-2xl md:px-5 md:py-3">
                                    <div className="flex items-center gap-1.5 text-primary-800 md:gap-2">
                                        <div className="rounded-full bg-accent-100 p-1 md:p-1.5">
                                            <Zap className="h-3 w-3 text-accent-600 md:h-4 md:w-4" />
                                        </div>
                                        <span className="text-xs font-medium md:text-sm">
                                            {trans(
                                                'country_page.badges.instant',
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-primary-800 md:gap-2">
                                        <div className="rounded-full bg-primary-100 p-1 md:p-1.5">
                                            <Shield className="h-3 w-3 text-primary-600 md:h-4 md:w-4" />
                                        </div>
                                        <span className="text-xs font-medium md:text-sm">
                                            {trans(
                                                'country_page.badges.secure',
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 border-l border-primary-200 pl-2 md:gap-2 md:pl-4">
                                        <span className="text-xs font-medium text-primary-600 md:text-sm">
                                            {trans('country_page.from')}
                                        </span>
                                        <span className="text-base font-bold text-accent-500 md:text-xl">
                                            €{lowestPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section className="relative overflow-hidden pt-2 pb-8 md:py-16">

                <div className="relative z-10 container mx-auto px-4">
                    {packages.length === 0 ? (
                        <div className="rounded-xl border border-primary-100 bg-primary-50 py-10 text-center md:rounded-2xl md:py-16">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 md:mb-5 md:h-16 md:w-16">
                                <Smartphone className="h-6 w-6 text-primary-500 md:h-8 md:w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-primary-900 md:text-xl">
                                {trans('country_page.no_plans.title')}
                            </h3>
                            <p className="mt-2 text-sm text-primary-600 md:text-base">
                                {trans('country_page.no_plans.description', {
                                    country: country.name,
                                })}
                            </p>
                            <GoldButton className="mt-5 md:mt-6" asChild>
                                <Link href="/destinations">
                                    {trans(
                                        'country_page.no_plans.browse_other',
                                    )}
                                </Link>
                            </GoldButton>
                        </div>
                    ) : (
                        <>
                            {/* Filter & Sort Controls */}
                            <div className="mb-3 space-y-3 rounded-xl border border-primary-100 bg-white p-3 shadow-sm md:mb-8 md:rounded-2xl md:p-4">
                                {/* Header row */}
                                <div className="flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 text-base font-bold text-primary-900 md:gap-3 md:text-xl">
                                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-accent-300 to-accent-400 px-1.5 py-0.5 text-xs font-extrabold text-accent-950 shadow-sm md:min-w-8 md:px-2 md:py-1 md:text-sm">
                                            {filteredAndSortedPackages.length}
                                        </span>
                                        {trans(
                                            'country_page.available_packages',
                                        )}
                                    </h2>
                                    <Select
                                        value={sortBy}
                                        onValueChange={handleSortChange}
                                    >
                                        <SelectTrigger className="h-7 w-[120px] border-primary-200 bg-primary-50 text-[10px] text-primary-600 focus:ring-primary-400 md:h-8 md:w-[150px] md:text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-primary-200 bg-white">
                                            <SelectItem
                                                value="best-value"
                                                className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                            >
                                                {trans(
                                                    'country_page.sort.best_value',
                                                )}
                                            </SelectItem>
                                            <SelectItem
                                                value="price-asc"
                                                className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                            >
                                                {trans(
                                                    'country_page.sort.price_asc',
                                                )}
                                            </SelectItem>
                                            <SelectItem
                                                value="price-desc"
                                                className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                            >
                                                {trans(
                                                    'country_page.sort.price_desc',
                                                )}
                                            </SelectItem>
                                            <SelectItem
                                                value="most-data"
                                                className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                            >
                                                {trans(
                                                    'country_page.sort.most_data',
                                                )}
                                            </SelectItem>
                                            <SelectItem
                                                value="validity"
                                                className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                            >
                                                {trans(
                                                    'country_page.sort.validity',
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quick Filter Chips */}
                                <div className="space-y-2 md:space-y-0">
                                    {/* Mobile: stacked rows / Desktop: single row */}
                                    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-2">
                                        {/* Featured + Duration row */}
                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                            {hasFeaturedPackages && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setFeaturedOnly(
                                                                !featuredOnly,
                                                            );
                                                            filterApplied(
                                                                'featured',
                                                                !featuredOnly
                                                                    ? 'yes'
                                                                    : 'all',
                                                                'country',
                                                            );
                                                        }}
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all md:px-3 md:py-1.5 md:text-xs ${
                                                            featuredOnly
                                                                ? 'border border-accent-600 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 text-accent-950 shadow-[0px_3px_10px_rgba(212,175,55,0.3)]'
                                                                : 'border border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        }`}
                                                    >
                                                        <Star className="h-3 w-3" />
                                                        {trans(
                                                            'country_page.filters.featured',
                                                        )}
                                                    </button>
                                                    <div className="mx-0.5 hidden h-4 w-px bg-primary-200 md:block" />
                                                </>
                                            )}
                                            {(
                                                [
                                                    'short',
                                                    'medium',
                                                    'long',
                                                    'extended',
                                                ] as const
                                            ).map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() =>
                                                        handleDurationFilter(
                                                            durationFilter ===
                                                                key
                                                                ? 'all'
                                                                : key,
                                                        )
                                                    }
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all md:px-3 md:py-1.5 md:text-xs ${
                                                        durationFilter === key
                                                            ? 'border border-primary-700 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 text-white shadow-[0px_3px_10px_rgba(13,148,136,0.3)]'
                                                            : 'border border-transparent bg-primary-50 text-primary-600 hover:bg-primary-100'
                                                    }`}
                                                >
                                                    {trans(
                                                        `country_page.filters.duration.${key}` as any,
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mx-0.5 hidden h-4 w-px bg-primary-200 md:block" />

                                        {/* Data row */}
                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                            {(
                                                [
                                                    'light',
                                                    'standard',
                                                    'heavy',
                                                    'unlimited',
                                                ] as const
                                            ).map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() =>
                                                        handleDataFilter(
                                                            dataFilter === key
                                                                ? 'all'
                                                                : key,
                                                        )
                                                    }
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all md:px-3 md:py-1.5 md:text-xs ${
                                                        dataFilter === key
                                                            ? 'border border-accent-600 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 text-accent-950 shadow-[0px_3px_10px_rgba(212,175,55,0.3)]'
                                                            : 'border border-transparent bg-accent-50 text-accent-700 hover:bg-accent-100'
                                                    }`}
                                                >
                                                    {trans(
                                                        `country_page.filters.data.${key}` as any,
                                                    )}
                                                </button>
                                            ))}

                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="ml-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-red-500 transition-all hover:bg-red-50 md:px-3 md:py-1.5 md:text-xs"
                                                >
                                                    {trans(
                                                        'country_page.filters.clear',
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Package Grid */}
                            {filteredAndSortedPackages.length === 0 ? (
                                <div className="rounded-xl border border-primary-100 bg-primary-50 py-10 text-center md:rounded-2xl md:py-16">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 md:mb-5 md:h-16 md:w-16">
                                        <Search className="h-6 w-6 text-primary-500 md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-900 md:text-xl">
                                        {trans(
                                            'country_page.filters.no_results',
                                        )}
                                    </h3>
                                    <GoldButton
                                        className="mt-5 md:mt-6"
                                        onClick={clearFilters}
                                    >
                                        {trans(
                                            'country_page.filters.no_results_action',
                                        )}
                                    </GoldButton>
                                </div>
                            ) : (
                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredAndSortedPackages.map((pkg, index) => (
                                    <div
                                        key={pkg.id}
                                        className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                                            pkg.is_featured
                                                ? 'border-accent-400 bg-white shadow-md'
                                                : 'border-primary-100 bg-white hover:border-primary-200'
                                        }`}
                                    >
                                        {/* Featured Badge */}
                                        {pkg.is_featured && (
                                            <div className="absolute top-0 right-0 z-20">
                                                <div className="rounded-bl-xl bg-gradient-to-l from-accent-500 via-accent-400 to-accent-300 px-3 py-1 text-[10px] font-bold text-accent-950 shadow-md shadow-accent-500/30 md:px-4 md:py-1.5 md:text-xs">
                                                    {trans(
                                                        'country_page.best_value',
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`relative z-10 flex-1 p-4 md:p-5 ${pkg.is_featured ? 'pt-8' : ''}`}
                                        >
                                            {/* Plan Name + Network Type */}
                                            <div className="mb-3 md:mb-4">
                                                <h3 className="text-base font-bold text-primary-900 md:text-lg">
                                                    {pkg.name}
                                                </h3>
                                                {pkg.network_type && (
                                                    <p
                                                        className={`mt-0.5 text-[10px] font-bold tracking-wide uppercase md:text-xs ${
                                                            pkg.is_featured
                                                                ? 'text-accent-500'
                                                                : 'text-primary-400'
                                                        }`}
                                                    >
                                                        {pkg.network_type}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price - Hero element on mobile */}
                                            <div className="mb-4">
                                                <span className="text-3xl font-extrabold tracking-tight text-primary-900">
                                                    €
                                                    {Number(
                                                        pkg.retail_price,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Data & Validity - Clear side-by-side boxes */}
                                            <div className="mb-4 flex gap-2 md:mb-5 md:block md:space-y-3">
                                                <div
                                                    className={`flex flex-1 items-center gap-2.5 rounded-xl p-2.5 md:gap-3 md:rounded-none md:bg-transparent md:p-0 ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-50'
                                                            : 'bg-primary-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm md:h-9 md:w-9 ${
                                                            pkg.is_featured
                                                                ? 'bg-accent-300 text-accent-950'
                                                                : 'bg-primary-100 text-primary-600'
                                                        }`}
                                                    >
                                                        <Database className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold leading-tight text-primary-900 md:text-base">
                                                            {pkg.data_label}
                                                        </p>
                                                        <p className="text-[10px] text-primary-500 md:text-xs">
                                                            {trans(
                                                                'country_page.data_included',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex flex-1 items-center gap-2.5 rounded-xl p-2.5 md:gap-3 md:rounded-none md:bg-transparent md:p-0 ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-50'
                                                            : 'bg-primary-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm md:h-9 md:w-9 ${
                                                            pkg.is_featured
                                                                ? 'bg-accent-300 text-accent-950'
                                                                : 'bg-primary-100 text-primary-600'
                                                        }`}
                                                    >
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold leading-tight text-primary-900 md:text-base">
                                                            {pkg.validity_label}
                                                        </p>
                                                        <p className="text-[10px] text-primary-500 md:text-xs">
                                                            {trans(
                                                                'country_page.validity_period',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Feature Badges - Visible on both mobile and desktop */}
                                            <div className="mb-3 flex flex-wrap gap-1.5 md:mb-0 md:hidden">
                                                {/* Mobile: compact pill badges */}
                                                {pkg.hotspot_allowed && (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-100 text-accent-700'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                        <Wifi className="h-2.5 w-2.5" />
                                                        {trans('country_page.features.hotspot_short')}
                                                    </span>
                                                )}
                                                {pkg.sms_included && (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-100 text-accent-700'
                                                            : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                        <MessageSquare className="h-2.5 w-2.5" />
                                                        {trans('country_page.features.sms_short')}
                                                    </span>
                                                )}
                                                {pkg.voice_included && (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-100 text-accent-700'
                                                            : 'bg-violet-50 text-violet-700'
                                                    }`}>
                                                        <Phone className="h-2.5 w-2.5" />
                                                        {trans('country_page.features.voice_short')}
                                                    </span>
                                                )}
                                                {!pkg.sms_included && !pkg.voice_included && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-500">
                                                        <Database className="h-2.5 w-2.5" />
                                                        {trans('country_page.features.data_only')}
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    pkg.is_featured
                                                        ? 'bg-accent-100 text-accent-700'
                                                        : 'bg-primary-50 text-primary-600'
                                                }`}>
                                                    <Zap className="h-2.5 w-2.5" />
                                                    {trans('country_page.badges.instant')}
                                                </span>
                                            </div>

                                            {/* Desktop: feature list items */}
                                            <div className="hidden space-y-2 text-sm md:block">
                                                <FeatureItem
                                                    variant={
                                                        pkg.is_featured
                                                            ? 'gold'
                                                            : 'default'
                                                    }
                                                >
                                                    {trans(
                                                        'country_page.features.instant_delivery',
                                                    )}
                                                </FeatureItem>
                                                {pkg.hotspot_allowed && (
                                                    <FeatureItem
                                                        variant={
                                                            pkg.is_featured
                                                                ? 'gold'
                                                                : 'default'
                                                        }
                                                    >
                                                        {trans(
                                                            'country_page.features.hotspot',
                                                        )}
                                                    </FeatureItem>
                                                )}
                                                {pkg.sms_included && (
                                                    <FeatureItem
                                                        variant={
                                                            pkg.is_featured
                                                                ? 'gold'
                                                                : 'default'
                                                        }
                                                    >
                                                        {trans(
                                                            'country_page.features.sms',
                                                        )}
                                                    </FeatureItem>
                                                )}
                                                {pkg.voice_included && (
                                                    <FeatureItem
                                                        variant={
                                                            pkg.is_featured
                                                                ? 'gold'
                                                                : 'default'
                                                        }
                                                    >
                                                        {trans(
                                                            'country_page.features.voice',
                                                        )}
                                                    </FeatureItem>
                                                )}
                                                <FeatureItem
                                                    variant={
                                                        pkg.is_featured
                                                            ? 'gold'
                                                            : 'default'
                                                    }
                                                >
                                                    {trans(
                                                        'country_page.features.support',
                                                    )}
                                                </FeatureItem>
                                            </div>

                                            {/* Network Info Button */}
                                            {pkg.networks &&
                                                pkg.networks.length > 0 && (
                                                    <NetworkCoverageSection
                                                        networks={pkg.networks}
                                                        isFeatured={
                                                            pkg.is_featured
                                                        }
                                                        onOpen={() =>
                                                            handleViewNetworkCoverage(
                                                                pkg,
                                                            )
                                                        }
                                                    />
                                                )}
                                        </div>

                                        <div className="relative z-10 p-4 pt-0 md:p-5 md:pt-0">
                                            {pkg.is_featured ? (
                                                <GoldButton
                                                    className="h-11 w-full text-sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/checkout/${pkg.id}`}
                                                        onClick={() =>
                                                            handleSelectPlan(
                                                                pkg,
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        {trans(
                                                            'country_page.select_plan',
                                                        )}
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </GoldButton>
                                            ) : (
                                                <Button
                                                    className="h-11 w-full bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/checkout/${pkg.id}`}
                                                        onClick={() =>
                                                            handleSelectPlan(
                                                                pkg,
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        {trans(
                                                            'country_page.select_plan',
                                                        )}
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Subtle hover gradient */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/0 to-accent-50/0 transition-all duration-300 group-hover:from-primary-50/50 group-hover:to-accent-50/30" />
                                    </div>
                                ))}
                            </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Regional Bundles Section */}
            {regionalBundles && regionalBundles.length > 0 && (
                <section className="relative overflow-hidden py-8 md:py-12">

                    <div className="relative z-10 container mx-auto px-4">
                        <div className="mb-5 text-center md:mb-8">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-sm md:text-sm">
                                <Globe className="h-3.5 w-3.5 text-primary-500" />
                                {trans(
                                    'country_page.regional_bundles.subtitle',
                                )}
                            </div>
                            <h2 className="text-lg font-extrabold tracking-tight text-primary-900 md:text-2xl">
                                {trans(
                                    'country_page.regional_bundles.title',
                                    { country: country.name },
                                )}
                            </h2>
                        </div>

                        <div className="space-y-5 md:space-y-6">
                            {regionalBundles.map((bundle) => (
                                <div
                                    key={bundle.region_iso}
                                    className="group/bundle overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm transition-shadow hover:shadow-md md:rounded-2xl"
                                >
                                    {/* Desktop: Side-by-side layout / Mobile: Stacked */}
                                    <div className="flex flex-col md:flex-row">
                                        {/* Region Info Panel */}
                                        <div className="relative flex items-center gap-3 border-b border-primary-100 bg-gradient-to-br from-primary-600 to-primary-700 p-4 md:w-56 md:shrink-0 md:flex-col md:items-start md:justify-center md:gap-4 md:border-b-0 md:border-r md:p-6">
                                            {/* Subtle pattern overlay */}
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />

                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner backdrop-blur-sm md:h-12 md:w-12">
                                                <Globe className="h-5 w-5 text-white md:h-6 md:w-6" />
                                            </div>
                                            <div className="relative">
                                                <h3 className="text-base font-bold text-white md:text-lg">
                                                    {bundle.region_name}
                                                </h3>
                                                <p className="text-xs text-primary-200 md:mt-0.5 md:text-sm">
                                                    {trans(
                                                        'country_page.regional_bundles.covers',
                                                        {
                                                            count: bundle.country_count.toString(),
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                            <div className="ml-auto md:ml-0 md:mt-1">
                                                <p className="text-[10px] font-medium text-primary-300 md:text-xs">
                                                    {trans(
                                                        'country_page.regional_bundles.from',
                                                    )}
                                                </p>
                                                <p className="text-lg font-extrabold text-white md:text-2xl">
                                                    €
                                                    {Number(
                                                        bundle.min_price,
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Packages Grid */}
                                        <div className="flex-1 p-3 md:p-5">
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                                                {bundle.packages.map(
                                                    (pkg) => (
                                                        <Link
                                                            key={pkg.id}
                                                            href={`/checkout/${pkg.id}`}
                                                            className="group relative flex flex-col overflow-hidden rounded-lg border border-primary-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md md:rounded-xl md:p-4"
                                                        >
                                                            <span className="text-sm font-bold text-primary-900 md:text-base">
                                                                {
                                                                    pkg.data_label
                                                                }
                                                            </span>
                                                            <span className="mt-0.5 flex items-center gap-1 text-[10px] text-primary-500 md:text-xs">
                                                                <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                                {
                                                                    pkg.validity_label
                                                                }
                                                            </span>
                                                            <span className="mt-2 text-base font-extrabold tracking-tight text-primary-900 md:mt-3 md:text-lg">
                                                                €
                                                                {Number(
                                                                    pkg.retail_price,
                                                                ).toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                            <span className="mt-1.5 flex items-center gap-0.5 text-[10px] font-semibold text-primary-500 transition-colors group-hover:text-primary-700 md:text-xs">
                                                                {trans(
                                                                    'country_page.select_plan',
                                                                )}
                                                                <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5 md:h-3 md:w-3" />
                                                            </span>
                                                            {/* Hover gradient overlay */}
                                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/0 to-accent-50/0 transition-all duration-200 group-hover:from-primary-50/40 group-hover:to-accent-50/20" />
                                                        </Link>
                                                    ),
                                                )}
                                            </div>

                                            {bundle.total_count > 4 &&
                                                bundle.region_iso && (
                                                    <div className="mt-3 flex justify-center md:mt-4">
                                                        <Link
                                                            href={`/destinations/${bundle.region_iso.toLowerCase()}`}
                                                            className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-700 transition-all hover:border-primary-300 hover:bg-primary-100 md:text-sm"
                                                        >
                                                            {trans(
                                                                'country_page.regional_bundles.view_all',
                                                                {
                                                                    region: bundle.region_name,
                                                                },
                                                            )}
                                                            <span className="rounded-full bg-primary-200/60 px-2 py-0.5 text-[10px] font-bold text-primary-600 md:text-xs">
                                                                {bundle.total_count}
                                                            </span>
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            </div>{/* end bg-mesh wrapper */}

            {/* Features Section */}
            <section className="relative overflow-hidden border-t border-primary-100 py-8 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />

                <div className="relative z-10 container mx-auto px-4">
                    <h2 className="mb-5 text-center text-lg font-bold text-primary-900 md:mb-8 md:text-2xl">
                        {trans('country_page.why_choose.title')}
                    </h2>
                    <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-3 md:gap-5">
                        {[
                            {
                                icon: Zap,
                                title: trans(
                                    'country_page.why_choose.instant.title',
                                ),
                                description: trans(
                                    'country_page.why_choose.instant.desc',
                                ),
                            },
                            {
                                icon: Wifi,
                                title: trans(
                                    'country_page.why_choose.connected.title',
                                ),
                                description: trans(
                                    'country_page.why_choose.connected.desc',
                                ),
                            },
                            {
                                icon: Shield,
                                title: trans(
                                    'country_page.why_choose.no_fees.title',
                                ),
                                description: trans(
                                    'country_page.why_choose.no_fees.desc',
                                ),
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:flex-col md:rounded-2xl md:p-6 md:text-center"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-300 transition-colors group-hover:bg-accent-400 md:mb-4 md:h-12 md:w-12 md:rounded-xl">
                                    <feature.icon className="h-5 w-5 text-accent-950 md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-primary-900 md:mb-2 md:text-base">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-primary-600 md:text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center gap-2 md:mt-10 md:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 rounded-full border-primary-300 bg-white px-3 text-xs text-primary-900 shadow-sm hover:border-primary-400 hover:bg-primary-50 md:h-9 md:px-4 md:text-sm"
                        >
                            <Link href="/how-it-works">
                                {trans('country_page.buttons.how_it_works')}
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 rounded-full border-primary-300 bg-white px-3 text-xs text-primary-900 shadow-sm hover:border-primary-400 hover:bg-primary-50 md:h-9 md:px-4 md:text-sm"
                        >
                            <Link href="/help">
                                {trans('country_page.buttons.help')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
