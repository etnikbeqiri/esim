import { CountryFlag } from '@/components/country-flag';
import { useTrans } from '@/hooks/use-trans';
import { Calendar, HardDrive, Mail, Receipt } from 'lucide-react';

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
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50/30 px-4 py-4 md:px-6 md:py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm ring-1 ring-primary-100 md:h-10 md:w-10">
                            <Receipt className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-primary-400 uppercase md:text-[11px]">
                                {trans('order_summary.order_number')}
                            </p>
                            <p className="font-mono text-[15px] font-bold text-primary-900 md:text-base">
                                {orderNumber}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-accent-500 shadow-sm ring-1 ring-primary-100 sm:order-2 md:h-10 md:w-10">
                            <Mail className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="sm:order-1">
                            <p className="text-[10px] font-semibold tracking-wider text-primary-400 uppercase md:text-[11px]">
                                {trans('order_summary.confirmation_sent_to')}
                            </p>
                            <p className="max-w-[200px] truncate text-[13px] font-medium text-primary-700 sm:max-w-[250px] md:text-sm">
                                {customerEmail}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Details */}
            {pkg && (
                <div className="px-4 py-4 md:px-6 md:py-5">
                    <div className="flex items-center gap-3">
                        {pkg.country_iso && (
                            <div className="overflow-hidden rounded-lg shadow-md ring-2 ring-white">
                                <CountryFlag
                                    countryCode={pkg.country_iso}
                                    className="h-9 w-12 md:h-10 md:w-14"
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[15px] font-bold text-primary-900 md:text-base">
                                {pkg.name}
                            </h3>
                            {pkg.country && (
                                <p className="text-xs text-primary-500">
                                    {pkg.country}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Data & Validity pills */}
                    <div className="mt-3 flex gap-2 md:mt-4">
                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 px-3 py-2 ring-1 ring-primary-100">
                            <HardDrive className="h-3.5 w-3.5 shrink-0 text-primary-400" />
                            <div className="min-w-0">
                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                    {trans('order_summary.data')}
                                </p>
                                <p className="text-xs font-bold text-primary-900 md:text-sm">
                                    {pkg.data_label}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 px-3 py-2 ring-1 ring-primary-100">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary-400" />
                            <div className="min-w-0">
                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                    {trans('order_summary.validity')}
                                </p>
                                <p className="text-xs font-bold text-primary-900 md:text-sm">
                                    {pkg.validity_label}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
