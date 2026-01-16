import { FeatureItem } from '@/components/feature-item';
import { useTrans } from '@/hooks/use-trans';

interface TrustItem {
    title: string;
    description: string;
}

interface TrustSectionProps {
    items?: TrustItem[];
    variant?: 'default' | 'gold';
}

export function TrustSection({ items, variant = 'gold' }: TrustSectionProps) {
    const { trans } = useTrans();

    // If items are provided via props, use them. Otherwise use translated defaults.
    const displayItems: TrustItem[] = items || [
        {
            title: trans('trust.no_roaming'),
            description: trans('trust.no_roaming_desc'),
        },
        {
            title: trans('trust.instant'),
            description: trans('trust.instant_desc'),
        },
        {
            title: trans('trust.keep_number'),
            description: trans('trust.keep_number_desc'),
        },
        {
            title: trans('trust.support'),
            description: trans('trust.support_desc'),
        },
    ];

    return (
        <section className="bg-primary-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-5xl">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {displayItems.map((item, index) => (
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
