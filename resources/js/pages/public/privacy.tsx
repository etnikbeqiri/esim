import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { useAnalytics, usePageViewTracking, useScrollTracking } from '@/lib/analytics';
import { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export default function Privacy() {
    const { name, contact } = usePage<SharedData>().props;
    const { trans } = useTrans();
    const { trackContentEngagement, supportContact } = useAnalytics();

    usePageViewTracking('privacy', 'Privacy Policy');

    useScrollTracking('guide', 'privacy-policy', 'Privacy Policy');

    const handleSectionView = useCallback((sectionId: string, sectionTitle: string) => {
        trackContentEngagement('guide', sectionId, 'view', { title: sectionTitle });
    }, [trackContentEngagement]);

    const handleContactClick = useCallback(() => {
        supportContact('email', 'privacy');
    }, [supportContact]);

    return (
        <GuestLayout>
            <Head
                title={trans('privacy_page.meta_title', {
                    app_name: name,
                })}
            >
                <meta
                    name="description"
                    content={trans('privacy_page.meta_description', {
                        app_name: name,
                    })}
                />
            </Head>

            <LegalPageLayout
                title={trans('privacy_page.title')}
                lastUpdated={trans('privacy_page.last_updated')}
            >
                <LegalSection
                    title={trans('privacy_page.sections.introduction.title')}
                    onVisible={() => handleSectionView('introduction', 'Introduction')}
                >
                    <p>
                        {trans('privacy_page.sections.introduction.content_1', {
                            app_name: name,
                        })}
                    </p>
                    <p>
                        {trans('privacy_page.sections.introduction.content_2')}
                    </p>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.info_collect.title')}
                    onVisible={() => handleSectionView('info-collect', 'Information We Collect')}
                >
                    <p>{trans('privacy_page.sections.info_collect.intro')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            <strong>
                                {trans(
                                    'privacy_page.sections.info_collect.items.personal.title',
                                )}
                            </strong>{' '}
                            {trans(
                                'privacy_page.sections.info_collect.items.personal.desc',
                            )}
                        </li>
                        <li>
                            <strong>
                                {trans(
                                    'privacy_page.sections.info_collect.items.payment.title',
                                )}
                            </strong>{' '}
                            {trans(
                                'privacy_page.sections.info_collect.items.payment.desc',
                            )}
                        </li>
                        <li>
                            <strong>
                                {trans(
                                    'privacy_page.sections.info_collect.items.device.title',
                                )}
                            </strong>{' '}
                            {trans(
                                'privacy_page.sections.info_collect.items.device.desc',
                            )}
                        </li>
                        <li>
                            <strong>
                                {trans(
                                    'privacy_page.sections.info_collect.items.usage.title',
                                )}
                            </strong>{' '}
                            {trans(
                                'privacy_page.sections.info_collect.items.usage.desc',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.how_use.title')}
                >
                    <p>{trans('privacy_page.sections.how_use.intro')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'privacy_page.sections.how_use.items.process',
                            )}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.how_use.items.confirm',
                            )}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.how_use.items.support',
                            )}
                        </li>
                        <li>
                            {trans('privacy_page.sections.how_use.items.promo')}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.how_use.items.improve',
                            )}
                        </li>
                        <li>
                            {trans('privacy_page.sections.how_use.items.fraud')}
                        </li>
                        <li>
                            {trans('privacy_page.sections.how_use.items.legal')}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.sharing.title')}
                >
                    <p>{trans('privacy_page.sections.sharing.intro')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            <strong>
                                {trans(
                                    'privacy_page.sections.sharing.items.providers.title',
                                )}
                            </strong>{' '}
                            {trans(
                                'privacy_page.sections.sharing.items.providers.desc',
                            )}
                        </li>
                        <li>
                            <strong>
                                {trans(
                                    'privacy_page.sections.sharing.items.legal.title',
                                )}
                            </strong>{' '}
                            {trans(
                                'privacy_page.sections.sharing.items.legal.desc',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.security.title')}
                    onVisible={() => handleSectionView('data-security', 'Data Security')}
                >
                    <p>{trans('privacy_page.sections.security.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.rights.title')}
                    onVisible={() => handleSectionView('your-rights', 'Your Rights')}
                >
                    <p>{trans('privacy_page.sections.rights.intro')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans('privacy_page.sections.rights.items.access')}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.rights.items.correction',
                            )}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.rights.items.deletion',
                            )}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.rights.items.opt_out',
                            )}
                        </li>
                        <li>
                            {trans(
                                'privacy_page.sections.rights.items.withdraw',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.cookies.title')}
                >
                    <p>{trans('privacy_page.sections.cookies.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.changes.title')}
                >
                    <p>{trans('privacy_page.sections.changes.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('privacy_page.sections.contact.title')}
                    onVisible={() => handleSectionView('contact', 'Contact')}
                >
                    <p>
                        {trans('privacy_page.sections.contact.content')}{' '}
                        <a
                            href={`mailto:${contact.privacyEmail}`}
                            className="text-primary hover:underline"
                            onClick={handleContactClick}
                        >
                            {contact.privacyEmail}
                        </a>
                    </p>
                </LegalSection>
            </LegalPageLayout>
        </GuestLayout>
    );
}
