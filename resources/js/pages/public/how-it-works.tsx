import { CTASection } from '@/components/cta-section';
import { FAQSection } from '@/components/faq-section';
import { HeroSection } from '@/components/hero-section';
import { StepsSection } from '@/components/steps-section';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CreditCard, QrCode, Search, Settings, Wifi } from 'lucide-react';

interface Props {
    totalCountries: number;
}

interface FAQItem {
    question: string;
    answer: string;
}

export default function HowItWorks({ totalCountries }: Props) {
    const { name } = usePage<SharedData>().props;
    const { trans } = useTrans();

    const faqs: FAQItem[] = [
        {
            question: trans('how_it_works.faq.items.what_is_esim.question'),
            answer: trans('how_it_works.faq.items.what_is_esim.answer'),
        },
        {
            question: trans('how_it_works.faq.items.support_esim.question'),
            answer: trans('how_it_works.faq.items.support_esim.answer'),
        },
        {
            question: trans('how_it_works.faq.items.dual_sim.question'),
            answer: trans('how_it_works.faq.items.dual_sim.answer'),
        },
        {
            question: trans('how_it_works.faq.items.install_time.question'),
            answer: trans('how_it_works.faq.items.install_time.answer'),
        },
        {
            question: trans('how_it_works.faq.items.data_run_out.question'),
            answer: trans('how_it_works.faq.items.data_run_out.answer'),
        },
        {
            question: trans('how_it_works.faq.items.calls_texts.question'),
            answer: trans('how_it_works.faq.items.calls_texts.answer'),
        },
    ];

    return (
        <GuestLayout>
            <Head title={`${trans('nav.how_it_works')} - ${name}`}>
                <meta
                    name="description"
                    content={trans('how_it_works.meta_description', {
                        app_name: name,
                    })}
                />
            </Head>

            <HeroSection
                badge={trans('how_it_works.hero.badge')}
                title={trans('how_it_works.hero.title')}
                titleHighlight={trans('how_it_works.hero.title_highlight')}
                description={trans('how_it_works.hero.description', {
                    count: String(totalCountries),
                })}
                totalCountries={totalCountries}
            />

            <StepsSection
                steps={[
                    {
                        title: trans('how_it_works.steps.step_1.title'),
                        description: trans(
                            'how_it_works.steps.step_1.description',
                            { count: String(totalCountries) },
                        ),
                        features: [
                            trans('how_it_works.steps.step_1.features.filter'),
                            trans(
                                'how_it_works.steps.step_1.features.regional',
                            ),
                            trans(
                                'how_it_works.steps.step_1.features.no_hidden',
                            ),
                        ],
                        icon: Search,
                    },
                    {
                        title: trans('how_it_works.steps.step_2.title'),
                        description: trans(
                            'how_it_works.steps.step_2.description',
                        ),
                        features: [
                            trans('how_it_works.steps.step_2.features.payment'),
                            trans(
                                'how_it_works.steps.step_2.features.delivery',
                            ),
                            trans('how_it_works.steps.step_2.features.access'),
                        ],
                        icon: CreditCard,
                    },
                    {
                        title: trans('how_it_works.steps.step_3.title'),
                        description: trans(
                            'how_it_works.steps.step_3.description',
                        ),
                        features: [
                            trans('how_it_works.steps.step_3.features.camera'),
                            trans('how_it_works.steps.step_3.features.guide'),
                            trans('how_it_works.steps.step_3.features.home'),
                        ],
                        icon: QrCode,
                    },
                    {
                        title: trans('how_it_works.steps.step_4.title'),
                        description: trans(
                            'how_it_works.steps.step_4.description',
                        ),
                        features: [
                            trans(
                                'how_it_works.steps.step_4.features.activation',
                            ),
                            trans('how_it_works.steps.step_4.features.speed'),
                            trans(
                                'how_it_works.steps.step_4.features.dual_sim',
                            ),
                        ],
                        icon: Wifi,
                    },
                ]}
            />

            {/* Quick Setup Guide */}
            <section className="relative overflow-hidden border-t border-primary-100 py-16 md:py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-primary-900 md:text-4xl">
                            {trans('how_it_works.setup.title')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-primary-600">
                            {trans('how_it_works.setup.subtitle')}
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                        <div className="group overflow-hidden rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-300 transition-colors group-hover:bg-accent-400">
                                    <Settings className="h-5 w-5 text-accent-950" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-900">
                                    {trans('how_it_works.setup.iphone.title')}
                                </h3>
                            </div>
                            <ol className="space-y-4">
                                {[
                                    trans('how_it_works.setup.iphone.steps.0'),
                                    trans('how_it_works.setup.iphone.steps.1'),
                                    trans('how_it_works.setup.iphone.steps.2'),
                                    trans('how_it_works.setup.iphone.steps.3'),
                                ].map((step, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-primary-700">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="group overflow-hidden rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-300 transition-colors group-hover:bg-accent-400">
                                    <Settings className="h-5 w-5 text-accent-950" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-900">
                                    {trans('how_it_works.setup.android.title')}
                                </h3>
                            </div>
                            <ol className="space-y-4">
                                {[
                                    trans('how_it_works.setup.android.steps.0'),
                                    trans('how_it_works.setup.android.steps.1'),
                                    trans('how_it_works.setup.android.steps.2'),
                                    trans('how_it_works.setup.android.steps.3'),
                                ].map((step, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-primary-700">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <FAQSection
                title={trans('how_it_works.faq.title')}
                subtitle={trans('how_it_works.faq.subtitle')}
                items={faqs}
                viewAllLink="/faq"
                viewAllText={trans('faq.view_all')}
            />

            <CTASection />
        </GuestLayout>
    );
}
