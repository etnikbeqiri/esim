import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Database,
    Globe,
    Shield,
    Smartphone,
    Wifi,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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

export default function CountryPage({ country, packages }: Props) {
    const [sortBy, setSortBy] = useState<SortOption>('data');

    function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    const sortedPackages = useMemo(() => {
        const sorted = [...packages];
        switch (sortBy) {
            case 'data':
                return sorted.sort((a, b) => a.data_mb - b.data_mb);
            case 'price-asc':
                return sorted.sort((a, b) => Number(a.retail_price) - Number(b.retail_price));
            case 'price-desc':
                return sorted.sort((a, b) => Number(b.retail_price) - Number(a.retail_price));
            case 'validity':
                return sorted.sort((a, b) => b.validity_days - a.validity_days);
            default:
                return sorted;
        }
    }, [packages, sortBy]);

    const lowestPrice = packages.length > 0
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
            <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-12 pt-8 md:pb-16 md:pt-12">
                <div className="container mx-auto px-4">
                    {/* Back Link */}
                    <Link
                        href="/destinations"
                        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Destinations
                    </Link>

                    {/* Country Info */}
                    <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-8">
                        {/* Flag */}
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-background shadow-lg md:mb-0 md:h-32 md:w-32">
                            <span className="text-6xl md:text-7xl">{getFlagEmoji(country.iso_code)}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                {country.region && (
                                    <Badge variant="secondary">
                                        <Globe className="mr-1 h-3 w-3" />
                                        {country.region}
                                    </Badge>
                                )}
                                <Badge variant="outline">
                                    {packages.length} Plan{packages.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>

                            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                                {country.name}
                            </h1>

                            <p className="mb-4 text-muted-foreground md:text-lg">
                                Get instant mobile data with our eSIM plans. No physical SIM needed.
                            </p>

                            {packages.length > 0 && (
                                <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:justify-start">
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="h-4 w-4 text-primary" />
                                        <span>Instant Delivery</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                                        Starting from €{lowestPrice.toFixed(2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {packages.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Smartphone className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No plans available</h3>
                            <p className="mt-1 text-muted-foreground">
                                Check back later for available data plans
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/destinations">Browse Other Destinations</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Sort Controls */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-xl font-semibold">
                                    Choose Your Plan
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Sort:</span>
                                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="data">Data Amount</SelectItem>
                                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                            <SelectItem value="validity">Validity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Package Grid */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {sortedPackages.map((pkg, index) => (
                                    <Card
                                        key={pkg.id}
                                        className={`relative flex flex-col transition-all hover:shadow-lg ${
                                            pkg.is_featured
                                                ? 'border-primary shadow-md ring-1 ring-primary'
                                                : ''
                                        }`}
                                    >
                                        {/* Featured Badge */}
                                        {pkg.is_featured && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className="shadow-sm">
                                                    Most Popular
                                                </Badge>
                                            </div>
                                        )}

                                        <CardContent className={`flex-1 ${pkg.is_featured ? 'pt-8' : 'pt-6'}`}>
                                            {/* Plan Name & Network */}
                                            <div className="mb-4">
                                                <h3 className="font-semibold">{pkg.name}</h3>
                                                {pkg.network_type && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {pkg.network_type} Network
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="mb-4">
                                                <span className="text-3xl font-bold">
                                                    €{Number(pkg.retail_price).toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Data & Validity */}
                                            <div className="mb-4 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                        <Database className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{pkg.data_label}</p>
                                                        <p className="text-xs text-muted-foreground">High-speed data</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{pkg.validity_label}</p>
                                                        <p className="text-xs text-muted-foreground">Validity period</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="space-y-1.5 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span>Instant QR code delivery</span>
                                                </div>
                                                {pkg.hotspot_allowed && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span>Hotspot / Tethering</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span>24/7 Support</span>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-0">
                                            <Button className="w-full" size="lg" asChild>
                                                <Link href={`/checkout/${pkg.id}`}>
                                                    Get This Plan
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="border-t bg-muted/30 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="mb-8 text-center text-2xl font-bold">
                        Why Choose Our eSIM?
                    </h2>
                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                <Zap className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="mb-2 font-semibold">Instant Activation</h3>
                            <p className="text-sm text-muted-foreground">
                                Get your eSIM QR code instantly after purchase. No waiting, no shipping.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                <Wifi className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="mb-2 font-semibold">Stay Connected</h3>
                            <p className="text-sm text-muted-foreground">
                                High-speed data on local networks. Works as soon as you land.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                <Shield className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="mb-2 font-semibold">No Hidden Fees</h3>
                            <p className="text-sm text-muted-foreground">
                                Transparent pricing. No roaming charges, no surprises.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/how-it-works">How It Works</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/help">Need Help?</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
