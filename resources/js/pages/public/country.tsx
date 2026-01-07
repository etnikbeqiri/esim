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
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Database,
    Globe,
    Info,
    Search,
    Shield,
    Smartphone,
    Wifi,
    Zap,
} from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';

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
function NetworkCoverageDialog({ networks, isFeatured }: { networks: NetworkData; isFeatured: boolean }) {
    const [searchQuery, setSearchQuery] = useState('');

    const isGrouped = networks.length > 0 && 'country' in networks[0];

    const filteredNetworks = useMemo(() => {
        if (!searchQuery.trim()) return networks;

        const query = searchQuery.toLowerCase();

        if (isGrouped) {
            return (networks as CountryNetwork[]).filter(
                (cn) =>
                    cn.country.toLowerCase().includes(query) ||
                    cn.operators.some((op) => op.name.toLowerCase().includes(query))
            );
        } else {
            return (networks as NetworkOperator[]).filter((op) =>
                op.name.toLowerCase().includes(query)
            );
        }
    }, [networks, searchQuery, isGrouped]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
                        isFeatured
                            ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                >
                    <Info className="h-3.5 w-3.5" />
                    View Network Coverage
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-md overflow-hidden border-primary-200 bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary-900">
                        <Wifi className="h-5 w-5 text-primary-600" />
                        Network Coverage
                    </DialogTitle>
                </DialogHeader>

                {/* Search Input */}
                {isGrouped && (networks as CountryNetwork[]).length > 5 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                        <input
                            type="text"
                            placeholder="Search countries or networks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-primary-200 bg-primary-50 py-2 pl-10 pr-4 text-sm text-gray-950 placeholder:text-primary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                        />
                    </div>
                )}

                <div className="max-h-[50vh] overflow-y-auto pr-2">
                    <p className="mb-4 text-sm text-primary-600">
                        {isGrouped
                            ? `Showing ${filteredNetworks.length} ${filteredNetworks.length === 1 ? 'country' : 'countries'}`
                            : 'This plan connects to the following networks:'}
                    </p>

                    {filteredNetworks.length === 0 ? (
                        <p className="py-4 text-center text-sm text-primary-500">
                            No results found for "{searchQuery}"
                        </p>
                    ) : isGrouped ? (
                        // Regional packages - grouped by country
                        <div className="space-y-4">
                            {(filteredNetworks as CountryNetwork[]).map((countryNet, idx) => (
                                <div key={idx}>
                                    <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-900">
                                        <CountryFlag
                                            countryCode={countryNet.iso_code || 'XX'}
                                            size="sm"
                                            className="rounded"
                                        />
                                        {countryNet.country}
                                    </h4>
                                    <div className="space-y-1.5 pl-8">
                                        {countryNet.operators.map((op, opIdx) => (
                                            <div
                                                key={opIdx}
                                                className="flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50 px-3 py-2"
                                            >
                                                <span className="text-sm font-medium text-primary-900">
                                                    {op.name}
                                                </span>
                                                <span className="rounded-md bg-accent-300 px-2 py-0.5 text-xs font-bold text-accent-950">
                                                    {op.type}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Single country packages - flat list
                        <div className="space-y-2">
                            {(filteredNetworks as NetworkOperator[]).map((network, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50 px-4 py-3"
                                >
                                    <span className="font-semibold text-primary-900">
                                        {network.name}
                                    </span>
                                    <span className="rounded-md bg-accent-300 px-2 py-1 text-xs font-bold text-accent-950">
                                        {network.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function CountryPage({ country, packages }: Props) {
    const [sortBy, setSortBy] = useState<SortOption>('data');

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
            <Head title={`${country.name} eSIM Data Plans`}>
                <meta
                    name="description"
                    content={`Buy eSIM data plans for ${country.name}. ${packages.length} plans available with instant delivery. No roaming fees.`}
                />
            </Head>

            {/* Hero Header */}
            <section className="bg-mesh relative overflow-hidden py-16 md:py-20">
                {/* Decorative blobs */}
                <div className="animate-float absolute top-10 -left-20 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl" />
                <div className="animate-float-delayed absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-accent-200/30 blur-3xl" />

                <div className="relative z-10 container mx-auto px-4">
                    {/* Back Link */}
                    <Link
                        href="/destinations"
                        className="mb-8 inline-flex items-center rounded-full border border-primary-200 bg-white/70 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-primary-900 hover:shadow-md"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Destinations
                    </Link>

                    {/* Country Info */}
                    <div className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-10 md:text-left">
                        {/* Flag */}
                        <div className="group relative mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur-sm md:mb-0 md:h-40 md:w-40">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                            <CountryFlag
                                countryCode={country.iso_code}
                                className="relative z-10 h-20 w-32 transform shadow-md transition-transform duration-500 group-hover:scale-110 md:h-28 md:w-40"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                {country.region && (
                                    <Badge
                                        variant="secondary"
                                        className="border-primary-200 bg-primary-100 px-3 py-1 text-primary-800"
                                    >
                                        <Globe className="mr-1.5 h-3.5 w-3.5" />
                                        {country.region}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="border-primary-300 bg-white/50 px-3 py-1 text-primary-700 backdrop-blur-sm"
                                >
                                    {packages.length} Plan
                                    {packages.length !== 1 ? 's' : ''} Available
                                </Badge>
                            </div>

                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-primary-900 md:text-5xl lg:text-6xl">
                                {country.name}
                            </h1>

                            <p className="mb-6 max-w-2xl text-lg font-medium text-balance text-primary-700 md:text-xl">
                                Get instant mobile data with our premium eSIM
                                plans. No physical SIM needed, just scan and go.
                            </p>

                            {packages.length > 0 && (
                                <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-white/60 bg-white/60 px-5 py-3 shadow-sm backdrop-blur-sm md:justify-start">
                                    <div className="flex items-center gap-2 text-primary-800">
                                        <div className="rounded-full bg-accent-100 p-1.5">
                                            <Zap className="h-4 w-4 text-accent-600" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Instant Delivery
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-800">
                                        <div className="rounded-full bg-primary-100 p-1.5">
                                            <Shield className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Secure Payment
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 border-l border-primary-200 pl-4">
                                        <span className="text-sm font-medium text-primary-600">From</span>
                                        <span className="text-xl font-bold text-accent-500">
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
            <section className="relative bg-white py-12 md:py-16">
                {/* Subtle pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-[0.02]" />

                <div className="relative z-10 container mx-auto px-4">
                    {packages.length === 0 ? (
                        <div className="rounded-2xl border border-primary-100 bg-primary-50 py-16 text-center">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                <Smartphone className="h-8 w-8 text-primary-500" />
                            </div>
                            <h3 className="text-xl font-bold text-primary-900">
                                No plans available
                            </h3>
                            <p className="mt-2 text-primary-600">
                                Check back later for available data plans for{' '}
                                {country.name}
                            </p>
                            <GoldButton className="mt-6" asChild>
                                <Link href="/destinations">
                                    Browse Other Destinations
                                </Link>
                            </GoldButton>
                        </div>
                    ) : (
                        <>
                            {/* Sort Controls */}
                            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="flex items-center gap-3 text-xl font-bold text-primary-900">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-sm font-extrabold text-accent-700">
                                        {packages.length}
                                    </span>
                                    Available Packages
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-primary-900">
                                        Sort by:
                                    </span>
                                    <Select
                                        value={sortBy}
                                        onValueChange={(v) =>
                                            setSortBy(v as SortOption)
                                        }
                                    >
                                        <SelectTrigger className="w-[180px] border-primary-200 bg-white text-primary-900 focus:ring-primary-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-primary-200 bg-white">
                                            <SelectItem value="data" className="text-primary-900 focus:bg-primary-50">
                                                Data Amount
                                            </SelectItem>
                                            <SelectItem value="price-asc" className="text-primary-900 focus:bg-primary-50">
                                                Price: Low to High
                                            </SelectItem>
                                            <SelectItem value="price-desc" className="text-primary-900 focus:bg-primary-50">
                                                Price: High to Low
                                            </SelectItem>
                                            <SelectItem value="validity" className="text-primary-900 focus:bg-primary-50">
                                                Validity
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Package Grid */}
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {sortedPackages.map((pkg) => (
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
                                                <div className="rounded-bl-xl bg-gradient-to-l from-accent-500 via-accent-400 to-accent-300 px-4 py-1.5 text-xs font-bold text-accent-950 shadow-md shadow-accent-500/30">
                                                    BEST VALUE
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`relative z-10 flex-1 p-5 ${pkg.is_featured ? 'pt-8' : ''}`}
                                        >
                                            {/* Plan Name */}
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-primary-900">
                                                    {pkg.name}
                                                </h3>
                                            </div>

                                            {/* Network Type & Price */}
                                            {pkg.network_type && (
                                                <p className={`mb-1 text-xs font-bold uppercase tracking-wide ${
                                                    pkg.is_featured ? 'text-accent-300' : 'text-primary-400'
                                                }`}>
                                                    {pkg.network_type} Network
                                                </p>
                                            )}
                                            <div className="mb-5 flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold tracking-tight text-primary-900">
                                                    €{Number(pkg.retail_price).toFixed(2)}
                                                </span>
                                                <span className="text-sm font-medium text-primary-400">
                                                    EUR
                                                </span>
                                            </div>

                                            <div className="mb-5 h-px bg-primary-100" />

                                            {/* Data & Validity */}
                                            <div className="mb-5 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-300 text-accent-950'
                                                            : 'bg-primary-100 text-primary-600'
                                                    }`}>
                                                        <Database className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold leading-tight text-primary-900">
                                                            {pkg.data_label}
                                                        </p>
                                                        <p className="text-xs text-primary-500">
                                                            Data included
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${
                                                        pkg.is_featured
                                                            ? 'bg-accent-300 text-accent-950'
                                                            : 'bg-primary-100 text-primary-600'
                                                    }`}>
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold leading-tight text-primary-900">
                                                            {pkg.validity_label}
                                                        </p>
                                                        <p className="text-xs text-primary-500">
                                                            Validity period
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="space-y-2 text-sm">
                                                <FeatureItem variant={pkg.is_featured ? 'gold' : 'default'}>
                                                    Instant QR delivery
                                                </FeatureItem>
                                                {pkg.hotspot_allowed && (
                                                    <FeatureItem variant={pkg.is_featured ? 'gold' : 'default'}>
                                                        Hotspot / Tethering
                                                    </FeatureItem>
                                                )}
                                                <FeatureItem variant={pkg.is_featured ? 'gold' : 'default'}>
                                                    24/7 Support included
                                                </FeatureItem>
                                            </div>

                                            {/* Network Info Button */}
                                            {pkg.networks && pkg.networks.length > 0 && (
                                                <NetworkCoverageDialog
                                                    networks={pkg.networks}
                                                    isFeatured={pkg.is_featured}
                                                />
                                            )}
                                        </div>

                                        <div className="relative z-10 p-5 pt-0">
                                            {pkg.is_featured ? (
                                                <GoldButton
                                                    className="h-11 w-full text-sm"
                                                    asChild
                                                >
                                                    <Link href={`/checkout/${pkg.id}`}>
                                                        Select Plan
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </GoldButton>
                                            ) : (
                                                <Button
                                                    className="h-11 w-full bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
                                                    asChild
                                                >
                                                    <Link href={`/checkout/${pkg.id}`}>
                                                        Select Plan
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
                        </>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="relative overflow-hidden border-t border-primary-100 py-12 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />

                <div className="relative z-10 container mx-auto px-4">
                    <h2 className="mb-8 text-center text-2xl font-bold text-primary-900">
                        Why Choose Our eSIM?
                    </h2>
                    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
                        {[
                            {
                                icon: Zap,
                                title: 'Instant Activation',
                                description:
                                    'Get your eSIM QR code instantly after purchase. No waiting, no shipping.',
                            },
                            {
                                icon: Wifi,
                                title: 'Stay Connected',
                                description:
                                    'High-speed data on local networks. Works as soon as you land.',
                            },
                            {
                                icon: Shield,
                                title: 'No Hidden Fees',
                                description:
                                    'Transparent pricing. No roaming charges, no surprises.',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group flex flex-col items-center rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-300 transition-colors group-hover:bg-accent-400">
                                    <feature.icon className="h-6 w-6 text-accent-950" />
                                </div>
                                <h3 className="mb-2 font-bold text-primary-900">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-primary-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="rounded-full border-primary-300 bg-white text-primary-900 shadow-sm hover:bg-primary-50 hover:border-primary-400"
                        >
                            <Link href="/how-it-works">How It Works</Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="rounded-full border-primary-300 bg-white text-primary-900 shadow-sm hover:bg-primary-50 hover:border-primary-400"
                        >
                            <Link href="/help">Need Help?</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
