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
        $brands = Brand::query()
            ->withCount('devices')
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->ordered()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
            'filters' => $request->only('search'),
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

    public function toggleActive(Brand $brand): RedirectResponse
    {
        $brand->update(['is_active' => !$brand->is_active]);

        $status = $brand->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Brand {$status} successfully.");
    }
}
