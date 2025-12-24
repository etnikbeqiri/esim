import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <section className="bg-muted/30 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        discover our plans
                    </h2>
                </div>

                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? 'scale-105 border-primary shadow-lg' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary px-3 py-1 text-primary-foreground">
                                        Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="pb-4 text-center">
                                <div className="mb-2">
                                    <img
                                        src={`/img/${plan.id}-plan-label.png`}
                                        alt={`${plan.name} plan`}
                                        className="mx-auto h-8"
                                        onError={(e) => {
                                            // Fallback if image doesn't exist
                                            e.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                </div>
                                <CardTitle className="text-2xl">
                                    {plan.name}
                                </CardTitle>
                                <div className="text-lg font-semibold text-primary">
                                    {plan.price}
                                </div>
                                <p className="text-muted-foreground">
                                    {plan.description}
                                </p>
                            </CardHeader>

                            <CardContent>
                                <ul className="mb-6 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3"
                                        >
                                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                            <span className="text-sm">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    variant={plan.buttonVariant || 'default'}
                                    size="lg"
                                >
                                    {plan.buttonText}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <h3 className="mb-2 text-xl font-semibold">
                        Fair prices, No hidden fees
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                        Calculate See what best fits your travel plans
                    </p>
                    <Button variant="outline" size="lg">
                        Calculate
                    </Button>
                </div>
            </div>
        </section>
    );
}
