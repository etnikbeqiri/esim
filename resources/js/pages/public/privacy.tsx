import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Privacy() {
    const { name } = usePage<SharedData>().props;

    return (
        <GuestLayout>
            <Head title={`Privacy Policy - ${name}`}>
                <meta
                    name="description"
                    content={`Privacy Policy for ${name}. Learn how we collect, use, and protect your personal information.`}
                />
            </Head>

            <LegalPageLayout title="Privacy Policy" lastUpdated="December 2024">
                <LegalSection title="Introduction">
                    <p>
                        At {name}, we take your privacy seriously. This Privacy Policy explains how we
                        collect, use, disclose, and safeguard your information when you use our
                        website and services.
                    </p>
                    <p>
                        Please read this privacy policy carefully. If you do not agree with the
                        terms of this privacy policy, please do not access the site.
                    </p>
                </LegalSection>

                <LegalSection title="Information We Collect">
                    <p>We may collect information about you in a variety of ways, including:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            <strong>Personal Data:</strong> Name, email address, phone number, and
                            billing information that you voluntarily provide when purchasing our
                            services.
                        </li>
                        <li>
                            <strong>Payment Information:</strong> Payment card details are processed
                            securely through our payment processor and are not stored on our servers.
                        </li>
                        <li>
                            <strong>Device Information:</strong> Information about your device
                            including IP address, browser type, and operating system for analytics
                            and security purposes.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information about how you use our website
                            and services to improve our offerings.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection title="How We Use Your Information">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Process and fulfill your eSIM orders</li>
                        <li>Send you order confirmations and eSIM activation details</li>
                        <li>Provide customer support and respond to inquiries</li>
                        <li>Send promotional communications (with your consent)</li>
                        <li>Improve our website and services</li>
                        <li>Detect and prevent fraud</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </LegalSection>

                <LegalSection title="Information Sharing">
                    <p>
                        We do not sell, trade, or rent your personal information to third parties.
                        We may share your information with:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            <strong>Service Providers:</strong> Third-party companies that help us
                            operate our business (payment processors, eSIM providers, email services).
                        </li>
                        <li>
                            <strong>Legal Requirements:</strong> When required by law or to protect
                            our rights and safety.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection title="Data Security">
                    <p>
                        We implement appropriate technical and organizational security measures to
                        protect your personal information. However, no method of transmission over
                        the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </LegalSection>

                <LegalSection title="Your Rights">
                    <p>You have the right to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Access the personal information we hold about you</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your personal information</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Withdraw consent where applicable</li>
                    </ul>
                </LegalSection>

                <LegalSection title="Cookies">
                    <p>
                        We use cookies and similar tracking technologies to enhance your experience
                        on our website. You can control cookies through your browser settings.
                    </p>
                </LegalSection>

                <LegalSection title="Changes to This Policy">
                    <p>
                        We may update this privacy policy from time to time. We will notify you of
                        any changes by posting the new privacy policy on this page and updating the
                        "Last updated" date.
                    </p>
                </LegalSection>

                <LegalSection title="Contact Us">
                    <p>
                        If you have questions about this Privacy Policy, please contact us at{' '}
                        <a
                            href="mailto:privacy@example.com"
                            className="text-primary hover:underline"
                        >
                            privacy@example.com
                        </a>
                    </p>
                </LegalSection>
            </LegalPageLayout>
        </GuestLayout>
    );
}
