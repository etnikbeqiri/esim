import { DestinationCard } from '@/components/destination-card';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
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
            <section className="sticky top-16 z-40 border-b border-primary-100 bg-white/90 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    <div className="no-scrollbar -mb-px flex gap-2 overflow-x-auto py-3">
                        {activeRegion === 'all' ? (
                            <GoldButton size="sm" onClick={() => setActiveRegion('all')}>
                                All Regions
                            </GoldButton>
                        ) : (
                            <button
                                onClick={() => setActiveRegion('all')}
                                className="shrink-0 rounded-full border border-transparent bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-colors duration-200 hover:bg-primary-100"
                            >
                                All Regions
                            </button>
                        )}
                        {regions.map((region) =>
                            activeRegion === region ? (
                                <GoldButton key={region} size="sm" onClick={() => setActiveRegion(region)}>
                                    {region}
                                </GoldButton>
                            ) : (
                                <button
                                    key={region}
                                    onClick={() => setActiveRegion(region)}
                                    className="shrink-0 rounded-full border border-transparent bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-colors duration-200 hover:bg-primary-100"
                                >
                                    {region}
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
                                No destinations found
                            </h3>
                            <p className="mt-2 text-primary-600">
                                Try a different search term or region
                            </p>
                            <GoldButton
                                className="mt-5"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </GoldButton>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <p className="text-sm font-medium text-primary-600">
                                    Showing {filteredCountries.length}{' '}
                                    destination
                                    {filteredCountries.length !== 1 ? 's' : ''}{' '}
                                    {activeRegion !== 'all' &&
                                        `in ${activeRegion}`}
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCountries.map((country) => (
                                    <DestinationCard
                                        key={country.id}
                                        id={country.id}
                                        name={country.name}
                                        iso_code={country.iso_code}
                                        package_count={country.package_count}
                                        min_price={country.min_price}
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
                            Need Help Choosing?
                        </h2>
                        <p className="mb-5 text-sm text-primary-600">
                            Not sure which plan is right for you? Check our
                            guide or contact our support team.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
                            >
                                <Link href="/how-it-works">How It Works</Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
                            >
                                <Link href="/help">Get Help</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
