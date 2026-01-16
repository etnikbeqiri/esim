<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProviderController extends Controller
{
    public function index(Request $request): Response
    {
        $providers = Provider::query()
            ->withCount(['packages', 'syncJobs'])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $providers->getCollection()->transform(fn ($provider) => $provider->makeVisible([
            'api_base_url',
            'rate_limit_ms',
            'markup_percentage',
            'custom_regions',
        ]));

        return Inertia::render('admin/providers/index', [
            'providers' => $providers,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/providers/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:providers,slug',
            'name' => 'required|string|max:255',
            'api_base_url' => 'required|url',
            'api_key' => 'required|string',
            'is_active' => 'boolean',
            'rate_limit_ms' => 'integer|min:0',
            'markup_percentage' => 'numeric|min:0|max:100',
            'custom_regions' => 'nullable|array',
            'custom_regions.*' => 'string|max:255',
        ]);

        Provider::create($validated);

        return redirect()->route('admin.providers.index')
            ->with('success', 'Provider created successfully.');
    }

    public function edit(Provider $provider): Response
    {
        return Inertia::render('admin/providers/edit', [
            'provider' => $provider->makeVisible([
                'api_base_url',
                'rate_limit_ms',
                'markup_percentage',
                'custom_regions',
            ]),
        ]);
    }

    public function update(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:providers,slug,' . $provider->id,
            'name' => 'required|string|max:255',
            'api_base_url' => 'required|url',
            'api_key' => 'nullable|string',
            'is_active' => 'boolean',
            'rate_limit_ms' => 'integer|min:0',
            'markup_percentage' => 'numeric|min:0|max:100',
            'custom_regions' => 'nullable',
        ]);

        // Remove api_key from update data (stored in env, not database)
        unset($validated['api_key']);

        // Handle custom_regions - get directly from request to preserve object structure
        $customRegions = $request->input('custom_regions');
        if (is_array($customRegions) && !empty($customRegions)) {
            $validated['custom_regions'] = $customRegions;
        } else {
            $validated['custom_regions'] = null;
        }

        $provider->update($validated);

        return redirect()->route('admin.providers.index')
            ->with('success', 'Provider updated successfully.');
    }

    public function destroy(Provider $provider)
    {
        $provider->delete();

        return redirect()->route('admin.providers.index')
            ->with('success', 'Provider deleted successfully.');
    }
}
