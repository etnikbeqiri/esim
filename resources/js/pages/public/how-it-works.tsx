import { Card, CardContent } from '@/components/ui/card';
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
    Smartphone,
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
                        title: 'Choose Your Destination & Plan',
                        description: `Browse our selection of ${totalCountries}+ countries and find the perfect data plan for your trip. We offer various data packages to suit every travel need, from short weekend getaways to extended stays.`,
                        features: [
                            'Compare plans by data, validity, and price',
                            'Regional plans for multi-country trips',
                            'Transparent pricing with no hidden fees',
                        ],
                        icon: Search,
                    },
                    {
                        title: 'Purchase & Receive Instantly',
                        description: "Complete your purchase securely and receive your eSIM immediately. We'll send you an email with your QR code and detailed installation instructions.",
                        features: [
                            'Secure payment processing',
                            'Instant delivery to your email',
                            'QR code available in your account',
                        ],
                        icon: CreditCard,
                    },
                    {
                        title: 'Scan & Install Your eSIM',
                        description: "Open your phone's camera and scan the QR code we sent you. Follow the on-screen prompts to add the eSIM to your device. It only takes a minute!",
                        features: [
                            'Simply scan with your phone camera',
                            'Follow easy step-by-step instructions',
                            'Install before you travel (recommended)',
                        ],
                        icon: QrCode,
                    },
                    {
                        title: 'Activate & Stay Connected',
                        description: "When you arrive at your destination, simply enable your eSIM in your phone settings and turn on data roaming. You'll be connected to a local network instantly!",
                        features: [
                            'Activate when you land',
                            'High-speed 4G/5G connectivity',
                            'Keep your main number active',
                        ],
                        icon: Wifi,
                    },
                ]}
            />

            {/* Device Compatibility */}
            <section className="bg-muted/30 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                            Compatible Devices
                        </h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            eSIM is supported on most modern smartphones. Check if your device is
                            compatible.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-semibold">Apple iPhone</h3>
                                <p className="text-sm text-muted-foreground">
                                    iPhone XS, XR and newer models including iPhone 11, 12, 13, 14,
                                    15, and 16 series
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-semibold">Samsung Galaxy</h3>
                                <p className="text-sm text-muted-foreground">
                                    Galaxy S20 and newer, Galaxy Note 20+, Galaxy Z Fold/Flip
                                    series, and select A series
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-semibold">Google Pixel</h3>
                                <p className="text-sm text-muted-foreground">
                                    Pixel 3 and newer models including Pixel 4, 5, 6, 7, 8, and 9
                                    series
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Other compatible devices include Huawei P40+, Xiaomi, Oppo, and more.{' '}
                        <Link href="/destinations" className="text-primary hover:underline">
                            Check device compatibility
                        </Link>
                    </p>
                </div>
            </section>

            {/* Quick Setup Guide */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                            Quick Setup Guide
                        </h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Follow these steps to install your eSIM on iPhone or Android
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <Settings className="h-5 w-5" />
                                    iPhone Setup
                                </h3>
                                <ol className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            1
                                        </span>
                                        Go to Settings → Cellular → Add Cellular Plan
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            2
                                        </span>
                                        Scan the QR code from your email
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            3
                                        </span>
                                        Label your eSIM (e.g., "Travel Data")
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            4
                                        </span>
                                        Enable Data Roaming in Cellular settings
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <Settings className="h-5 w-5" />
                                    Android Setup
                                </h3>
                                <ol className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            1
                                        </span>
                                        Go to Settings → Network → SIM cards → Add eSIM
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            2
                                        </span>
                                        Scan the QR code from your email
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            3
                                        </span>
                                        Confirm and download the eSIM profile
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            4
                                        </span>
                                        Enable the eSIM and turn on Data Roaming
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>
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
