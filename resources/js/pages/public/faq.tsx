import { CTASection } from '@/components/cta-section';
import { FAQSection, type FAQItem } from '@/components/faq-section';
import { HeroSection } from '@/components/hero-section';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import {
    useAnalytics,
    usePageViewTracking,
    useScrollTracking,
} from '@/lib/analytics';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export default function FAQ() {
    const { name } = usePage<SharedData>().props;
    const { trans } = useTrans();
    const { trackContentEngagement } = useAnalytics();

    usePageViewTracking('faq', 'FAQ');

    useScrollTracking('faq', 'faq-page', 'FAQ Page');

    const handleFaqToggle = useCallback(
        (
            sectionId: string,
            index: number,
            question: string,
            isOpen: boolean,
        ) => {
            const faqId = `${sectionId}-${index}`;
            trackContentEngagement(
                'faq',
                faqId,
                isOpen ? 'expand' : 'collapse',
                { question },
            );
        },
        [trackContentEngagement],
    );

    const generalFaqs: FAQItem[] = [
        {
            question: trans(
                'faq_page.sections.general.items.what_is_esim.question',
            ),
            answer: trans(
                'faq_page.sections.general.items.what_is_esim.answer',
            ),
        },
        {
            question: trans(
                'faq_page.sections.general.items.support_esim.question',
            ),
            answer: trans(
                'faq_page.sections.general.items.support_esim.answer',
            ),
        },
        {
            question: trans(
                'faq_page.sections.general.items.dual_sim.question',
            ),
            answer: trans('faq_page.sections.general.items.dual_sim.answer'),
        },
        {
            question: trans(
                'faq_page.sections.general.items.unlock_phone.question',
            ),
            answer: trans(
                'faq_page.sections.general.items.unlock_phone.answer',
            ),
        },
    ];

    const purchaseFaqs: FAQItem[] = [
        {
            question: trans(
                'faq_page.sections.purchase.items.when_to_buy.question',
            ),
            answer: trans(
                'faq_page.sections.purchase.items.when_to_buy.answer',
            ),
        },
        {
            question: trans(
                'faq_page.sections.purchase.items.how_receive.question',
            ),
            answer: trans(
                'faq_page.sections.purchase.items.how_receive.answer',
            ),
        },
        {
            question: trans(
                'faq_page.sections.purchase.items.payment_methods.question',
            ),
            answer: trans(
                'faq_page.sections.purchase.items.payment_methods.answer',
            ),
        },
        {
            question: trans('faq_page.sections.purchase.items.refund.question'),
            answer: trans('faq_page.sections.purchase.items.refund.answer'),
        },
    ];

    const usageFaqs: FAQItem[] = [
        {
            question: trans(
                'faq_page.sections.usage.items.install_time.question',
            ),
            answer: trans('faq_page.sections.usage.items.install_time.answer'),
        },
        {
            question: trans(
                'faq_page.sections.usage.items.plan_start.question',
            ),
            answer: trans('faq_page.sections.usage.items.plan_start.answer'),
        },
        {
            question: trans(
                'faq_page.sections.usage.items.data_run_out.question',
            ),
            answer: trans('faq_page.sections.usage.items.data_run_out.answer'),
        },
        {
            question: trans(
                'faq_page.sections.usage.items.calls_texts.question',
            ),
            answer: trans('faq_page.sections.usage.items.calls_texts.answer'),
        },
        {
            question: trans(
                'faq_page.sections.usage.items.multiple_countries.question',
            ),
            answer: trans(
                'faq_page.sections.usage.items.multiple_countries.answer',
            ),
        },
    ];

    const troubleshootingFaqs: FAQItem[] = [
        {
            question: trans(
                'faq_page.sections.troubleshooting.items.wont_install.question',
            ),
            answer: trans(
                'faq_page.sections.troubleshooting.items.wont_install.answer',
            ),
        },
        {
            question: trans(
                'faq_page.sections.troubleshooting.items.no_signal.question',
            ),
            answer: trans(
                'faq_page.sections.troubleshooting.items.no_signal.answer',
            ),
        },
        {
            question: trans(
                'faq_page.sections.troubleshooting.items.reinstall.question',
            ),
            answer: trans(
                'faq_page.sections.troubleshooting.items.reinstall.answer',
            ),
        },
    ];

    return (
        <GuestLayout>
            <Head title={`${trans('footer.links.faq')} - ${name}`}>
                <meta
                    name="description"
                    content={trans('faq_page.meta_description', {
                        app_name: name,
                    })}
                />
            </Head>

            <HeroSection
                badge={trans('faq_page.hero.badge')}
                title={trans('faq_page.hero.title')}
                titleHighlight={trans('faq_page.hero.title_highlight')}
                description={trans('faq_page.hero.description')}
                showStats={false}
            />

            <FAQSection
                title={trans('faq_page.sections.general.title')}
                subtitle={trans('faq_page.sections.general.subtitle')}
                items={generalFaqs}
                showBackground={false}
                onItemToggle={(index, question, isOpen) =>
                    handleFaqToggle('general', index, question, isOpen)
                }
            />

            <FAQSection
                title={trans('faq_page.sections.purchase.title')}
                subtitle={trans('faq_page.sections.purchase.subtitle')}
                items={purchaseFaqs}
                onItemToggle={(index, question, isOpen) =>
                    handleFaqToggle('purchase', index, question, isOpen)
                }
            />

            <FAQSection
                title={trans('faq_page.sections.usage.title')}
                subtitle={trans('faq_page.sections.usage.subtitle')}
                items={usageFaqs}
                showBackground={false}
                onItemToggle={(index, question, isOpen) =>
                    handleFaqToggle('usage', index, question, isOpen)
                }
            />

            <FAQSection
                title={trans('faq_page.sections.troubleshooting.title')}
                subtitle={trans('faq_page.sections.troubleshooting.subtitle')}
                items={troubleshootingFaqs}
                onItemToggle={(index, question, isOpen) =>
                    handleFaqToggle('troubleshooting', index, question, isOpen)
                }
            />

            <CTASection />
        </GuestLayout>
    );
}
