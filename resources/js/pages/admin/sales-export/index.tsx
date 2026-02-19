import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    Download,
    FileSpreadsheet,
    FileText,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface RegionData {
    orders: number;
    revenue: number;
    vat: number;
    net: number;
    cost: number;
    profit: number;
}

interface DayRow {
    date: string;
    date_formatted: string;
    kosovo: RegionData;
    other: RegionData;
    total: RegionData;
    cumulative_revenue: number;
}

interface Props {
    report: {
        days: DayRow[];
        totals: {
            kosovo: RegionData;
            other: RegionData;
            all: RegionData;
        };
        period: {
            start: string;
            end: string;
            days_count: number;
        };
    };
    filters: {
        start_date: string;
        end_date: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales Export', href: '/admin/sales-export' },
];

function eur(value: number): string {
    return `€${value.toFixed(2)}`;
}

export default function SalesExport({ report, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    function applyFilters() {
        router.get(
            '/admin/sales-export',
            { start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    }

    function exportUrl(type: 'detailed' | 'summary') {
        return `/admin/sales-export/${type}?start_date=${startDate}&end_date=${endDate}`;
    }

    const hasData = report.days.some((d) => d.total.orders > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Export" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                            Sales Export
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Daily sales breakdown by billing country
                            (Kosovo vs Other).
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border bg-card">
                    <div className="flex flex-wrap items-end gap-3 px-5 py-4">
                        <div className="min-w-[160px]">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                From
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="min-w-[160px]">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                To
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <Button size="sm" onClick={applyFilters}>
                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                            Apply
                        </Button>
                        <div className="ml-auto flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <a href={exportUrl('detailed')} download>
                                    <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                                    CSV Detailed
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <a href={exportUrl('summary')} download>
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    CSV Summary
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border bg-card px-4 py-3.5">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Total Revenue
                        </p>
                        <p className="mt-1 text-lg font-bold tabular-nums">
                            {eur(report.totals.all.revenue)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {report.totals.all.orders} orders &middot;{' '}
                            {report.period.days_count} days
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card px-4 py-3.5">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Kosovo
                        </p>
                        <p className="mt-1 text-lg font-bold tabular-nums text-blue-600">
                            {eur(report.totals.kosovo.revenue)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {report.totals.kosovo.orders} orders &middot;
                            VAT {eur(report.totals.kosovo.vat)}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card px-4 py-3.5">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Other Countries
                        </p>
                        <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">
                            {eur(report.totals.other.revenue)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {report.totals.other.orders} orders &middot;
                            VAT {eur(report.totals.other.vat)}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card px-4 py-3.5">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Total Profit
                        </p>
                        <p className="mt-1 text-lg font-bold tabular-nums text-amber-600">
                            {eur(report.totals.all.profit)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Net {eur(report.totals.all.net)}
                        </p>
                    </div>
                </div>

                {/* Daily Table */}
                <div className="rounded-xl border bg-card">
                    <div className="flex items-center gap-2 border-b px-5 py-3">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">
                            Daily Breakdown
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {report.period.start} — {report.period.end}
                        </span>
                    </div>

                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                            <Download className="h-8 w-8 text-muted-foreground/40" />
                            <p className="mt-3 text-sm font-medium text-muted-foreground">
                                No completed orders in this period
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                Try adjusting the date range.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[120px] text-xs">
                                            Date
                                        </TableHead>
                                        <TableHead
                                            colSpan={3}
                                            className="border-l bg-blue-50/50 text-center text-xs font-semibold text-blue-700 dark:bg-blue-950/20"
                                        >
                                            Kosovo (XK)
                                        </TableHead>
                                        <TableHead
                                            colSpan={3}
                                            className="border-l bg-emerald-50/50 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20"
                                        >
                                            Other Countries
                                        </TableHead>
                                        <TableHead
                                            colSpan={2}
                                            className="border-l text-center text-xs font-semibold"
                                        >
                                            Day Total
                                        </TableHead>
                                        <TableHead className="border-l text-center text-xs">
                                            <TrendingUp className="mx-auto h-3.5 w-3.5" />
                                        </TableHead>
                                    </TableRow>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-[11px]" />
                                        {/* Kosovo sub-headers */}
                                        <TableHead className="border-l bg-blue-50/30 text-right text-[11px] dark:bg-blue-950/10">
                                            Orders
                                        </TableHead>
                                        <TableHead className="bg-blue-50/30 text-right text-[11px] dark:bg-blue-950/10">
                                            Revenue
                                        </TableHead>
                                        <TableHead className="bg-blue-50/30 text-right text-[11px] dark:bg-blue-950/10">
                                            VAT
                                        </TableHead>
                                        {/* Other sub-headers */}
                                        <TableHead className="border-l bg-emerald-50/30 text-right text-[11px] dark:bg-emerald-950/10">
                                            Orders
                                        </TableHead>
                                        <TableHead className="bg-emerald-50/30 text-right text-[11px] dark:bg-emerald-950/10">
                                            Revenue
                                        </TableHead>
                                        <TableHead className="bg-emerald-50/30 text-right text-[11px] dark:bg-emerald-950/10">
                                            VAT
                                        </TableHead>
                                        {/* Total sub-headers */}
                                        <TableHead className="border-l text-right text-[11px]">
                                            Orders
                                        </TableHead>
                                        <TableHead className="text-right text-[11px]">
                                            Revenue
                                        </TableHead>
                                        {/* Cumulative */}
                                        <TableHead className="border-l text-right text-[11px]">
                                            Cumulative
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.days.map((day) => (
                                        <TableRow
                                            key={day.date}
                                            className={
                                                day.total.orders === 0
                                                    ? 'text-muted-foreground/50'
                                                    : ''
                                            }
                                        >
                                            <TableCell className="text-xs font-medium">
                                                {day.date_formatted}
                                            </TableCell>
                                            {/* Kosovo */}
                                            <TableCell className="border-l bg-blue-50/20 text-right tabular-nums text-xs dark:bg-blue-950/5">
                                                {day.kosovo.orders || '–'}
                                            </TableCell>
                                            <TableCell className="bg-blue-50/20 text-right tabular-nums text-xs dark:bg-blue-950/5">
                                                {day.kosovo.revenue
                                                    ? eur(day.kosovo.revenue)
                                                    : '–'}
                                            </TableCell>
                                            <TableCell className="bg-blue-50/20 text-right tabular-nums text-xs dark:bg-blue-950/5">
                                                {day.kosovo.vat
                                                    ? eur(day.kosovo.vat)
                                                    : '–'}
                                            </TableCell>
                                            {/* Other */}
                                            <TableCell className="border-l bg-emerald-50/20 text-right tabular-nums text-xs dark:bg-emerald-950/5">
                                                {day.other.orders || '–'}
                                            </TableCell>
                                            <TableCell className="bg-emerald-50/20 text-right tabular-nums text-xs dark:bg-emerald-950/5">
                                                {day.other.revenue
                                                    ? eur(day.other.revenue)
                                                    : '–'}
                                            </TableCell>
                                            <TableCell className="bg-emerald-50/20 text-right tabular-nums text-xs dark:bg-emerald-950/5">
                                                {day.other.vat
                                                    ? eur(day.other.vat)
                                                    : '–'}
                                            </TableCell>
                                            {/* Day total */}
                                            <TableCell className="border-l text-right tabular-nums text-xs font-semibold">
                                                {day.total.orders || '–'}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-xs font-semibold">
                                                {day.total.revenue
                                                    ? eur(day.total.revenue)
                                                    : '–'}
                                            </TableCell>
                                            {/* Cumulative */}
                                            <TableCell className="border-l text-right tabular-nums text-xs font-medium text-muted-foreground">
                                                {eur(day.cumulative_revenue)}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Totals row */}
                                    <TableRow className="border-t-2 bg-muted/30 font-semibold hover:bg-muted/30">
                                        <TableCell className="text-xs">
                                            TOTAL
                                        </TableCell>
                                        <TableCell className="border-l bg-blue-50/30 text-right tabular-nums text-xs dark:bg-blue-950/10">
                                            {report.totals.kosovo.orders}
                                        </TableCell>
                                        <TableCell className="bg-blue-50/30 text-right tabular-nums text-xs dark:bg-blue-950/10">
                                            {eur(
                                                report.totals.kosovo.revenue,
                                            )}
                                        </TableCell>
                                        <TableCell className="bg-blue-50/30 text-right tabular-nums text-xs dark:bg-blue-950/10">
                                            {eur(report.totals.kosovo.vat)}
                                        </TableCell>
                                        <TableCell className="border-l bg-emerald-50/30 text-right tabular-nums text-xs dark:bg-emerald-950/10">
                                            {report.totals.other.orders}
                                        </TableCell>
                                        <TableCell className="bg-emerald-50/30 text-right tabular-nums text-xs dark:bg-emerald-950/10">
                                            {eur(
                                                report.totals.other.revenue,
                                            )}
                                        </TableCell>
                                        <TableCell className="bg-emerald-50/30 text-right tabular-nums text-xs dark:bg-emerald-950/10">
                                            {eur(report.totals.other.vat)}
                                        </TableCell>
                                        <TableCell className="border-l text-right tabular-nums text-xs">
                                            {report.totals.all.orders}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-xs">
                                            {eur(report.totals.all.revenue)}
                                        </TableCell>
                                        <TableCell className="border-l" />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
