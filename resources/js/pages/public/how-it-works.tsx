import { CTASection } from '@/components/cta-section';
import { FAQSection } from '@/components/faq-section';
import { HeroSection } from '@/components/hero-section';
import { StepsSection } from '@/components/steps-section';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    QrCode,
    Search,
    Settings,
    Wifi,
} from 'lucide-react';

interface Props {
    totalCountries: number;
}

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'What is an eSIM?',
        answer: 'An eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without having to use a physical SIM card. It\'s built into your device and can be programmed with the mobile plan of your choice.',
    },
    {
        question: 'How do I know if my phone supports eSIM?',
        answer: 'Most modern smartphones support eSIM, including iPhone XS and newer, Google Pixel 3 and newer, Samsung Galaxy S20 and newer. You can check in your phone settings under "Cellular" or "Mobile Network" to see if there\'s an option to add an eSIM.',
    },
    {
        question: 'Can I use my regular SIM and eSIM at the same time?',
        answer: 'Yes! Your phone can use both your regular SIM card and an eSIM simultaneously. This means you can keep your home number active while using the eSIM for data in your travel destination.',
    },
    {
        question: 'When should I install my eSIM?',
        answer: 'You can install your eSIM as soon as you receive it. We recommend installing it before you travel while you still have WiFi access. You can then activate it when you arrive at your destination.',
    },
    {
        question: 'What happens when my data runs out?',
        answer: 'When your data is depleted, you can simply purchase a new eSIM plan. Your old eSIM can be deleted from your device, and you can install the new one.',
    },
    {
        question: 'Do eSIMs work for phone calls and texts?',
        answer: 'Most of our eSIM plans are data-only, which means they don\'t include traditional voice calls or SMS. However, you can use apps like WhatsApp, Telegram, or Skype to make calls and send messages using your data.',
    },
];

export default function HowItWorks({ totalCountries }: Props) {
    const { name } = usePage<SharedData>().props;

    return (
        <GuestLayout>
            <Head title={`How It Works - ${name}`}>
                <meta
                    name="description"
                    content={`Learn how to get connected with ${name} eSIM in 3 simple steps. Choose your plan, scan the QR code, and stay connected anywhere.`}
                />
            </Head>

            <HeroSection
                badge="Simple & Fast"
                title="Get Connected in"
                titleHighlight="3 Simple Steps"
                description={`No physical SIM card needed. No waiting for delivery. Get instant mobile data in ${totalCountries}+ countries with our eSIM technology.`}
                totalCountries={totalCountries}
            />

            <StepsSection
                steps={[
                    {
                        title: 'Pick Your Perfect Plan',
                        description: `Explore ${totalCountries}+ destinations worldwide and select a data plan tailored to your journey. Whether it's a quick business trip or a month-long adventure, we have the right package for you.`,
                        features: [
                            'Filter by data size, duration & budget',
                            'Multi-country regional plans available',
                            'No hidden fees - pay what you see',
                        ],
                        icon: Search,
                    },
                    {
                        title: 'Instant Checkout & Delivery',
                        description: 'Complete your order in under 60 seconds with our secure checkout. Your eSIM QR code is delivered instantly to your inbox - no waiting, no shipping delays.',
                        features: [
                            'Multiple secure payment methods',
                            'QR code delivered in seconds',
                            'Access anytime from your dashboard',
                        ],
                        icon: CreditCard,
                    },
                    {
                        title: 'Scan QR & Install in 1 Minute',
                        description: 'Simply open your camera, scan the QR code, and follow the prompts. Your eSIM installs automatically - no tech skills needed. We recommend doing this before your trip.',
                        features: [
                            'Works with iPhone & Android cameras',
                            'Step-by-step guided installation',
                            'Install at home before traveling',
                        ],
                        icon: QrCode,
                    },
                    {
                        title: 'Land & Connect Instantly',
                        description: 'Touch down at your destination, enable your eSIM, and you\'re online. Enjoy blazing-fast local network speeds while keeping your home SIM active for calls and texts.',
                        features: [
                            'One tap activation on arrival',
                            'Premium 4G/5G network speeds',
                            'Dual SIM - keep your home number',
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
                            Quick Setup Guide
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-primary-600">
                            Follow these steps to install your eSIM on iPhone or Android
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                        <div className="group overflow-hidden rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-300 transition-colors group-hover:bg-accent-400">
                                    <Settings className="h-5 w-5 text-accent-950" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-900">
                                    iPhone Setup
                                </h3>
                            </div>
                            <ol className="space-y-4">
                                {[
                                    'Go to Settings → Cellular → Add Cellular Plan',
                                    'Scan the QR code from your email',
                                    'Label your eSIM (e.g., "Travel Data")',
                                    'Enable Data Roaming in Cellular settings',
                                ].map((step, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-primary-700">{step}</span>
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
                                    Android Setup
                                </h3>
                            </div>
                            <ol className="space-y-4">
                                {[
                                    'Go to Settings → Network → SIM cards → Add eSIM',
                                    'Scan the QR code from your email',
                                    'Confirm and download the eSIM profile',
                                    'Enable the eSIM and turn on Data Roaming',
                                ].map((step, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-primary-700">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <FAQSection
                title="Frequently Asked Questions"
                subtitle="Got questions? We've got answers."
                items={faqs}
                viewAllLink="/faq"
            />

            <CTASection />
        </GuestLayout>
    );
}
