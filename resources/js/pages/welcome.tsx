import { CTASection } from '@/components/cta-section';
import { HeroSection } from '@/components/hero-section';
import { StepsSection } from '@/components/steps-section';
import { TrustSection } from '@/components/trust-section';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { QrCode, Search, Smartphone } from 'lucide-react';

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

export default function Welcome({
    featuredCountries = [],
    totalCountries = 0,
    totalPackages = 0,
}: Props) {
    const { name } = usePage<SharedData>().props;

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

            <HeroSection
                title="Stay Connected"
                titleHighlight="Worldwide"
                description="Get instant mobile data in 200+ countries with our eSIM. No physical SIM needed, no roaming fees."
                showSearch
                showStats
                totalCountries={totalCountries}
            />

            <StepsSection
                title="How It Works"
                subtitle="Get connected in 3 simple steps"
                steps={[
                    {
                        title: 'Choose Your Plan',
                        description:
                            'Select your destination and pick a data plan that fits your needs.',
                        features: [
                            'Browse plans by country or region',
                            'Compare data, validity, and price',
                            'Transparent pricing with no hidden fees',
                        ],
                        icon: Search,
                    },
                    {
                        title: 'Scan QR Code',
                        description:
                            'Receive your eSIM instantly via email and scan to install.',
                        features: [
                            'Instant delivery to your email',
                            'Easy QR code scanning',
                            'Works on all eSIM devices',
                        ],
                        icon: QrCode,
                    },
                    {
                        title: 'Stay Connected',
                        description:
                            'Activate when you arrive and enjoy high-speed data.',
                        features: [
                            'High-speed 4G/5G connectivity',
                            'Activate when you land',
                            'Use apps like normal',
                        ],
                        icon: Smartphone,
                    },
                ]}
            />

            <TrustSection />

            <CTASection
                title="Ready to Travel Connected?"
                description={`Browse our ${totalPackages}+ data plans across ${totalCountries}+ countries and get instant connectivity for your next trip.`}
                buttonText="Browse Destinations"
            />
        </GuestLayout>
    );
}
