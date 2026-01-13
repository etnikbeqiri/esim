import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
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
    title,
    description,
    buttonText,
    buttonHref = '/destinations',
}: CTASectionProps) {
    const { totalCountries, totalPackages } = usePage<SharedData>().props;
    const { trans } = useTrans();

    const displayTitle = title || trans('cta.title');
    const displayButtonText = buttonText || trans('cta.button');
    const displayDescription =
        description ||
        trans('cta.description', {
            packages: String(totalPackages || 50),
            countries: String(totalCountries || 4),
        });

    return (
        <section className="relative overflow-hidden py-20 md:py-28">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50" />

            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />

            {/* Glass overlay */}
            <div className="absolute inset-0 backdrop-blur-[1px]" />

            <div className="relative z-10 container mx-auto px-4 text-center">
                {/* Icon */}
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/60 bg-white/70 shadow-xl backdrop-blur-sm">
                    <Globe className="h-10 w-10 text-primary-500" />
                </div>

                {/* Title */}
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-primary-900 md:text-4xl lg:text-5xl">
                    {displayTitle}
                </h2>

                {/* Description */}
                <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-700">
                    {displayDescription}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <GoldButton
                        size="lg"
                        asChild
                        className="h-14 min-w-[220px] px-8 text-base"
                    >
                        <Link href={buttonHref}>
                            {displayButtonText}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </GoldButton>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                    <Badge
                        variant="outline"
                        className="border-primary-200 bg-white/70 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm"
                    >
                        <span className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-accent-300">
                            <CheckCircle2 className="h-3 w-3 text-accent-950" />
                        </span>
                        {trans('cta.badges.instant')}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-primary-200 bg-white/70 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm"
                    >
                        <span className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-accent-300">
                            <CheckCircle2 className="h-3 w-3 text-accent-950" />
                        </span>
                        {trans('cta.badges.support')}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-primary-200 bg-white/70 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm"
                    >
                        <span className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-accent-300">
                            <CheckCircle2 className="h-3 w-3 text-accent-950" />
                        </span>
                        {trans('cta.badges.secure')}
                    </Badge>
                </div>
            </div>
        </section>
    );
}
