import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Terms() {
    const { name, contact } = usePage<SharedData>().props;
    const { trans } = useTrans();

    return (
        <GuestLayout>
            <Head
                title={trans('terms_page.meta_title', {
                    app_name: name,
                })}
            >
                <meta
                    name="description"
                    content={trans('terms_page.meta_description', {
                        app_name: name,
                    })}
                />
            </Head>

            <LegalPageLayout
                title={trans('terms_page.title')}
                lastUpdated={trans('terms_page.last_updated')}
            >
                <LegalSection
                    title={trans('terms_page.sections.agreement.title')}
                >
                    <p>
                        {trans('terms_page.sections.agreement.content', {
                            app_name: name,
                        })}
                    </p>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.description.title')}
                >
                    <p>
                        {trans('terms_page.sections.description.content', {
                            app_name: name,
                        })}
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'terms_page.sections.description.items.profiles',
                            )}
                        </li>
                        <li>
                            {trans('terms_page.sections.description.items.qr')}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.description.items.support',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.eligibility.title')}
                >
                    <p>{trans('terms_page.sections.eligibility.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.purchases.title')}
                >
                    <p>{trans('terms_page.sections.purchases.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'terms_page.sections.purchases.items.payment',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.purchases.items.methods',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.purchases.items.billing',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.delivery.title')}
                >
                    <p>{trans('terms_page.sections.delivery.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans('terms_page.sections.delivery.items.email')}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.delivery.items.instructions',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.delivery.items.activation',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection title={trans('terms_page.sections.usage.title')}>
                    <p>{trans('terms_page.sections.usage.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'terms_page.sections.usage.items.transferable',
                            )}
                        </li>
                        <li>
                            {trans('terms_page.sections.usage.items.expiry')}
                        </li>
                        <li>
                            {trans('terms_page.sections.usage.items.start')}
                        </li>
                        <li>
                            {trans('terms_page.sections.usage.items.speeds')}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection title={trans('terms_page.sections.refund.title')}>
                    <p>{trans('terms_page.sections.refund.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'terms_page.sections.refund.items.available',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.refund.items.installed',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.refund.items.technical',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.acceptable.title')}
                >
                    <p>{trans('terms_page.sections.acceptable.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'terms_page.sections.acceptable.items.illegal',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.acceptable.items.reselling',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.acceptable.items.interfering',
                            )}
                        </li>
                        <li>
                            {trans(
                                'terms_page.sections.acceptable.items.bypassing',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.liability.title')}
                >
                    <p>
                        {trans('terms_page.sections.liability.content_1', {
                            app_name: name,
                        })}
                    </p>
                    <p>{trans('terms_page.sections.liability.content_2')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.changes.title')}
                >
                    <p>{trans('terms_page.sections.changes.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.governing.title')}
                >
                    <p>{trans('terms_page.sections.governing.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('terms_page.sections.contact.title')}
                >
                    <p>
                        {trans('terms_page.sections.contact.content')}{' '}
                        <a
                            href={`mailto:${contact.legalEmail}`}
                            className="text-primary hover:underline"
                        >
                            {contact.legalEmail}
                        </a>
                    </p>
                </LegalSection>
            </LegalPageLayout>
        </GuestLayout>
    );
}
