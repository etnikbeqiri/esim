import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Refund() {
    const { name, contact } = usePage<SharedData>().props;
    const { trans } = useTrans();

    return (
        <GuestLayout>
            <Head
                title={trans('refund_page.meta_title', {
                    app_name: name,
                })}
            >
                <meta
                    name="description"
                    content={trans('refund_page.meta_description', {
                        app_name: name,
                    })}
                />
            </Head>

            <LegalPageLayout
                title={trans('refund_page.title')}
                lastUpdated={trans('refund_page.last_updated')}
            >
                <LegalSection
                    title={trans('refund_page.sections.overview.title')}
                >
                    <p>
                        {trans('refund_page.sections.overview.content', {
                            app_name: name,
                        })}
                    </p>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.digital_nature.title')}
                >
                    <p>{trans('refund_page.sections.digital_nature.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.eligible.title')}
                >
                    <p>{trans('refund_page.sections.eligible.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'refund_page.sections.eligible.items.technical_failure',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.eligible.items.incorrect_product',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.eligible.items.defective_esim',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.eligible.items.duplicate_charge',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.not_eligible.title')}
                >
                    <p>{trans('refund_page.sections.not_eligible.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'refund_page.sections.not_eligible.items.changed_mind',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.not_eligible.items.incompatible_device',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.not_eligible.items.used_esim',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.not_eligible.items.wrong_country',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.not_eligible.items.network_locked',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.not_eligible.items.qr_viewed',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.timeframe.title')}
                >
                    <p>{trans('refund_page.sections.timeframe.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.process.title')}
                >
                    <p>{trans('refund_page.sections.process.content')}</p>
                    <ol className="list-decimal space-y-2 pl-6">
                        <li>
                            {trans('refund_page.sections.process.steps.submit')}
                        </li>
                        <li>
                            {trans('refund_page.sections.process.steps.provide')}
                        </li>
                        <li>
                            {trans('refund_page.sections.process.steps.review')}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.process.steps.processing',
                            )}
                        </li>
                    </ol>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.partial.title')}
                >
                    <p>{trans('refund_page.sections.partial.content')}</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            {trans(
                                'refund_page.sections.partial.items.multiple_esims',
                            )}
                        </li>
                        <li>
                            {trans(
                                'refund_page.sections.partial.items.prorata',
                            )}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.processing.title')}
                >
                    <p>{trans('refund_page.sections.processing.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.exceptions.title')}
                >
                    <p>{trans('refund_page.sections.exceptions.content')}</p>
                </LegalSection>

                <LegalSection
                    title={trans('refund_page.sections.contact.title')}
                >
                    <p>
                        {trans('refund_page.sections.contact.content')}{' '}
                        <a
                            href={`mailto:${contact.supportEmail}`}
                            className="text-primary hover:underline"
                        >
                            {contact.supportEmail}
                        </a>
                    </p>
                </LegalSection>
            </LegalPageLayout>
        </GuestLayout>
    );
}
