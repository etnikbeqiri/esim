import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Terms() {
    const { name, contact } = usePage<SharedData>().props;

    return (
        <GuestLayout>
            <Head title={`Terms of Service - ${name}`}>
                <meta
                    name="description"
                    content={`Terms of Service for ${name}. Read our terms and conditions for using our eSIM services.`}
                />
            </Head>

            <LegalPageLayout title="Terms of Service" lastUpdated="December 2024">
                <LegalSection title="Agreement to Terms">
                    <p>
                        By accessing or using {name}'s website and services, you agree to be bound
                        by these Terms of Service. If you do not agree to these terms, please do
                        not use our services.
                    </p>
                </LegalSection>

                <LegalSection title="Description of Service">
                    <p>
                        {name} provides eSIM (embedded SIM) services that allow you to access
                        mobile data networks while traveling internationally. Our service includes:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Digital eSIM profiles for mobile data access</li>
                        <li>QR codes for eSIM installation</li>
                        <li>Customer support for activation and usage</li>
                    </ul>
                </LegalSection>

                <LegalSection title="Eligibility">
                    <p>
                        To use our services, you must have a device that supports eSIM technology.
                        You are responsible for verifying that your device is eSIM-compatible and
                        carrier-unlocked before making a purchase.
                    </p>
                </LegalSection>

                <LegalSection title="Purchases and Payment">
                    <p>
                        All purchases are final once the eSIM has been delivered. Prices are
                        displayed in the currency selected at checkout and include all applicable
                        taxes.
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Payment is required at the time of purchase</li>
                        <li>We accept major credit cards and other payment methods as displayed</li>
                        <li>You agree to provide accurate billing information</li>
                    </ul>
                </LegalSection>

                <LegalSection title="eSIM Delivery and Activation">
                    <p>
                        eSIM profiles are delivered instantly via email after successful payment.
                        You are responsible for:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Providing a valid email address for delivery</li>
                        <li>Following the installation instructions provided</li>
                        <li>Activating the eSIM within the validity period</li>
                    </ul>
                </LegalSection>

                <LegalSection title="Data Plans and Usage">
                    <p>
                        Each eSIM plan includes a specific data allowance and validity period as
                        described at the time of purchase:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Data allowances are non-transferable</li>
                        <li>Unused data expires at the end of the validity period</li>
                        <li>Validity period begins upon first connection to a network</li>
                        <li>Data speeds may vary based on network conditions</li>
                    </ul>
                </LegalSection>

                <LegalSection title="Refund Policy">
                    <p>Due to the digital nature of our products:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            Refunds are available for unused eSIMs within 7 days of purchase
                        </li>
                        <li>
                            No refunds are available once the eSIM has been installed or activated
                        </li>
                        <li>
                            Technical issues will be resolved through customer support before
                            considering refunds
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection title="Acceptable Use">
                    <p>You agree not to use our services for:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Any illegal or unauthorized purpose</li>
                        <li>Reselling or redistributing eSIM profiles</li>
                        <li>Interfering with or disrupting our services</li>
                        <li>Attempting to bypass any security measures</li>
                    </ul>
                </LegalSection>

                <LegalSection title="Limitation of Liability">
                    <p>
                        {name} is not liable for any indirect, incidental, or consequential
                        damages arising from the use of our services. Our liability is limited to
                        the amount paid for the specific eSIM in question.
                    </p>
                    <p>
                        We do not guarantee uninterrupted service and are not responsible for
                        network issues controlled by third-party carriers.
                    </p>
                </LegalSection>

                <LegalSection title="Changes to Terms">
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of
                        our services after changes constitutes acceptance of the new terms.
                    </p>
                </LegalSection>

                <LegalSection title="Governing Law">
                    <p>
                        These terms are governed by applicable laws. Any disputes shall be resolved
                        through appropriate legal channels.
                    </p>
                </LegalSection>

                <LegalSection title="Contact Us">
                    <p>
                        For questions about these Terms of Service, please contact us at{' '}
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
