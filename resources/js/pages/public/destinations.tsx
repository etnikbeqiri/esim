import { CountryFlag } from '@/components/country-flag';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroSection } from '@/components/hero-section';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

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
    const [activeRegion, setActiveRegion] = useState<string>('all');

    // Filter countries locally for instant feedback
    const filteredCountries = useMemo(() => {
        let result = countries;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (country) =>
                    country.name.toLowerCase().includes(query) ||
                    country.iso_code.toLowerCase().includes(query)
            );
        }

        if (activeRegion !== 'all') {
            result = result.filter((country) => country.region === activeRegion);
        }

        return result;
    }, [countries, searchQuery, activeRegion]);

    function clearFilters() {
        setSearchQuery('');
        setActiveRegion('all');
    }

    return (
        <GuestLayout>
            <Head title={`Destinations - ${name}`}>
                <meta
                    name="description"
                    content={`Browse eSIM data plans for ${countries.length}+ countries. Instant delivery, no roaming fees.`}
                />
            </Head>

            <HeroSection
                badge={`${countries.length}+ Countries`}
                title="Find Your"
                titleHighlight="Destination"
                description="Select a country to browse available eSIM data plans"
                showSearch={true}
                showStats={false}
                totalCountries={countries.length}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search countries..."
            />

            {/* Region Tabs */}
            <section className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4">
                    <div className="-mb-px flex gap-1 overflow-x-auto py-2">
                        <Button
                            variant={activeRegion === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveRegion('all')}
                            className="shrink-0"
                        >
                            All Regions
                        </Button>
                        {regions.map((region) => (
                            <Button
                                key={region}
                                variant={activeRegion === region ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveRegion(region)}
                                className="shrink-0"
                            >
                                {region}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Countries Grid */}
            <section className="py-8 md:py-10">
                <div className="container mx-auto px-4">
                    {filteredCountries.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <MapPin className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold">No destinations found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try a different search term or region
                            </p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="mb-4 text-sm text-muted-foreground">
                                {filteredCountries.length} destination{filteredCountries.length !== 1 ? 's' : ''}{' '}
                                {activeRegion !== 'all' && `in ${activeRegion}`}
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredCountries.map((country) => (
                                    <Link
                                        key={country.id}
                                        href={`/destinations/${country.iso_code.toLowerCase()}`}
                                    >
                                        <Card className="group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                                            <CardContent className="flex items-center gap-3 p-4">
                                                <CountryFlag countryCode={country.iso_code} size="lg" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-medium transition-colors group-hover:text-primary">
                                                        {country.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{country.package_count} plans</span>
                                                        {country.min_price && (
                                                            <>
                                                                <span className="text-muted-foreground/50">·</span>
                                                                <span className="font-medium text-primary">
                                                                    €{Number(country.min_price).toFixed(2)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Help Section */}
            <section className="border-t bg-muted/30 py-10">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-xl text-center">
                        <h2 className="mb-2 text-lg font-semibold">Need Help Choosing?</h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Not sure which plan is right for you? Check our guide or contact our support team.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/how-it-works">How It Works</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/help">Get Help</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
