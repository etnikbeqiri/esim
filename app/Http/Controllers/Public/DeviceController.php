<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Device;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function index(Request $request): Response
    {
        $brands = Brand::query()
            ->active()
            ->ordered()
            ->withCount(['devices' => fn($q) => $q->active()->esimSupported()])
            ->get();

        $devices = Device::query()
            ->active()
            ->esimSupported()
            ->with('brand:id,name,slug')
            ->orderBy('brand_id')
            ->orderByDesc('release_year')
            ->orderBy('name')
            ->get();

        return Inertia::render('public/devices/index', [
            'brands' => $brands,
            'devices' => $devices,
            'userAgent' => $request->userAgent(),
            'meta' => [
                'title' => 'eSIM Compatible Devices - Check Your Phone',
                'description' => 'Check if your phone supports eSIM. Browse our complete list of eSIM compatible devices from Apple, Samsung, Google, and more.',
            ],
        ]);
    }
}
