import { CTASection } from '@/components/cta-section';
import { FAQItem, FAQSection } from '@/components/faq-section';
import { HelpCard } from '@/components/help-card';
import { HeroSection } from '@/components/hero-section';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import {
    useAnalytics,
    usePageViewTracking,
    useScrollTracking,
} from '@/lib/analytics';
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
import { useCallback } from 'react';

export default function Help() {
    const { name, contact } = usePage<SharedData>().props;
    const { trans } = useTrans();
    const { supportContact, contentView, filterApplied } = useAnalytics();

    usePageViewTracking('help', 'Help Center');

    useScrollTracking('help', 'help-page', 'Help Center');

    const handleContactClick = useCallback(
        (method: 'email' | 'phone' | 'whatsapp' | 'ticket') => {
            supportContact(method, 'help');
        },
        [supportContact],
    );

    const handleCategoryClick = useCallback(
        (categoryId: string, categoryTitle: string) => {
            filterApplied('region', categoryId, 'help');
            contentView('help', categoryId, categoryTitle);
        },
        [filterApplied, contentView],
    );

    const handleFaqLinkClick = useCallback(() => {
        contentView('faq', 'view-all-faqs', 'View All FAQs');
    }, [contentView]);

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
                            onClick={() =>
                                handleCategoryClick(
                                    'getting-started',
                                    'Getting Started',
                                )
                            }
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
                            onClick={() =>
                                handleCategoryClick(
                                    'installation',
                                    'Installation Guide',
                                )
                            }
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
                            onClick={() =>
                                handleCategoryClick(
                                    'compatibility',
                                    'Device Compatibility',
                                )
                            }
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
                            onClick={() =>
                                handleCategoryClick(
                                    'troubleshooting',
                                    'Troubleshooting',
                                )
                            }
                        />
                        <HelpCard
                            title={trans('help_page.categories.faqs.title')}
                            description={trans(
                                'help_page.categories.faqs.description',
                            )}
                            icon={HelpCircle}
                            href="/faq"
                            onClick={() => handleCategoryClick('faqs', 'FAQs')}
                        />
                        <HelpCard
                            title={trans('help_page.categories.coverage.title')}
                            description={trans(
                                'help_page.categories.coverage.description',
                            )}
                            icon={Wifi}
                            href="/destinations"
                            onClick={() =>
                                handleCategoryClick(
                                    'coverage',
                                    'Network Coverage',
                                )
                            }
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
            <section className="relative overflow-hidden border-t border-primary-100 py-8 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />

                <div className="relative z-10 container mx-auto px-4">
                    <h2 className="mb-5 text-center text-lg font-bold text-primary-900 md:mb-8 md:text-2xl">
                        {trans('help_page.contact.title')}
                    </h2>

                    <div className="mx-auto grid max-w-3xl gap-3 md:grid-cols-2 md:gap-5">
                        {/* Email Support Card */}
                        <a
                            href={`mailto:${contact.supportEmail}`}
                            onClick={() => handleContactClick('email')}
                            className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:rounded-2xl md:p-6"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-300 transition-colors group-hover:bg-accent-400 md:h-12 md:w-12 md:rounded-xl">
                                <Mail className="h-5 w-5 text-accent-950 md:h-6 md:w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-primary-900 md:mb-1 md:text-base">
                                    {trans(
                                        'help_page.contact.email_support.title',
                                    )}
                                </h3>
                                <p className="text-xs text-primary-600 md:text-sm">
                                    {contact.supportEmail}
                                </p>
                                <p className="mt-1 text-[10px] text-primary-400 md:text-xs">
                                    {trans(
                                        'help_page.contact.email_support.response_time',
                                    )}
                                </p>
                            </div>
                        </a>

                        {/* FAQ Card */}
                        <Link
                            href="/faq"
                            onClick={handleFaqLinkClick}
                            className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:rounded-2xl md:p-6"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 transition-colors group-hover:bg-primary-200 md:h-12 md:w-12 md:rounded-xl">
                                <MessageCircle className="h-5 w-5 text-primary-600 md:h-6 md:w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-primary-900 md:mb-1 md:text-base">
                                    {trans(
                                        'help_page.contact.view_all_faqs.title',
                                    )}
                                </h3>
                                <p className="text-xs text-primary-600 md:text-sm">
                                    {trans(
                                        'help_page.contact.view_all_faqs.description',
                                    )}
                                </p>
                                <p className="mt-1 text-[10px] text-primary-400 md:text-xs">
                                    {trans(
                                        'help_page.contact.view_all_faqs.count',
                                    )}
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <CTASection />
        </GuestLayout>
    );
}
