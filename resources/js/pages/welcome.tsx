import { CTASection } from '@/components/cta-section';
import { HeroSection } from '@/components/hero-section';
import { StepsSection } from '@/components/steps-section';
import { TrustSection } from '@/components/trust-section';
import { useTrans } from '@/hooks/use-trans';
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
    const { trans } = useTrans();

    return (
        <GuestLayout>
            <Head
                title={`${name} - ${trans('hero.title')} ${trans('hero.title_highlight')}`}
            >
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <HeroSection
                title={trans('hero.title')}
                titleHighlight={trans('hero.title_highlight')}
                description={trans('hero.description')}
                showSearch
                showStats
                totalCountries={totalCountries}
            />

            <StepsSection
                title={trans('steps.title')}
                subtitle={trans('steps.subtitle')}
                steps={[
                    {
                        title: trans('steps.step_1.title'),
                        description: trans('steps.step_1.description'),
                        features: [
                            trans('steps.step_1.features.browse'),
                            trans('steps.step_1.features.compare'),
                            trans('steps.step_1.features.transparent'),
                        ],
                        icon: Search,
                        image: '/img/hero/hero-1.webp',
                    },
                    {
                        title: trans('steps.step_2.title'),
                        description: trans('steps.step_2.description'),
                        features: [
                            trans('steps.step_2.features.cheaper'),
                            trans('steps.step_2.features.no_surprise'),
                            trans('steps.step_2.features.fixed'),
                        ],
                        icon: QrCode,
                        image: '/img/hero/hero-2.webp',
                    },
                    {
                        title: trans('steps.step_3.title'),
                        description: trans('steps.step_3.description'),
                        features: [
                            trans('steps.step_3.features.speed'),
                            trans('steps.step_3.features.activate'),
                            trans('steps.step_3.features.apps'),
                        ],
                        icon: Smartphone,
                        image: '/img/hero/hero-3.webp',
                    },
                ]}
            />

            <TrustSection />

            <CTASection
                title={trans('cta.title')}
                description={trans('cta.description', {
                    packages: totalPackages.toString(),
                    countries: totalCountries.toString(),
                })}
                buttonText={trans('cta.button')}
            />
        </GuestLayout>
    );
}
