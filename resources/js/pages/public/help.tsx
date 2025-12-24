import { CTASection } from '@/components/cta-section';
import { FAQSection, type FAQItem } from '@/components/faq-section';
import { HelpCard } from '@/components/help-card';
import { HeroSection } from '@/components/hero-section';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
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

const quickFaqs: FAQItem[] = [
    {
        question: 'How do I install my eSIM?',
        answer: 'Go to Settings > Cellular > Add Cellular Plan on iPhone, or Settings > Network > SIM cards > Add eSIM on Android. Scan the QR code we sent you and follow the prompts.',
    },
    {
        question: 'Why is my eSIM not connecting?',
        answer: 'Make sure data roaming is enabled and the eSIM is set as your data line. Try restarting your phone. Ensure you\'re in an area with network coverage.',
    },
    {
        question: 'Can I get a refund?',
        answer: 'Refunds are available for unused eSIMs within 7 days of purchase. Once installed or activated, eSIMs cannot be refunded.',
    },
];

export default function Help() {
    const { name } = usePage<SharedData>().props;

    return (
        <GuestLayout>
            <Head title={`Help Center - ${name}`}>
                <meta
                    name="description"
                    content={`Get help with ${name} eSIM services. Find guides, FAQs, and contact support for assistance with your eSIM.`}
                />
            </Head>

            <HeroSection
                badge="We're Here to Help"
                title="Help Center"
                description="Find guides, tutorials, and answers to help you get the most out of your eSIM experience."
                showStats={false}
            />

            {/* Help Categories */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">Browse by Topic</h2>
                        <p className="text-muted-foreground">
                            Select a category to find the help you need
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <HelpCard
                            title="Getting Started"
                            description="New to eSIM? Learn the basics and get set up quickly."
                            icon={BookOpen}
                            href="/how-it-works"
                        />
                        <HelpCard
                            title="Installation Guide"
                            description="Step-by-step instructions for installing your eSIM."
                            icon={QrCode}
                            href="/how-it-works"
                        />
                        <HelpCard
                            title="Device Compatibility"
                            description="Check if your device supports eSIM technology."
                            icon={Smartphone}
                            href="/how-it-works"
                        />
                        <HelpCard
                            title="Troubleshooting"
                            description="Solutions for common connection and activation issues."
                            icon={Settings}
                            href="/faq"
                        />
                        <HelpCard
                            title="FAQs"
                            description="Answers to frequently asked questions."
                            icon={HelpCircle}
                            href="/faq"
                        />
                        <HelpCard
                            title="Network Coverage"
                            description="Check coverage in your travel destination."
                            icon={Wifi}
                            href="/destinations"
                        />
                    </div>
                </div>
            </section>

            {/* Quick FAQs */}
            <FAQSection
                title="Quick Answers"
                subtitle="Most commonly asked questions"
                items={quickFaqs}
            />

            {/* Contact Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">Still Need Help?</h2>
                        <p className="text-muted-foreground">
                            Our support team is here to assist you
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
                        <a href="mailto:support@example.com">
                            <div className="flex items-center gap-4 rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Email Support</h3>
                                    <p className="text-sm text-muted-foreground">
                                        support@example.com
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
                                    <h3 className="font-semibold">View All FAQs</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Browse complete FAQ list
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
