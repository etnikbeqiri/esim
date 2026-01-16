<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $sortField = $request->get('sort', 'sort_order');
        $sortDirection = $request->get('direction', 'asc');

        // Validate sort field
        $allowedSorts = ['name', 'slug', 'devices_count', 'sort_order', 'is_active'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'sort_order';
        }

        $brands = Brand::query()
            ->withCount('devices')
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy($sortField, $sortDirection)
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
            'filters' => $request->only('search', 'sort', 'direction'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'logo_url' => ['nullable', 'string', 'url', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        Brand::create([
            'name' => $validated['name'],
            'logo_url' => $validated['logo_url'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:brands,name,' . $brand->id],
            'logo_url' => ['nullable', 'string', 'url', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $brand->update([
            'name' => $validated['name'],
            'logo_url' => $validated['logo_url'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->devices()->count() > 0) {
            return back()->with('error', 'Cannot delete brand with associated devices.');
        }

        $brand->delete();

        return back()->with('success', 'Brand deleted successfully.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:brands,id'],
        ]);

        // Check if any brand has devices
        $brandsWithDevices = Brand::whereIn('id', $validated['ids'])
            ->withCount('devices')
            ->get()
            ->filter(fn($b) => $b->devices_count > 0);

        if ($brandsWithDevices->isNotEmpty()) {
            $names = $brandsWithDevices->pluck('name')->join(', ');
            return back()->with('error', "Cannot delete brands with devices: {$names}");
        }

        $count = Brand::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', "{$count} brand(s) deleted successfully.");
    }

    public function bulkToggle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:brands,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        Brand::whereIn('id', $validated['ids'])->update(['is_active' => $validated['is_active']]);

        $status = $validated['is_active'] ? 'activated' : 'deactivated';

        return back()->with('success', count($validated['ids']) . " brand(s) {$status} successfully.");
    }

    public function toggleActive(Brand $brand): RedirectResponse
    {
        $brand->update(['is_active' => !$brand->is_active]);

        $status = $brand->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Brand {$status} successfully.");
    }
}
