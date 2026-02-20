import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import {
    useAnalytics,
    usePageViewTracking,
    useScrollTracking,
} from '@/lib/analytics';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Check, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    devices_count: number;
}

interface Device {
    id: number;
    name: string;
    slug: string;
    release_year: number | null;
    esim_supported: boolean;
    brand: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Props {
    brands: Brand[];
    devices: Device[];
    userAgent: string;
    meta: {
        title: string;
        description: string;
    };
}

// Main brand tabs to show (others go under "Other")
const MAIN_BRANDS = [
    'Apple',
    'Samsung',
    'Google',
    'Huawei',
    'Oppo',
    'Xiaomi',
    'Sony',
    'Motorola',
    'OnePlus',
];

// Device detection function
function detectUserDevice(userAgent: string, devices: Device[]): Device | null {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();

    // Try to find matching device by model identifiers patterns
    for (const device of devices) {
        const deviceName = device.name.toLowerCase();
        const brandName = device.brand?.name?.toLowerCase() || '';

        // iPhone detection
        if (brandName === 'apple' && ua.includes('iphone')) {
            // Check for specific iPhone models in user agent
            const iphonePatterns: { [key: string]: string[] } = {
                'iphone 17 pro max': ['iphone18,3'],
                'iphone 17 pro': ['iphone18,2'],
                'iphone 17': ['iphone18,1'],
                'iphone air': ['iphone18,4'],
                'iphone 16e': ['iphone17,5'],
                'iphone 16 pro max': ['iphone17,2'],
                'iphone 16 pro': ['iphone17,1'],
                'iphone 16 plus': ['iphone17,4'],
                'iphone 16': ['iphone17,3'],
                'iphone 15 pro max': ['iphone16,2'],
                'iphone 15 pro': ['iphone16,1'],
                'iphone 15 plus': ['iphone15,5'],
                'iphone 15': ['iphone15,4'],
                'iphone 14 pro max': ['iphone15,3'],
                'iphone 14 pro': ['iphone15,2'],
                'iphone 14 plus': ['iphone14,8'],
                'iphone 14': ['iphone14,7'],
                'iphone se (3rd gen)': ['iphone14,6'],
                'iphone 13 pro max': ['iphone14,3'],
                'iphone 13 pro': ['iphone14,2'],
                'iphone 13 mini': ['iphone14,4'],
                'iphone 13': ['iphone14,5'],
                'iphone 12 pro max': ['iphone13,4'],
                'iphone 12 pro': ['iphone13,3'],
                'iphone 12 mini': ['iphone13,1'],
                'iphone 12': ['iphone13,2'],
                'iphone se (2nd gen)': ['iphone12,8'],
                'iphone 11 pro max': ['iphone12,5'],
                'iphone 11 pro': ['iphone12,3'],
                'iphone 11': ['iphone12,1'],
                'iphone xs max': ['iphone11,4', 'iphone11,6'],
                'iphone xs': ['iphone11,2'],
                'iphone xr': ['iphone11,8'],
            };

            for (const [model, patterns] of Object.entries(iphonePatterns)) {
                if (deviceName === model) {
                    for (const pattern of patterns) {
                        if (ua.includes(pattern)) {
                            return device;
                        }
                    }
                }
            }

            // Generic iPhone check - if user has any iPhone, return the first iPhone in the list
            if (device.name.toLowerCase().startsWith('iphone')) {
                continue; // Keep looking for a specific match
            }
        }

        // Pixel detection
        if (brandName === 'google' && ua.includes('pixel')) {
            const pixelMatch = ua.match(
                /pixel\s*(\d+[a-z]?(\s*(pro|xl|fold))*)/i,
            );
            if (pixelMatch) {
                const detectedPixel = pixelMatch[0].toLowerCase().trim();
                if (
                    deviceName
                        .toLowerCase()
                        .includes(detectedPixel.replace('pixel', '').trim())
                ) {
                    return device;
                }
            }
        }

        // Samsung detection
        if (brandName === 'samsung' && ua.includes('samsung')) {
            const samsungPatterns = ['sm-g', 'sm-s', 'sm-f', 'sm-a'];
            for (const pattern of samsungPatterns) {
                if (ua.includes(pattern)) {
                    // Try to match specific model
                    const modelMatch = ua.match(
                        new RegExp(`(${pattern}[0-9]+)`, 'i'),
                    );
                    if (
                        modelMatch &&
                        deviceName.toLowerCase().includes('galaxy')
                    ) {
                        return device;
                    }
                }
            }
        }
    }

    // Check for generic brand matches
    const brandChecks = [
        { brand: 'apple', pattern: 'iphone' },
        { brand: 'google', pattern: 'pixel' },
        { brand: 'samsung', pattern: 'samsung' },
        { brand: 'huawei', pattern: 'huawei' },
        { brand: 'xiaomi', pattern: 'xiaomi' },
        { brand: 'oppo', pattern: 'oppo' },
        { brand: 'oneplus', pattern: 'oneplus' },
        { brand: 'sony', pattern: 'sony' },
        { brand: 'motorola', pattern: 'moto' },
    ];

    for (const check of brandChecks) {
        if (ua.includes(check.pattern)) {
            // Return the first device from this brand as a generic match
            const brandDevice = devices.find(
                (d) => d.brand?.name?.toLowerCase() === check.brand,
            );
            if (brandDevice) {
                return brandDevice;
            }
        }
    }

    return null;
}

export default function DevicesIndex({
    brands,
    devices,
    userAgent,
    meta,
}: Props) {
    const { name } = usePage<SharedData>().props;
    const { trans } = useTrans();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    // Analytics hooks
    const {
        search,
        filterApplied,
        deviceDetected,
        viewItemList,
        selectItem,
        createItem,
    } = useAnalytics();
    usePageViewTracking('devices', 'Compatible Devices');
    useScrollTracking('guide', 'devices-page', 'Compatible Devices');

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTrackedSearch = useRef<string>('');

    const handleDeviceCheck = useCallback(
        (
            deviceName: string,
            brandName: string,
            isDeviceCompatible: boolean,
        ) => {
            deviceDetected(brandName, deviceName, isDeviceCompatible, 'auto');
        },
        [deviceDetected],
    );

    // Detect user's device on mount (for analytics only)
    useEffect(() => {
        const detected = detectUserDevice(userAgent, devices);
        if (detected) {
            handleDeviceCheck(
                detected.name,
                detected.brand?.name || 'Unknown',
                true,
            );
        }
    }, [userAgent, devices, handleDeviceCheck]);

    // Separate main brands and "other" brands
    const mainBrands = brands.filter((b) => MAIN_BRANDS.includes(b.name));
    const otherBrands = brands.filter((b) => !MAIN_BRANDS.includes(b.name));

    // Filter devices
    const filteredDevices = useMemo(() => {
        let result = devices;

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (device) =>
                    device.name.toLowerCase().includes(query) ||
                    device.brand?.name?.toLowerCase().includes(query),
            );
        }

        // Filter by brand
        if (selectedBrand !== 'all') {
            if (selectedBrand === 'other') {
                const otherBrandNames = otherBrands.map((b) =>
                    b.name.toLowerCase(),
                );
                result = result.filter((device) =>
                    otherBrandNames.includes(
                        device.brand?.name?.toLowerCase() || '',
                    ),
                );
            } else {
                result = result.filter(
                    (device) =>
                        device.brand?.name?.toLowerCase() ===
                        selectedBrand.toLowerCase(),
                );
            }
        }

        return result;
    }, [devices, searchQuery, selectedBrand, otherBrands]);

    useEffect(() => {
        if (searchQuery.trim() && searchQuery !== lastTrackedSearch.current) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                search(searchQuery, 'device', filteredDevices.length);
                lastTrackedSearch.current = searchQuery;
            }, 500);
        }
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, filteredDevices.length, search]);

    const lastTrackedListRef = useRef<string>('');
    useEffect(() => {
        const listKey = `${selectedBrand}-${searchQuery}-${filteredDevices.length}`;
        if (
            filteredDevices.length > 0 &&
            listKey !== lastTrackedListRef.current
        ) {
            lastTrackedListRef.current = listKey;
            const itemsToTrack = filteredDevices
                .slice(0, 20)
                .map((device, index) =>
                    createItem({
                        id: device.id.toString(),
                        name: device.name,
                        brand: device.brand?.name,
                        category: 'Device',
                        category2: device.esim_supported
                            ? 'eSIM Compatible'
                            : 'Not Compatible',
                        index,
                    }),
                );
            viewItemList(
                `devices-${selectedBrand}`,
                `Compatible Devices - ${selectedBrand === 'all' ? 'All Brands' : selectedBrand}`,
                itemsToTrack,
            );
        }
    }, [filteredDevices, selectedBrand, searchQuery, viewItemList, createItem]);

    const handleBrandSelect = useCallback(
        (brand: string) => {
            setSelectedBrand(brand);
            filterApplied('brand', brand, 'devices');
        },
        [filterApplied],
    );

    const handleDeviceClick = useCallback(
        (device: Device) => {
            const item = createItem({
                id: device.id.toString(),
                name: device.name,
                brand: device.brand?.name,
                category: 'Device',
                category2: device.esim_supported
                    ? 'eSIM Compatible'
                    : 'Not Compatible',
            });
            selectItem(
                item,
                `devices-${selectedBrand}`,
                `Compatible Devices - ${selectedBrand === 'all' ? 'All Brands' : selectedBrand}`,
            );
        },
        [createItem, selectItem, selectedBrand],
    );

    return (
        <GuestLayout>
            <Head title={`${meta.title} - ${name}`}>
                <meta name="description" content={meta.description} />
            </Head>

            {/* Hero Section with Search */}
            <HeroSection
                badge={trans('devices_page.hero.badge')}
                title={trans('devices_page.hero.title')}
                titleHighlight={trans('devices_page.hero.title_highlight')}
                description={trans('devices_page.description')}
                showSearch
                showStats={false}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={trans('devices_page.search_placeholder')}
            />

            <div className="min-h-screen bg-primary-50">
                {/* Brand Filter Tabs */}
                <section className="container mx-auto px-4 py-8">
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                        <Button
                            variant={
                                selectedBrand === 'all' ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handleBrandSelect('all')}
                            className={
                                selectedBrand === 'all'
                                    ? ''
                                    : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                            }
                        >
                            {trans('devices_page.all_brands')}
                        </Button>
                        {mainBrands.map((brand) => (
                            <Button
                                key={brand.id}
                                variant={
                                    selectedBrand === brand.name
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => handleBrandSelect(brand.name)}
                                className={
                                    selectedBrand === brand.name
                                        ? ''
                                        : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                                }
                            >
                                {brand.name}
                            </Button>
                        ))}
                        {otherBrands.length > 0 && (
                            <Button
                                variant={
                                    selectedBrand === 'other'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => handleBrandSelect('other')}
                                className={
                                    selectedBrand === 'other'
                                        ? ''
                                        : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                                }
                            >
                                {trans('devices_page.other_brands')}
                            </Button>
                        )}
                    </div>
                </section>

                {/* Devices Grid */}
                <section className="container mx-auto px-4 pb-12">
                    {filteredDevices.length === 0 ? (
                        <div className="py-16 text-center">
                            <Smartphone className="mx-auto h-12 w-12 text-primary-300" />
                            <h3 className="mt-4 font-semibold text-primary-900">
                                {trans('devices_page.empty.title')}
                            </h3>
                            <p className="mt-1 text-sm text-primary-600">
                                {searchQuery
                                    ? trans('devices_page.empty.try_different')
                                    : trans('devices_page.empty.no_filter')}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    className="mt-4 border-primary-200 text-primary-700 hover:bg-primary-50"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedBrand('all');
                                    }}
                                >
                                    {trans('devices_page.empty.clear_filters')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="mb-6 text-sm text-primary-600">
                                {filteredDevices.length === 1
                                    ? trans('devices_page.results.showing', {
                                          count: String(filteredDevices.length),
                                      })
                                    : trans(
                                          'devices_page.results.showing_plural',
                                          { count: String(filteredDevices.length) },
                                      )}
                                {searchQuery &&
                                    ` ${trans('devices_page.results.matching', { query: searchQuery })}`}
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {filteredDevices.map((device) => (
                                    <Card
                                        key={device.id}
                                        className="cursor-pointer border-primary-100 bg-white p-4 transition-colors hover:border-primary-300"
                                        onClick={() =>
                                            handleDeviceClick(device)
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-1 text-xs text-primary-500">
                                                    {device.brand?.name}
                                                </p>
                                                <p className="truncate text-sm font-medium text-primary-900">
                                                    {device.name}
                                                </p>
                                                {device.release_year && (
                                                    <p className="mt-1 text-xs text-primary-400">
                                                        {device.release_year}
                                                    </p>
                                                )}
                                            </div>
                                            <Check className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </GuestLayout>
    );
}
