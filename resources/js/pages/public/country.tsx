import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, HardDrive, Sparkles, Timer, Zap } from 'lucide-react';

interface Package {
    id: number;
    name: string;
    data_mb: number;
    data_label: string;
    validity_days: number;
    validity_label: string;
    retail_price: string | number;
    is_featured: boolean;
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

export default function CountryPage({ country, packages }: Props) {
    function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    return (
        <GuestLayout>
            <Head title={`${country.name} eSIM Data Plans`} />

            {/* Header */}
            <section className="bg-gradient-to-b from-muted/50 to-background pb-8 pt-12 md:pt-16">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href="/destinations">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            All Destinations
                        </Link>
                    </Button>

                    <div className="flex items-center gap-4">
                        <span className="text-6xl">{getFlagEmoji(country.iso_code)}</span>
                        <div>
                            <h1 className="text-3xl font-bold md:text-4xl">{country.name}</h1>
                            <p className="text-muted-foreground">
                                {packages.length} data plans available
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {packages.length === 0 ? (
                        <div className="py-16 text-center">
                            <h3 className="font-semibold">No plans available</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Check back later for available data plans
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/destinations">Browse Other Destinations</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {packages.map((pkg) => (
                                <Card
                                    key={pkg.id}
                                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                                        pkg.is_featured ? 'border-primary ring-1 ring-primary' : ''
                                    }`}
                                >
                                    {pkg.is_featured && (
                                        <div className="absolute right-0 top-0">
                                            <Badge className="rounded-none rounded-bl-lg">
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <h3 className="text-lg font-semibold">{pkg.name}</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">
                                                €{Number(pkg.retail_price).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                    <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="font-medium">{pkg.data_label}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                                    <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <span className="font-medium">{pkg.validity_label}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="font-medium">Instant Delivery</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 border-t pt-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <span>Works with eSIM compatible devices</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <span>Hotspot/Tethering supported</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" asChild>
                                            <Link href={`/checkout/${pkg.id}`}>Buy Now</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Info Section */}
            <section className="bg-muted/30 py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="mb-4 text-xl font-semibold">How to Use Your eSIM in {country.name}</h2>
                        <div className="grid gap-6 text-left md:grid-cols-3">
                            <div>
                                <div className="mb-2 text-2xl font-bold text-primary">1</div>
                                <h3 className="mb-1 font-medium">Purchase</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select your plan and complete the checkout
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 text-2xl font-bold text-primary">2</div>
                                <h3 className="mb-1 font-medium">Install</h3>
                                <p className="text-sm text-muted-foreground">
                                    Scan the QR code we send to your email
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 text-2xl font-bold text-primary">3</div>
                                <h3 className="mb-1 font-medium">Connect</h3>
                                <p className="text-sm text-muted-foreground">
                                    Activate when you arrive and enjoy data
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
