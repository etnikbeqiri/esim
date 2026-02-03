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
import { useAnalytics, usePageViewTracking, useScrollTracking } from '@/lib/analytics';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Database,
    Globe,
    Info,
    Search,
    Shield,
    Smartphone,
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

interface Props {
    country: Country;
    packages: Package[];
}

type SortOption = 'data' | 'price-asc' | 'price-desc' | 'validity';

// Network Coverage Dialog Component with search
function NetworkCoverageDialog({
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

    const isGrouped = networks.length > 0 && 'country' in networks[0];

    const filteredNetworks = useMemo(() => {
        if (!searchQuery.trim()) return networks;

        const query = searchQuery.toLowerCase();

        if (isGrouped) {
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
    }, [networks, searchQuery, isGrouped]);

    return (
        <Dialog onOpenChange={(open) => open && onOpen?.()}>
            <DialogTrigger asChild>
                <button
                    className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-semibold transition-colors md:mt-4 md:gap-2 md:rounded-lg md:py-2 md:text-xs ${
                        isFeatured
                            ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                >
                    <Info className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    {trans('country_page.coverage.view')}
                </button>
            </DialogTrigger>
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
                        // Regional packages - grouped by country
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
                        // Single country packages - flat list
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
        </Dialog>
    );
}

export default function CountryPage({ country, packages }: Props) {
    const { trans } = useTrans();
    const [sortBy, setSortBy] = useState<SortOption>('data');
    const { viewItemList, selectItem, filterApplied, createItem, viewNetworkCoverage } = useAnalytics();

    usePageViewTracking('country', country.name, { country_code: country.iso_code });

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
            const items = packages.map((pkg, index) => createAnalyticsItem(pkg, index));
            viewItemList(`country_${country.iso_code}`, `${country.name} eSIM Packages`, items);
        }
    }, [packages, country.iso_code, country.name, viewItemList, createAnalyticsItem]);

    const handleSortChange = useCallback(
        (value: string) => {
            const sortOption = value as SortOption;
            setSortBy(sortOption);
            filterApplied('sort', sortOption, 'country');
        },
        [filterApplied],
    );

    const handleSelectPlan = useCallback(
        (pkg: Package, index: number) => {
            const item = createAnalyticsItem(pkg, index);
            selectItem(item, `country_${country.iso_code}`, `${country.name} eSIM Packages`);
        },
        [createAnalyticsItem, selectItem, country.iso_code, country.name],
    );

    const handleViewNetworkCoverage = useCallback(
        (pkg: Package) => {
            const operatorsCount = pkg.networks?.length ?? 0;
            viewNetworkCoverage(country.iso_code, String(pkg.id), operatorsCount);
        },
        [viewNetworkCoverage, country.iso_code],
    );

    const sortedPackages = useMemo(() => {
        const sorted = [...packages];
        switch (sortBy) {
            case 'data':
                return sorted.sort((a, b) => a.data_mb - b.data_mb);
            case 'price-asc':
                return sorted.sort(
                    (a, b) => Number(a.retail_price) - Number(b.retail_price),
                );
            case 'price-desc':
                return sorted.sort(
                    (a, b) => Number(b.retail_price) - Number(a.retail_price),
                );
            case 'validity':
                return sorted.sort((a, b) => b.validity_days - a.validity_days);
            default:
                return sorted;
        }
    }, [packages, sortBy]);

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

            {/* Hero Header */}
            <section className="bg-mesh relative overflow-hidden pt-4 pb-6 md:pt-8 md:pb-12">
                <div className="animate-float absolute top-10 -left-20 h-48 w-48 rounded-full bg-primary-200/40 blur-3xl md:h-80 md:w-80" />
                <div className="animate-float-delayed absolute -right-20 bottom-10 h-48 w-48 rounded-full bg-accent-200/30 blur-3xl md:h-80 md:w-80" />

                <div className="relative z-10 container mx-auto px-4">
                    <BackButton
                        href="/destinations"
                        label={trans('country_page.back_to_destinations')}
                        className="mb-3 md:mb-6"
                    />

                    {/* Country Info */}
                    <div className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-10 md:text-left">
                        {/* Flag */}
                        <div className="group relative mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-2 shadow-lg backdrop-blur-sm md:mb-0 md:h-40 md:w-40 md:rounded-3xl md:p-3 md:shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                            <CountryFlag
                                countryCode={country.iso_code}
                                className="relative z-10 h-14 w-20 transform shadow-md transition-transform duration-500 group-hover:scale-110 md:h-28 md:w-40"
                            />
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
            <section className="relative bg-white py-8 md:py-16">
                {/* Subtle pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-[0.02]" />

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
                            {/* Sort Controls */}
                            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-primary-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between md:mb-8 md:gap-4 md:rounded-2xl md:p-4">
                                <h2 className="flex items-center gap-2 text-base font-bold text-primary-900 md:gap-3 md:text-xl">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-xs font-extrabold text-accent-700 md:h-8 md:w-8 md:text-sm">
                                        {packages.length}
                                    </span>
                                    {trans('country_page.available_packages')}
                                </h2>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-xs font-medium text-primary-900 md:text-sm">
                                        {trans('country_page.sort.label')}
                                    </span>
                                    <Select
                                        value={sortBy}
                                        onValueChange={handleSortChange}
                                    >
                                        <SelectTrigger className="h-8 w-[115px] border-primary-200 bg-white text-xs text-primary-900 focus:ring-primary-400 md:h-10 md:w-[160px] md:text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-primary-200 bg-white">
                                            <SelectItem
                                                value="data"
                                                className="text-xs text-primary-900 focus:bg-primary-50 md:text-sm"
                                            >
                                                {trans(
                                                    'country_page.sort.data',
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
                            </div>

                            {/* Package Grid */}
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                {sortedPackages.map((pkg, index) => (
                                    <div
                                        key={pkg.id}
                                        className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:rounded-2xl ${
                                            pkg.is_featured
                                                ? 'border-accent-400 bg-white shadow-md'
                                                : 'border-primary-100 bg-white hover:border-primary-200'
                                        }`}
                                    >
                                        {/* Featured Badge */}
                                        {pkg.is_featured && (
                                            <div className="absolute top-0 right-0 z-20">
                                                <div className="rounded-bl-lg bg-gradient-to-l from-accent-500 via-accent-400 to-accent-300 px-2.5 py-1 text-[10px] font-bold text-accent-950 shadow-md shadow-accent-500/30 md:rounded-bl-xl md:px-4 md:py-1.5 md:text-xs">
                                                    {trans(
                                                        'country_page.best_value',
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`relative z-10 flex-1 p-3 md:p-5 ${pkg.is_featured ? 'pt-6 md:pt-8' : ''}`}
                                        >
                                            {/* Plan Name & Price Row - Mobile Optimized */}
                                            <div className="mb-3 flex items-start justify-between gap-2 md:mb-4 md:block">
                                                <div>
                                                    <h3 className="text-sm font-bold text-primary-900 md:mb-4 md:text-lg">
                                                        {pkg.name}
                                                    </h3>
                                                    {pkg.network_type && (
                                                        <p
                                                            className={`text-[10px] font-bold tracking-wide uppercase md:text-xs ${
                                                                pkg.is_featured
                                                                    ? 'text-accent-500'
                                                                    : 'text-primary-400'
                                                            }`}
                                                        >
                                                            {pkg.network_type}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right md:mb-4 md:text-left">
                                                    <span className="text-xl font-extrabold tracking-tight text-primary-900 md:text-3xl">
                                                        €
                                                        {Number(
                                                            pkg.retail_price,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-3 h-px bg-primary-100 md:mb-5" />

                                            {/* Data & Validity - Compact on Mobile */}
                                            <div className="mb-3 flex gap-2 md:mb-5 md:block md:space-y-3">
                                                <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 p-2 md:gap-3 md:bg-transparent md:p-0">
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md shadow-sm md:h-9 md:w-9 md:rounded-lg ${
                                                            pkg.is_featured
                                                                ? 'bg-accent-300 text-accent-950'
                                                                : 'bg-primary-100 text-primary-600'
                                                        }`}
                                                    >
                                                        <Database className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs leading-tight font-bold text-primary-900 md:text-base">
                                                            {pkg.data_label}
                                                        </p>
                                                        <p className="hidden text-xs text-primary-500 md:block">
                                                            {trans(
                                                                'country_page.data_included',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 p-2 md:gap-3 md:bg-transparent md:p-0">
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md shadow-sm md:h-9 md:w-9 md:rounded-lg ${
                                                            pkg.is_featured
                                                                ? 'bg-accent-300 text-accent-950'
                                                                : 'bg-primary-100 text-primary-600'
                                                        }`}
                                                    >
                                                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs leading-tight font-bold text-primary-900 md:text-base">
                                                            {pkg.validity_label}
                                                        </p>
                                                        <p className="hidden text-xs text-primary-500 md:block">
                                                            {trans(
                                                                'country_page.validity_period',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features - Hidden on Mobile, Visible on Desktop */}
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
                                                    <NetworkCoverageDialog
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

                                        <div className="relative z-10 p-3 pt-0 md:p-5 md:pt-0">
                                            {pkg.is_featured ? (
                                                <GoldButton
                                                    className="h-9 w-full text-xs md:h-11 md:text-sm"
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
                                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 md:ml-2 md:h-4 md:w-4" />
                                                    </Link>
                                                </GoldButton>
                                            ) : (
                                                <Button
                                                    className="h-9 w-full bg-primary-600 text-xs font-semibold text-white hover:bg-primary-700 md:h-11 md:text-sm"
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
                                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 md:ml-2 md:h-4 md:w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Subtle hover gradient */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/0 to-accent-50/0 transition-all duration-300 group-hover:from-primary-50/50 group-hover:to-accent-50/30" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

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
