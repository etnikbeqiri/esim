<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesExportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $data = $this->buildReport($startDate, $endDate);

        return Inertia::render('admin/sales-export/index', [
            'report' => $data,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Export: detailed CSV (one row per day, Kosovo + Other columns).
     */
    public function exportDetailed(Request $request): StreamedResponse
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        $data = $this->buildReport($startDate, $endDate);

        $filename = "sales-report-{$startDate}-to-{$endDate}.csv";

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');

            // BOM for Excel UTF-8 compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // Header
            fputcsv($handle, [
                'Date',
                'Kosovo Orders',
                'Kosovo Revenue (EUR)',
                'Kosovo VAT (EUR)',
                'Kosovo Net (EUR)',
                'Other Orders',
                'Other Revenue (EUR)',
                'Other VAT (EUR)',
                'Other Net (EUR)',
                'Total Orders',
                'Total Revenue (EUR)',
                'Total VAT (EUR)',
                'Total Net (EUR)',
                'Cumulative Revenue (EUR)',
            ]);

            foreach ($data['days'] as $day) {
                fputcsv($handle, [
                    $day['date'],
                    $day['kosovo']['orders'],
                    number_format($day['kosovo']['revenue'], 2, '.', ''),
                    number_format($day['kosovo']['vat'], 2, '.', ''),
                    number_format($day['kosovo']['net'], 2, '.', ''),
                    $day['other']['orders'],
                    number_format($day['other']['revenue'], 2, '.', ''),
                    number_format($day['other']['vat'], 2, '.', ''),
                    number_format($day['other']['net'], 2, '.', ''),
                    $day['total']['orders'],
                    number_format($day['total']['revenue'], 2, '.', ''),
                    number_format($day['total']['vat'], 2, '.', ''),
                    number_format($day['total']['net'], 2, '.', ''),
                    number_format($day['cumulative_revenue'], 2, '.', ''),
                ]);
            }

            // Totals row
            fputcsv($handle, [
                'TOTAL',
                $data['totals']['kosovo']['orders'],
                number_format($data['totals']['kosovo']['revenue'], 2, '.', ''),
                number_format($data['totals']['kosovo']['vat'], 2, '.', ''),
                number_format($data['totals']['kosovo']['net'], 2, '.', ''),
                $data['totals']['other']['orders'],
                number_format($data['totals']['other']['revenue'], 2, '.', ''),
                number_format($data['totals']['other']['vat'], 2, '.', ''),
                number_format($data['totals']['other']['net'], 2, '.', ''),
                $data['totals']['all']['orders'],
                number_format($data['totals']['all']['revenue'], 2, '.', ''),
                number_format($data['totals']['all']['vat'], 2, '.', ''),
                number_format($data['totals']['all']['net'], 2, '.', ''),
                '',
            ]);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Export: summary CSV (split format — two sections stacked).
     */
    public function exportSummary(Request $request): StreamedResponse
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        $data = $this->buildReport($startDate, $endDate);

        $filename = "sales-summary-{$startDate}-to-{$endDate}.csv";

        return response()->streamDownload(function () use ($data, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');

            fwrite($handle, "\xEF\xBB\xBF");

            // Section 1: Kosovo Sales
            fputcsv($handle, ["KOSOVO SALES ({$startDate} to {$endDate})"]);
            fputcsv($handle, ['Date', 'Orders', 'Revenue (EUR)', 'VAT (EUR)', 'Net (EUR)', 'Cumulative (EUR)']);

            $kosCumulative = 0;
            foreach ($data['days'] as $day) {
                $kosCumulative += $day['kosovo']['revenue'];
                fputcsv($handle, [
                    $day['date'],
                    $day['kosovo']['orders'],
                    number_format($day['kosovo']['revenue'], 2, '.', ''),
                    number_format($day['kosovo']['vat'], 2, '.', ''),
                    number_format($day['kosovo']['net'], 2, '.', ''),
                    number_format($kosCumulative, 2, '.', ''),
                ]);
            }
            fputcsv($handle, [
                'TOTAL',
                $data['totals']['kosovo']['orders'],
                number_format($data['totals']['kosovo']['revenue'], 2, '.', ''),
                number_format($data['totals']['kosovo']['vat'], 2, '.', ''),
                number_format($data['totals']['kosovo']['net'], 2, '.', ''),
                '',
            ]);

            // Blank separator
            fputcsv($handle, []);

            // Section 2: Other Countries Sales
            fputcsv($handle, ["OTHER COUNTRIES SALES ({$startDate} to {$endDate})"]);
            fputcsv($handle, ['Date', 'Orders', 'Revenue (EUR)', 'VAT (EUR)', 'Net (EUR)', 'Cumulative (EUR)']);

            $otherCumulative = 0;
            foreach ($data['days'] as $day) {
                $otherCumulative += $day['other']['revenue'];
                fputcsv($handle, [
                    $day['date'],
                    $day['other']['orders'],
                    number_format($day['other']['revenue'], 2, '.', ''),
                    number_format($day['other']['vat'], 2, '.', ''),
                    number_format($day['other']['net'], 2, '.', ''),
                    number_format($otherCumulative, 2, '.', ''),
                ]);
            }
            fputcsv($handle, [
                'TOTAL',
                $data['totals']['other']['orders'],
                number_format($data['totals']['other']['revenue'], 2, '.', ''),
                number_format($data['totals']['other']['vat'], 2, '.', ''),
                number_format($data['totals']['other']['net'], 2, '.', ''),
                '',
            ]);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Build the daily report data grouped by Kosovo vs Other.
     */
    private function buildReport(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Aggregate by day and billing region
        $rows = Order::query()
            ->select(
                DB::raw('DATE(completed_at) as sale_date'),
                DB::raw("CASE WHEN billing_country = 'XK' THEN 'kosovo' ELSE 'other' END as region"),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(amount) as revenue'),
                DB::raw('SUM(vat_amount) as vat'),
                DB::raw('SUM(net_amount) as net'),
                DB::raw('SUM(cost_price) as cost'),
                DB::raw('SUM(profit) as profit'),
            )
            ->where('status', OrderStatus::Completed->value)
            ->whereBetween('completed_at', [$start, $end])
            ->groupBy('sale_date', 'region')
            ->orderBy('sale_date')
            ->get()
            ->groupBy('sale_date');

        $period = CarbonPeriod::create($start, $end);
        $days = [];
        $cumulativeRevenue = 0;

        $totalKosovo = ['orders' => 0, 'revenue' => 0, 'vat' => 0, 'net' => 0, 'cost' => 0, 'profit' => 0];
        $totalOther = ['orders' => 0, 'revenue' => 0, 'vat' => 0, 'net' => 0, 'cost' => 0, 'profit' => 0];

        foreach ($period as $date) {
            $dateStr = $date->toDateString();
            $dayData = $rows->get($dateStr);

            $kosovo = $this->extractRegion($dayData, 'kosovo');
            $other = $this->extractRegion($dayData, 'other');

            $dayTotal = [
                'orders' => $kosovo['orders'] + $other['orders'],
                'revenue' => $kosovo['revenue'] + $other['revenue'],
                'vat' => $kosovo['vat'] + $other['vat'],
                'net' => $kosovo['net'] + $other['net'],
                'cost' => $kosovo['cost'] + $other['cost'],
                'profit' => $kosovo['profit'] + $other['profit'],
            ];

            $cumulativeRevenue += $dayTotal['revenue'];

            $days[] = [
                'date' => $dateStr,
                'date_formatted' => $date->format('D, M j'),
                'kosovo' => $kosovo,
                'other' => $other,
                'total' => $dayTotal,
                'cumulative_revenue' => $cumulativeRevenue,
            ];

            foreach (['orders', 'revenue', 'vat', 'net', 'cost', 'profit'] as $key) {
                $totalKosovo[$key] += $kosovo[$key];
                $totalOther[$key] += $other[$key];
            }
        }

        $totalAll = [];
        foreach (['orders', 'revenue', 'vat', 'net', 'cost', 'profit'] as $key) {
            $totalAll[$key] = $totalKosovo[$key] + $totalOther[$key];
        }

        return [
            'days' => $days,
            'totals' => [
                'kosovo' => $totalKosovo,
                'other' => $totalOther,
                'all' => $totalAll,
            ],
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
                'days_count' => count($days),
            ],
        ];
    }

    private function extractRegion($dayData, string $region): array
    {
        if (! $dayData) {
            return ['orders' => 0, 'revenue' => 0, 'vat' => 0, 'net' => 0, 'cost' => 0, 'profit' => 0];
        }

        $row = $dayData->firstWhere('region', $region);

        if (! $row) {
            return ['orders' => 0, 'revenue' => 0, 'vat' => 0, 'net' => 0, 'cost' => 0, 'profit' => 0];
        }

        return [
            'orders' => (int) $row->order_count,
            'revenue' => (float) $row->revenue,
            'vat' => (float) $row->vat,
            'net' => (float) $row->net,
            'cost' => (float) $row->cost,
            'profit' => (float) $row->profit,
        ];
    }
}
