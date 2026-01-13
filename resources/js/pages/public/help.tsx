import { CTASection } from '@/components/cta-section';
import { FAQItem, FAQSection } from '@/components/faq-section';
import { HelpCard } from '@/components/help-card';
import { HeroSection } from '@/components/hero-section';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    HelpCircle,
    Mail,
    MessageCircle,
    QrCode,
    Settings,
    Smartphone,
    Wifi,
} from 'lucide-react';

export default function Help() {
    const { name, contact } = usePage<SharedData>().props;
    const { trans } = useTrans();

    const quickFaqs: FAQItem[] = [
        {
            question: trans('help_page.quick_faqs.items.install.question'),
            answer: trans('help_page.quick_faqs.items.install.answer'),
        },
        {
            question: trans(
                'help_page.quick_faqs.items.not_connecting.question',
            ),
            answer: trans('help_page.quick_faqs.items.not_connecting.answer'),
        },
        {
            question: trans('help_page.quick_faqs.items.refund.question'),
            answer: trans('help_page.quick_faqs.items.refund.answer'),
        },
    ];

    return (
        <GuestLayout>
            <Head
                title={trans('help_page.meta_title', {
                    app_name: name,
                })}
            >
                <meta
                    name="description"
                    content={trans('help_page.meta_description', {
                        app_name: name,
                    })}
                />
            </Head>

            <HeroSection
                badge={trans('help_page.hero.badge')}
                title={trans('help_page.hero.title')}
                description={trans('help_page.hero.description')}
                showStats={false}
            />

            {/* Help Categories */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                            {trans('help_page.categories.title')}
                        </h2>
                        <p className="text-muted-foreground">
                            {trans('help_page.categories.description')}
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <HelpCard
                            title={trans(
                                'help_page.categories.getting_started.title',
                            )}
                            description={trans(
                                'help_page.categories.getting_started.description',
                            )}
                            icon={BookOpen}
                            href="/how-it-works"
                        />
                        <HelpCard
                            title={trans(
                                'help_page.categories.installation.title',
                            )}
                            description={trans(
                                'help_page.categories.installation.description',
                            )}
                            icon={QrCode}
                            href="/how-it-works"
                        />
                        <HelpCard
                            title={trans(
                                'help_page.categories.compatibility.title',
                            )}
                            description={trans(
                                'help_page.categories.compatibility.description',
                            )}
                            icon={Smartphone}
                            href="/how-it-works"
                        />
                        <HelpCard
                            title={trans(
                                'help_page.categories.troubleshooting.title',
                            )}
                            description={trans(
                                'help_page.categories.troubleshooting.description',
                            )}
                            icon={Settings}
                            href="/faq"
                        />
                        <HelpCard
                            title={trans('help_page.categories.faqs.title')}
                            description={trans(
                                'help_page.categories.faqs.description',
                            )}
                            icon={HelpCircle}
                            href="/faq"
                        />
                        <HelpCard
                            title={trans('help_page.categories.coverage.title')}
                            description={trans(
                                'help_page.categories.coverage.description',
                            )}
                            icon={Wifi}
                            href="/destinations"
                        />
                    </div>
                </div>
            </section>

            {/* Quick FAQs */}
            <FAQSection
                title={trans('help_page.quick_faqs.title')}
                subtitle={trans('help_page.quick_faqs.subtitle')}
                items={quickFaqs}
            />

            {/* Contact Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                            {trans('help_page.contact.title')}
                        </h2>
                        <p className="text-muted-foreground">
                            {trans('help_page.contact.description')}
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
                        <a href={`mailto:${contact.supportEmail}`}>
                            <div className="flex items-center gap-4 rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        {trans(
                                            'help_page.contact.email_support.title',
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {contact.supportEmail}
                                    </p>
                                </div>
                            </div>
                        </a>
                        <Link href="/faq">
                            <div className="flex items-center gap-4 rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <MessageCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        {trans(
                                            'help_page.contact.view_all_faqs.title',
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {trans(
                                            'help_page.contact.view_all_faqs.description',
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <CTASection />
        </GuestLayout>
    );
}
