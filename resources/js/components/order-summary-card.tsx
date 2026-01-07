import { CountryFlag } from '@/components/country-flag';
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
    return (
        <div
            className={`overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm ${className}`}
        >
            {/* Header */}
            <div className="border-b border-primary-100 bg-gradient-to-r from-primary-50 to-accent-50/50 px-6 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                            <Receipt className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium tracking-wider text-primary-500 uppercase">
                                Order Number
                            </p>
                            <p className="font-mono font-semibold text-primary-900">
                                {orderNumber}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 sm:order-2">
                            <Mail className="h-5 w-5 text-accent-600" />
                        </div>
                        <div className="sm:order-1">
                            <p className="text-xs font-medium tracking-wider text-primary-500 uppercase">
                                Confirmation sent to
                            </p>
                            <p className="max-w-[200px] truncate text-sm font-medium text-primary-800 sm:max-w-[250px]">
                                {customerEmail}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Details */}
            {pkg && (
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        {pkg.country_iso && (
                            <div className="flex items-center justify-center rounded-lg border border-primary-100 bg-primary-50/50 p-3 shadow-sm">
                                <CountryFlag
                                    countryCode={pkg.country_iso}
                                    className="h-10 w-14 rounded-sm"
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-semibold text-primary-900">
                                {pkg.name}
                            </h3>
                            {pkg.country && (
                                <p className="text-primary-600">
                                    {pkg.country}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                                    <HardDrive className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-primary-500 uppercase">
                                        Data
                                    </p>
                                    <p className="text-lg font-bold text-primary-900">
                                        {pkg.data_label}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                                    <Calendar className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-primary-500 uppercase">
                                        Validity
                                    </p>
                                    <p className="text-lg font-bold text-primary-900">
                                        {pkg.validity_label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
