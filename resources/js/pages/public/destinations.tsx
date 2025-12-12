import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Globe, Search } from 'lucide-react';
import { useState } from 'react';

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
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/destinations', { ...filters, search: searchQuery || undefined }, { preserveState: true });
    }

    function handleRegionChange(region: string) {
        router.get('/destinations', { ...filters, region: region === 'all' ? undefined : region }, { preserveState: true });
    }

    // Group countries by region
    const groupedCountries = countries.reduce((acc, country) => {
        const region = country.region || 'Other';
        if (!acc[region]) {
            acc[region] = [];
        }
        acc[region].push(country);
        return acc;
    }, {} as Record<string, Country[]>);

    return (
        <GuestLayout>
            <Head title={`All Destinations - ${name}`} />

            {/* Header */}
            <section className="bg-gradient-to-b from-muted/50 to-background pb-8 pt-12 md:pt-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="mb-4 text-3xl font-bold md:text-4xl">All Destinations</h1>
                        <p className="text-muted-foreground">
                            Browse eSIM data plans for {countries.length} countries worldwide
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="border-b bg-background py-4 sticky top-16 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2 sm:max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search countries..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>

                        <Select value={filters.region || 'all'} onValueChange={handleRegionChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Regions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                {regions.map((region) => (
                                    <SelectItem key={region} value={region}>
                                        {region}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* Countries */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {countries.length === 0 ? (
                        <div className="py-16 text-center">
                            <Globe className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 font-semibold">No destinations found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try adjusting your search or filters
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.get('/destinations')}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : filters.region ? (
                        // Show flat grid when filtered by region
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {countries.map((country) => (
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
                    ) : (
                        // Show grouped by region
                        <div className="space-y-10">
                            {Object.entries(groupedCountries).map(([region, regionCountries]) => (
                                <div key={region}>
                                    <h2 className="mb-4 text-xl font-semibold">{region}</h2>
                                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {regionCountries.map((country) => (
                                            <Link
                                                key={country.id}
                                                href={`/destinations/${country.iso_code.toLowerCase()}`}
                                            >
                                                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                                                    <CardContent className="flex items-center gap-4 p-4">
                                                        <span className="text-3xl">{getFlagEmoji(country.iso_code)}</span>
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}
