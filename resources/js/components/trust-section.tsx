import { FeatureItem } from '@/components/feature-item';

interface TrustItem {
    title: string;
    description: string;
}

interface TrustSectionProps {
    items?: TrustItem[];
    variant?: 'default' | 'gold';
}

const defaultItems: TrustItem[] = [
    {
        title: 'No Roaming Fees',
        description: 'Avoid expensive roaming charges',
    },
    {
        title: 'Instant Activation',
        description: 'Get connected in minutes',
    },
    {
        title: 'Keep Your Number',
        description: 'Your main SIM stays active',
    },
    {
        title: '24/7 Support',
        description: "We're here to help anytime",
    },
];

export function TrustSection({ items = defaultItems, variant = 'gold' }: TrustSectionProps) {
    return (
        <section className="bg-primary-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-5xl">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="group rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <FeatureItem
                                    variant={variant}
                                    size="lg"
                                    description={item.description}
                                >
                                    {item.title}
                                </FeatureItem>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
