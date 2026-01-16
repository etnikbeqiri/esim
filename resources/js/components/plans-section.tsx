import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import { Check } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    badge?: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    buttonVariant?: 'default' | 'outline' | 'secondary';
    popular?: boolean;
}

const plans: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        badge: 'Watch an ad & unlock free minutes',
        price: 'Zero costs',
        description: 'Basic speed only (mail, text & nav)',
        features: [
            'Available for users in North-America, Europe & APAC',
            'Basic Speed',
            'Email, Messaging Apps, and Uber',
            'With Ads',
            'Top-up for calling abroad with credits',
        ],
        buttonText: 'Learn More',
        buttonVariant: 'outline',
    },
    {
        id: 'daily',
        name: 'Daily',
        badge: 'Perfect for your trip abroad',
        price: 'starts at €1 per day',
        description: 'Choose from 180+ countries',
        features: [
            'All Features from Firsty Free',
            'High Speed',
            'Browsing, Navigation and Social Media',
            'No Ads',
            'Hotspot Available',
        ],
        buttonText: 'Buy now',
        popular: true,
    },
    {
        id: 'monthly',
        name: 'Monthly',
        badge: 'Your Global Subscription',
        price: 'starts at €4.5 per month',
        description: '120+ countries included',
        features: [
            'All Features from Daily',
            'Connects to the fastest local network',
            'Ideal for Int. Students and Expats',
            'Keep Your Current Number',
            'Data and calling 153+ countries',
        ],
        buttonText: 'Learn More',
        buttonVariant: 'outline',
    },
];

export function PlansSection() {
    return (
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-[0.02]" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-primary-900 md:text-4xl">
                        discover our plans
                    </h2>
                </div>

                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                                plan.popular
                                    ? 'scale-105 border-accent-400 shadow-xl shadow-accent-500/10 md:scale-110'
                                    : 'border-primary-100 hover:border-primary-200 hover:shadow-lg'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-400 to-accent-600 opacity-60 blur-md" />
                                        <div className="relative rounded-full bg-gradient-to-r from-accent-500 via-accent-400 to-accent-600 px-4 py-1.5 text-xs font-bold tracking-wider text-accent-950 uppercase shadow-lg">
                                            Popular
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src={`/img/${plan.id}-plan-label.png`}
                                        alt={`${plan.name} plan`}
                                        className="mx-auto h-8"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-primary-900">
                                    {plan.name}
                                </h3>
                                <div className="text-gradient-gold mb-2 text-lg font-semibold">
                                    {plan.price}
                                </div>
                                <p className="text-sm text-primary-600">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="px-6 pb-6">
                                <ul className="mb-6 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3"
                                        >
                                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500" />
                                            <span className="text-sm text-primary-700">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.buttonVariant === 'outline' ? (
                                    <Button
                                        className="w-full border-primary-200 text-primary-700 hover:bg-primary-50"
                                        variant="outline"
                                        size="lg"
                                    >
                                        {plan.buttonText}
                                    </Button>
                                ) : (
                                    <GoldButton className="w-full" size="lg">
                                        {plan.buttonText}
                                    </GoldButton>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <h3 className="mb-2 text-xl font-semibold text-primary-900">
                        Fair prices, No hidden fees
                    </h3>
                    <p className="mb-6 text-primary-600">
                        Calculate See what best fits your travel plans
                    </p>
                    <GoldButton size="lg">Calculate</GoldButton>
                </div>
            </div>
        </section>
    );
}
