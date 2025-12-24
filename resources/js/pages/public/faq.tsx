import { CTASection } from '@/components/cta-section';
import { FAQSection, type FAQItem } from '@/components/faq-section';
import { HeroSection } from '@/components/hero-section';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const generalFaqs: FAQItem[] = [
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
        question: 'Do I need to unlock my phone to use an eSIM?',
        answer: 'Yes, your phone must be carrier-unlocked to use an eSIM from a different provider. Contact your current carrier to verify your phone is unlocked.',
    },
];

const purchaseFaqs: FAQItem[] = [
    {
        question: 'When should I buy my eSIM?',
        answer: 'You can purchase your eSIM anytime before your trip. We recommend buying at least a day before departure so you have time to install it while connected to WiFi.',
    },
    {
        question: 'How will I receive my eSIM?',
        answer: 'After purchase, you\'ll receive an email with your eSIM QR code and installation instructions. You can also access your eSIM in your account dashboard.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), as well as other payment methods depending on your region.',
    },
    {
        question: 'Can I get a refund?',
        answer: 'Refunds are available for unused eSIMs within 7 days of purchase. Once an eSIM has been installed or activated, it cannot be refunded due to the digital nature of the product.',
    },
];

const usageFaqs: FAQItem[] = [
    {
        question: 'When should I install my eSIM?',
        answer: 'You can install your eSIM as soon as you receive it. We recommend installing it before you travel while you still have WiFi access. You can then activate it when you arrive at your destination.',
    },
    {
        question: 'When does my data plan start?',
        answer: 'Your data plan validity period begins when your eSIM first connects to a supported network at your destination, not when you install it.',
    },
    {
        question: 'What happens when my data runs out?',
        answer: 'When your data is depleted, you can simply purchase a new eSIM plan. Your old eSIM can be deleted from your device, and you can install the new one.',
    },
    {
        question: 'Do eSIMs work for phone calls and texts?',
        answer: 'Most of our eSIM plans are data-only, which means they don\'t include traditional voice calls or SMS. However, you can use apps like WhatsApp, Telegram, or Skype to make calls and send messages using your data.',
    },
    {
        question: 'Can I use my eSIM in multiple countries?',
        answer: 'This depends on the plan you purchase. We offer single-country plans and regional plans that cover multiple countries. Check the plan details before purchasing.',
    },
];

const troubleshootingFaqs: FAQItem[] = [
    {
        question: 'My eSIM won\'t install. What should I do?',
        answer: 'Make sure you have a stable WiFi connection, your phone is eSIM-compatible and carrier-unlocked, and you\'re scanning the QR code correctly. If issues persist, contact our support team.',
    },
    {
        question: 'I\'m not getting any signal. What\'s wrong?',
        answer: 'Ensure data roaming is enabled in your phone settings and the eSIM is set as your data line. Try restarting your phone. If you\'re still having issues, you may be in an area with limited coverage.',
    },
    {
        question: 'Can I delete and reinstall my eSIM?',
        answer: 'Most eSIMs can only be installed once. If you delete it, you may not be able to reinstall it. Contact our support team if you accidentally deleted your eSIM.',
    },
];

export default function FAQ() {
    const { name } = usePage<SharedData>().props;

    return (
        <GuestLayout>
            <Head title={`FAQ - ${name}`}>
                <meta
                    name="description"
                    content={`Frequently asked questions about ${name} eSIM services. Find answers about eSIM compatibility, installation, usage, and more.`}
                />
            </Head>

            <HeroSection
                badge="Got Questions?"
                title="Frequently Asked"
                titleHighlight="Questions"
                description="Find answers to common questions about eSIM technology, purchasing, installation, and usage."
                showStats={false}
            />

            <FAQSection
                title="General Questions"
                subtitle="Learn the basics about eSIM technology"
                items={generalFaqs}
                showBackground={false}
            />

            <FAQSection
                title="Purchasing & Payment"
                subtitle="Everything about buying your eSIM"
                items={purchaseFaqs}
            />

            <FAQSection
                title="Usage & Data Plans"
                subtitle="How to use your eSIM while traveling"
                items={usageFaqs}
                showBackground={false}
            />

            <FAQSection
                title="Troubleshooting"
                subtitle="Solutions to common issues"
                items={troubleshootingFaqs}
            />

            <CTASection />
        </GuestLayout>
    );
}
