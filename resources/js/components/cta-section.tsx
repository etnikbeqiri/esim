import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Globe } from 'lucide-react';

interface CTASectionProps {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonHref?: string;
}

export function CTASection({
    title = 'Your Next Adventure Awaits',
    description,
    buttonText = 'Find Your Destination',
    buttonHref = '/destinations',
}: CTASectionProps) {
    const { name } = usePage<SharedData>().props;

    const defaultDescription = `Join thousands of travelers who stay connected with ${name}. Get your eSIM in minutes and travel worry-free.`;

    return (
        <section className="bg-secondary py-16 text-secondary-foreground md:py-20">
            <div className="container mx-auto px-4 text-center">
                <Globe className="mx-auto mb-6 h-12 w-12 opacity-80" />
                <h2 className="mb-4 text-2xl font-bold md:text-3xl">{title}</h2>
                <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
                    {description || defaultDescription}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button size="lg" asChild>
                        <Link href={buttonHref}>
                            {buttonText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Badge variant="outline" className="px-3 py-1.5 text-sm">
                        <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500" />
                        Instant Delivery
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1.5 text-sm">
                        <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500" />
                        24/7 Support
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1.5 text-sm">
                        <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500" />
                        Secure Payment
                    </Badge>
                </div>
            </div>
        </section>
    );
}
