import { CountryFlag } from '@/components/country-flag';
import { Card, CardContent } from '@/components/ui/card';
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
        <Card className={`overflow-hidden ${className}`}>
            {/* Header */}
            <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Order Number
                            </p>
                            <p className="font-mono font-semibold">{orderNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:order-2">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="sm:order-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Confirmation sent to
                            </p>
                            <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-[250px]">
                                {customerEmail}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Details */}
            {pkg && (
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        {pkg.country_iso && (
                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white p-3 dark:bg-muted/20">
                                <CountryFlag countryCode={pkg.country_iso} className="h-10 w-14 rounded-sm" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold truncate">{pkg.name}</h3>
                            {pkg.country && (
                                <p className="text-muted-foreground">{pkg.country}</p>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/20 p-4 transition-colors hover:border-primary/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                    <HardDrive className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Data
                                    </p>
                                    <p className="text-lg font-bold">{pkg.data_label}</p>
                                </div>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/20 p-4 transition-colors hover:border-primary/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                    <Calendar className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Validity
                                    </p>
                                    <p className="text-lg font-bold">{pkg.validity_label}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
