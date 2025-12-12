<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SyncJobStatus;
use App\Enums\SyncJobType;
use App\Events\Sync\SyncJobCreated;
use App\Http\Controllers\Controller;
use App\Jobs\Sync\CheckStockJob;
use App\Jobs\Sync\FullSyncJob;
use App\Jobs\Sync\SyncCountriesJob;
use App\Jobs\Sync\SyncPackagesJob;
use App\Jobs\Sync\SyncPricingJob;
use App\Models\Provider;
use App\Models\SyncJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SyncJobController extends Controller
{
    public function index(Request $request): Response
    {
        $syncJobs = SyncJob::query()
            ->with('provider:id,name')
            ->when($request->provider_id, fn ($q, $id) => $q->where('provider_id', $id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/sync-jobs/index', [
            'syncJobs' => $syncJobs,
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'statuses' => collect(SyncJobStatus::cases())->map(fn ($s) => ['value' => $s->value, 'label' => $s->name]),
            'types' => collect(SyncJobType::cases())->map(fn ($t) => ['value' => $t->value, 'label' => $t->name]),
            'filters' => $request->only('provider_id', 'status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'type' => 'required|in:' . implode(',', array_column(SyncJobType::cases(), 'value')),
        ]);

        // Create sync job using Verbs event sourcing
        $syncJob = SyncJobCreated::commit(
            provider_id: (int) $validated['provider_id'],
            type: SyncJobType::from($validated['type']),
            triggered_by: 'manual',
            triggered_by_user_id: Auth::id(),
        );

        // Dispatch the appropriate job
        $this->dispatchSyncJob(
            SyncJobType::from($validated['type']),
            (int) $validated['provider_id'],
            $syncJob->id
        );

        return redirect()->route('admin.sync-jobs.index')
            ->with('success', 'Sync job started.');
    }

    private function dispatchSyncJob(SyncJobType $type, int $providerId, int $syncJobId): void
    {
        match ($type) {
            SyncJobType::SyncPackages => SyncPackagesJob::dispatch($providerId, $syncJobId),
            SyncJobType::SyncCountries => SyncCountriesJob::dispatch($providerId, $syncJobId),
            SyncJobType::SyncPricing => SyncPricingJob::dispatch($providerId, $syncJobId),
            SyncJobType::CheckStock => CheckStockJob::dispatch($providerId, $syncJobId),
            SyncJobType::FullSync => FullSyncJob::dispatch($providerId, $syncJobId),
        };
    }
}
