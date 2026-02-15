import { CountryFlag } from '@/components/country-flag';
import { useTrans } from '@/hooks/use-trans';
import { Link } from '@inertiajs/react';
import { ArrowRight, Signal } from 'lucide-react';

interface DestinationCardProps {
    id: number;
    name: string;
    iso_code: string;
    package_count: number;
    min_price: number | null;
    onClick?: () => void;
}

export function DestinationCard({
    name,
    iso_code,
    package_count,
    min_price,
    onClick,
}: DestinationCardProps) {
    const { trans } = useTrans();

    return (
        <Link
            href={`/destinations/${iso_code.toLowerCase()}`}
            onClick={onClick}
        >
            <div className="group relative flex h-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-primary-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-400 hover:shadow-[0px_4px_16px_rgba(212,175,55,0.25)] md:gap-4 md:rounded-2xl md:p-4">
                {/* Flag */}
                <div className="shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 md:rounded-xl">
                    <CountryFlag
                        countryCode={iso_code}
                        size="lg"
                        className="block transition-transform duration-300 group-hover:scale-110"
                    />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-primary-900 md:text-base">
                        {name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5">
                        <Signal className="h-3 w-3 text-primary-400" />
                        <span className="text-[11px] font-medium text-primary-500 md:text-xs">
                            {package_count}{' '}
                            {trans(
                                package_count !== 1
                                    ? 'destinations.card.plans'
                                    : 'destinations.card.plan',
                            )}
                        </span>
                    </div>
                </div>

                {/* Price + Arrow */}
                <div className="flex shrink-0 items-center gap-2 md:gap-3">
                    {min_price !== null && (
                        <div className="text-right">
                            <p className="text-[10px] font-medium text-primary-400 md:text-xs">
                                {trans('destinations.card.from')}
                            </p>
                            <p className="text-base font-extrabold tracking-tight text-primary-900 md:text-lg">
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
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-accent-300 group-hover:to-accent-400 group-hover:shadow-sm md:h-8 md:w-8">
                        <ArrowRight className="h-3.5 w-3.5 text-primary-400 transition-colors group-hover:text-accent-950 md:h-4 md:w-4" />
                    </div>
                </div>

                {/* Hover shimmer */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
        </Link>
    );
}
