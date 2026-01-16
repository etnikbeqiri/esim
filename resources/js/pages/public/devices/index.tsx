import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeroSection } from '@/components/hero-section';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Check, Smartphone, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
const MAIN_BRANDS = ['Apple', 'Samsung', 'Google', 'Huawei', 'Oppo', 'Xiaomi', 'Sony', 'Motorola', 'OnePlus'];

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
            const pixelMatch = ua.match(/pixel\s*(\d+[a-z]?(\s*(pro|xl|fold))*)/i);
            if (pixelMatch) {
                const detectedPixel = pixelMatch[0].toLowerCase().trim();
                if (deviceName.toLowerCase().includes(detectedPixel.replace('pixel', '').trim())) {
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
                    const modelMatch = ua.match(new RegExp(`(${pattern}[0-9]+)`, 'i'));
                    if (modelMatch && deviceName.toLowerCase().includes('galaxy')) {
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
                (d) => d.brand?.name?.toLowerCase() === check.brand
            );
            if (brandDevice) {
                return brandDevice;
            }
        }
    }

    return null;
}

export default function DevicesIndex({ brands, devices, userAgent, meta }: Props) {
    const { name } = usePage<SharedData>().props;
    const { trans } = useTrans();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [detectedDevice, setDetectedDevice] = useState<Device | null>(null);
    const [showDetectionAlert, setShowDetectionAlert] = useState(false);
    const [isCompatible, setIsCompatible] = useState<boolean | null>(null);

    // Detect user's device on mount
    useEffect(() => {
        const detected = detectUserDevice(userAgent, devices);
        if (detected) {
            setDetectedDevice(detected);
            setIsCompatible(true);
            setShowDetectionAlert(true);
        } else if (userAgent && (userAgent.toLowerCase().includes('mobile') || userAgent.toLowerCase().includes('android'))) {
            // Mobile device detected but not in our list
            setIsCompatible(false);
            setShowDetectionAlert(true);
        }
    }, [userAgent, devices]);

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
                    device.brand?.name?.toLowerCase().includes(query)
            );
        }

        // Filter by brand
        if (selectedBrand !== 'all') {
            if (selectedBrand === 'other') {
                const otherBrandNames = otherBrands.map((b) => b.name.toLowerCase());
                result = result.filter((device) =>
                    otherBrandNames.includes(device.brand?.name?.toLowerCase() || '')
                );
            } else {
                result = result.filter(
                    (device) => device.brand?.name?.toLowerCase() === selectedBrand.toLowerCase()
                );
            }
        }

        return result;
    }, [devices, searchQuery, selectedBrand, otherBrands]);

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
                {/* Detection Alert */}
                {showDetectionAlert && (
                    <div className="container mx-auto px-4 -mt-6 mb-6 relative z-20">
                        <Alert
                            className={`relative ${
                                isCompatible
                                    ? 'border-green-500/50 bg-green-50'
                                    : 'border-amber-500/50 bg-amber-50'
                            }`}
                        >
                            {isCompatible ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Smartphone className="h-4 w-4 text-amber-600" />
                            )}
                            <AlertTitle className={isCompatible ? 'text-green-700' : 'text-amber-700'}>
                                {isCompatible ? trans('devices_page.detection.supported_title') : trans('devices_page.detection.not_recognized_title')}
                            </AlertTitle>
                            <AlertDescription className={isCompatible ? 'text-green-600' : 'text-amber-600'}>
                                {isCompatible && detectedDevice ? (
                                    trans('devices_page.detection.supported_description', {
                                        device: `${detectedDevice.brand?.name} ${detectedDevice.name}`,
                                    })
                                ) : (
                                    trans('devices_page.detection.not_recognized_description')
                                )}
                            </AlertDescription>
                            <button
                                onClick={() => setShowDetectionAlert(false)}
                                className="absolute right-2 top-2 p-1 rounded hover:bg-primary-100"
                            >
                                <X className="h-4 w-4 text-primary-500" />
                            </button>
                        </Alert>
                    </div>
                )}

                {/* Brand Filter Tabs */}
                <section className="container mx-auto px-4 py-8">
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <Button
                            variant={selectedBrand === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedBrand('all')}
                            className={selectedBrand === 'all' ? '' : 'border-primary-200 text-primary-700 hover:bg-primary-50'}
                        >
                            {trans('devices_page.all_brands')}
                        </Button>
                        {mainBrands.map((brand) => (
                            <Button
                                key={brand.id}
                                variant={selectedBrand === brand.name ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedBrand(brand.name)}
                                className={selectedBrand === brand.name ? '' : 'border-primary-200 text-primary-700 hover:bg-primary-50'}
                            >
                                {brand.name}
                            </Button>
                        ))}
                        {otherBrands.length > 0 && (
                            <Button
                                variant={selectedBrand === 'other' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedBrand('other')}
                                className={selectedBrand === 'other' ? '' : 'border-primary-200 text-primary-700 hover:bg-primary-50'}
                            >
                                {trans('devices_page.other_brands')}
                            </Button>
                        )}
                    </div>
                </section>

                {/* Devices Grid */}
                <section className="container mx-auto px-4 pb-12">
                    {filteredDevices.length === 0 ? (
                        <div className="text-center py-16">
                            <Smartphone className="mx-auto h-12 w-12 text-primary-300" />
                            <h3 className="mt-4 font-semibold text-primary-900">{trans('devices_page.empty.title')}</h3>
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
                            <p className="text-sm text-primary-600 mb-6">
                                {filteredDevices.length === 1
                                    ? trans('devices_page.results.showing', { count: filteredDevices.length })
                                    : trans('devices_page.results.showing_plural', { count: filteredDevices.length })}
                                {searchQuery && ` ${trans('devices_page.results.matching', { query: searchQuery })}`}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredDevices.map((device) => (
                                    <Card
                                        key={device.id}
                                        className="p-4 bg-white border-primary-100 hover:border-primary-300 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-primary-500 mb-1">
                                                    {device.brand?.name}
                                                </p>
                                                <p className="font-medium text-sm text-primary-900 truncate">
                                                    {device.name}
                                                </p>
                                                {device.release_year && (
                                                    <p className="text-xs text-primary-400 mt-1">
                                                        {device.release_year}
                                                    </p>
                                                )}
                                            </div>
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
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
