<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Device;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function index(Request $request): Response
    {
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');

        // Validate sort field
        $allowedSorts = ['name', 'release_year', 'is_active', 'brand'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'name';
        }

        $devices = Device::query()
            ->with('brand:id,name,slug')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->brand_id, fn($q, $brandId) => $q->where('brand_id', $brandId))
            ->when($request->esim_supported !== null, fn($q) => $q->where('esim_supported', $request->boolean('esim_supported')))
            ->when($sortField === 'brand', function ($q) use ($sortDirection) {
                $q->join('brands', 'devices.brand_id', '=', 'brands.id')
                    ->orderBy('brands.name', $sortDirection)
                    ->select('devices.*');
            }, function ($q) use ($sortField, $sortDirection) {
                $q->orderBy($sortField, $sortDirection);
            })
            ->paginate(50)
            ->withQueryString();

        $brands = Brand::query()
            ->active()
            ->ordered()
            ->get(['id', 'name', 'slug']);

        return Inertia::render('admin/devices/index', [
            'devices' => $devices,
            'brands' => $brands,
            'filters' => $request->only('search', 'brand_id', 'esim_supported', 'sort', 'direction'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'release_year' => ['nullable', 'integer', 'min:2000', 'max:2030'],
            'model_identifiers' => ['nullable', 'array'],
            'model_identifiers.*' => ['string', 'max:100'],
            'esim_supported' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        Device::create([
            'brand_id' => $validated['brand_id'],
            'name' => $validated['name'],
            'release_year' => $validated['release_year'] ?? null,
            'model_identifiers' => $validated['model_identifiers'] ?? null,
            'esim_supported' => $validated['esim_supported'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Device created successfully.');
    }

    public function update(Request $request, Device $device): RedirectResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'release_year' => ['nullable', 'integer', 'min:2000', 'max:2030'],
            'model_identifiers' => ['nullable', 'array'],
            'model_identifiers.*' => ['string', 'max:100'],
            'esim_supported' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $device->update([
            'brand_id' => $validated['brand_id'],
            'name' => $validated['name'],
            'release_year' => $validated['release_year'] ?? null,
            'model_identifiers' => $validated['model_identifiers'] ?? null,
            'esim_supported' => $validated['esim_supported'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Device updated successfully.');
    }

    public function destroy(Device $device): RedirectResponse
    {
        $device->delete();

        return back()->with('success', 'Device deleted successfully.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:devices,id'],
        ]);

        $count = Device::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', "{$count} device(s) deleted successfully.");
    }

    public function bulkToggle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:devices,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        Device::whereIn('id', $validated['ids'])->update(['is_active' => $validated['is_active']]);

        $status = $validated['is_active'] ? 'activated' : 'deactivated';

        return back()->with('success', count($validated['ids']) . " device(s) {$status} successfully.");
    }

    public function toggleActive(Device $device): RedirectResponse
    {
        $device->update(['is_active' => !$device->is_active]);

        $status = $device->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Device {$status} successfully.");
    }
}
