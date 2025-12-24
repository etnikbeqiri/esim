import { CheckCircle2 } from 'lucide-react';

interface TrustItem {
    title: string;
    description: string;
}

interface TrustSectionProps {
    items?: TrustItem[];
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

export function TrustSection({ items = defaultItems }: TrustSectionProps) {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                <div>
                                    <h3 className="font-medium">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
