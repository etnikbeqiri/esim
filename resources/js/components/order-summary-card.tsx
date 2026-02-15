import { CountryFlag } from '@/components/country-flag';
import { useTrans } from '@/hooks/use-trans';
import { Calendar, HardDrive, Mail } from 'lucide-react';

interface Package {
    name: string;
    data_label: string;
    validity_label: string;
    country: string | null;
    country_iso: string | null;
}

interface OrderSummaryCardProps {
    orderNumber: string;
    customerEmail: string;
    package: Package | null;
    className?: string;
}

export function OrderSummaryCard({
    orderNumber,
    customerEmail,
    package: pkg,
    className = '',
}: OrderSummaryCardProps) {
    const { trans } = useTrans();

    return (
        <div
            className={`overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm ${className}`}
        >
            <div className="px-4 py-4 md:px-6 md:py-5">
                {/* Order number + email */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-wider text-primary-400 uppercase md:text-[11px]">
                            {trans('order_summary.order_number')}
                        </p>
                        <p className="font-mono text-sm font-bold text-primary-900 md:text-[15px]">
                            {orderNumber}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-500">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <p className="max-w-[220px] truncate text-[11px] md:max-w-[280px] md:text-xs">
                            {customerEmail}
                        </p>
                    </div>
                </div>

                {/* Package Details */}
                {pkg && (
                    <div className="mt-3 rounded-xl bg-primary-50/50 p-3 ring-1 ring-primary-100">
                        <div className="flex items-center gap-3">
                            {pkg.country_iso && (
                                <div className="overflow-hidden rounded-md shadow-sm ring-1 ring-primary-200/50">
                                    <CountryFlag
                                        countryCode={pkg.country_iso}
                                        className="h-8 w-11 md:h-9 md:w-12"
                                    />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-bold text-primary-900 md:text-[15px]">
                                    {pkg.name}
                                </h3>
                                {pkg.country && (
                                    <p className="text-[11px] text-primary-500 md:text-xs">
                                        {pkg.country}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Data & Validity inline */}
                        <div className="mt-2.5 flex gap-3 border-t border-primary-100/80 pt-2.5">
                            <div className="flex items-center gap-1.5">
                                <HardDrive className="h-3 w-3 text-primary-400" />
                                <span className="text-[10px] text-primary-400 md:text-[11px]">
                                    {trans('order_summary.data')}
                                </span>
                                <span className="text-[11px] font-bold text-primary-800 md:text-xs">
                                    {pkg.data_label}
                                </span>
                            </div>
                            <div className="h-4 w-px bg-primary-200/60" />
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-primary-400" />
                                <span className="text-[10px] text-primary-400 md:text-[11px]">
                                    {trans('order_summary.validity')}
                                </span>
                                <span className="text-[11px] font-bold text-primary-800 md:text-xs">
                                    {pkg.validity_label}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
