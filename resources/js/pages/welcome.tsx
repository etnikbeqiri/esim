import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Globe,
    QrCode,
    Search,
    Shield,
    Smartphone,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Country {
    id: number;
    name: string;
    iso_code: string;
    package_count: number;
    min_price: number | null;
}

interface Props {
    featuredCountries: Country[];
    totalCountries: number;
    totalPackages: number;
}

export default function Welcome({ featuredCountries = [], totalCountries = 0, totalPackages = 0 }: Props) {
    const { name } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/destinations?search=${encodeURIComponent(searchQuery)}`);
        }
    }

    function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    return (
        <GuestLayout>
            <Head title={`${name} - Stay Connected Worldwide`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-20 pt-16 md:pb-32 md:pt-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-4">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Instant Activation
                        </Badge>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                            Stay Connected
                            <span className="block text-primary">Anywhere You Go</span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                            Get instant mobile data in {totalCountries}+ countries. No physical SIM needed.
                            Just scan, connect, and explore.
                        </p>

                        {/* Search Box */}
                        <form onSubmit={handleSearch} className="mx-auto max-w-xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Where are you traveling to?"
                                    className="h-14 rounded-full pl-12 pr-36 text-base shadow-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                                >
                                    Search
                                </Button>
                            </div>
                        </form>

                        {/* Quick Stats */}
                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground md:gap-12">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>{totalCountries}+ Countries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span>Instant Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Secure Payment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Destinations */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold md:text-3xl">Popular Destinations</h2>
                            <p className="mt-2 text-muted-foreground">
                                Browse our most popular travel destinations
                            </p>
                        </div>
                        <Button variant="ghost" asChild className="hidden md:flex">
                            <Link href="/destinations">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {featuredCountries.map((country) => (
                            <Link
                                key={country.id}
                                href={`/destinations/${country.iso_code.toLowerCase()}`}
                            >
                                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <span className="text-4xl">{getFlagEmoji(country.iso_code)}</span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                                                {country.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {country.package_count} plans
                                                {country.min_price && (
                                                    <span> from €{Number(country.min_price).toFixed(2)}</span>
                                                )}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" asChild>
                            <Link href="/destinations">
                                View All Destinations
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-muted/30 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
                        <p className="mt-2 text-muted-foreground">
                            Get connected in 3 simple steps
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                <Search className="h-8 w-8 text-primary" />
                            </div>
                            <div className="mb-2 text-sm font-medium text-primary">Step 1</div>
                            <h3 className="mb-2 text-lg font-semibold">Choose Your Plan</h3>
                            <p className="text-sm text-muted-foreground">
                                Select your destination and pick a data plan that fits your needs
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                <QrCode className="h-8 w-8 text-primary" />
                            </div>
                            <div className="mb-2 text-sm font-medium text-primary">Step 2</div>
                            <h3 className="mb-2 text-lg font-semibold">Scan QR Code</h3>
                            <p className="text-sm text-muted-foreground">
                                Receive your eSIM instantly via email and scan to install
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                <Smartphone className="h-8 w-8 text-primary" />
                            </div>
                            <div className="mb-2 text-sm font-medium text-primary">Step 3</div>
                            <h3 className="mb-2 text-lg font-semibold">Stay Connected</h3>
                            <p className="text-sm text-muted-foreground">
                                Activate when you arrive and enjoy high-speed data
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                <div>
                                    <h3 className="font-medium">No Roaming Fees</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Avoid expensive roaming charges
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                <div>
                                    <h3 className="font-medium">Instant Activation</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get connected in minutes
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                <div>
                                    <h3 className="font-medium">Keep Your Number</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your main SIM stays active
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                <div>
                                    <h3 className="font-medium">24/7 Support</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We're here to help anytime
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary py-16 text-primary-foreground md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                        Ready to Travel Connected?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl opacity-90">
                        Browse our {totalPackages}+ data plans across {totalCountries}+ countries
                        and get instant connectivity for your next trip.
                    </p>
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="/destinations">
                            Browse Destinations
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </GuestLayout>
    );
}
