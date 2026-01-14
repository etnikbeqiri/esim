import { CountryFlag } from '@/components/country-flag';
import { useTrans } from '@/hooks/use-trans';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

interface DestinationCardProps {
    id: number;
    name: string;
    iso_code: string;
    package_count: number;
    min_price: number | null;
}

export function DestinationCard({
    name,
    iso_code,
    package_count,
    min_price,
}: DestinationCardProps) {
    const { trans } = useTrans();

    return (
        <Link href={`/destinations/${iso_code.toLowerCase()}`}>
            <div className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-primary-100 bg-white p-5 shadow-sm transition-all duration-300 before:absolute before:inset-0 before:left-[-100%] before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] before:transition-none hover:-translate-y-1 hover:border-accent-400 hover:shadow-[0px_4px_20px_rgba(212,175,55,0.35)] hover:before:animate-[btn-shimmer_1.5s_ease-in-out_infinite]">
                {/* Flag & Country Name */}
                <div className="relative z-10 mb-4 flex items-center gap-3">
                    <div className="overflow-hidden rounded-lg">
                        <CountryFlag
                            countryCode={iso_code}
                            size="lg"
                            className="transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                    <h3 className="flex-1 truncate text-lg font-bold text-gray-950">
                        {name}
                    </h3>
                    {/* Arrow indicator - inline with title */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 transition-all duration-300 group-hover:bg-accent-400">
                        <ArrowRight className="h-4 w-4 text-primary-400 transition-colors group-hover:text-accent-950" />
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex items-center justify-between">
                    {/* Plans count */}
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700 transition-colors group-hover:bg-accent-400 group-hover:text-accent-950">
                            {package_count}
                        </span>
                        <span className="text-sm font-medium text-primary-600">
                            {trans(
                                package_count !== 1
                                    ? 'destinations.card.plans'
                                    : 'destinations.card.plan',
                            )}
                        </span>
                    </div>

                    {/* Price */}
                    {min_price !== null && (
                        <div className="text-right">
                            <span className="text-xs text-primary-500">
                                {trans('destinations.card.from')}
                            </span>
                            <p className="text-lg font-bold text-accent-500">
                                €
                                {new Intl.NumberFormat(
                                    document.documentElement.lang || 'en-US',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    },
                                ).format(Number(min_price))}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
