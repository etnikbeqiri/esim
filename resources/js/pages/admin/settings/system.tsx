import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Check,
    Database,
    Info,
    Loader2,
    Mail,
    Monitor,
    RefreshCw,
    RotateCcw,
    Save,
    Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Setting {
    key: string;
    value: any;
    default: any;
    is_default: boolean;
    type: 'boolean' | 'string' | 'integer' | 'float' | 'array' | 'json';
    group: string;
    label: string;
    description: string;
    encrypted: boolean;
    read_only: boolean;
}

interface SettingsGroup {
    value: string;
    label: string;
    icon: string;
}

interface Props {
    settings: Record<string, Setting[]>;
    groups: SettingsGroup[];
}

const groupIcons: Record<string, any> = {
    emails: Mail,
    analytics: BarChart3,
};

const groupDescriptions: Record<string, string> = {
    emails: 'Configure which email notifications are sent to users',
    analytics: 'Configure Google Analytics and tracking settings',
};

export default function SystemSettings({ settings, groups }: Props) {
    const { trans } = useTrans();
    const [activeGroup, setActiveGroup] = useState(
        groups[0]?.value || 'emails',
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showResetAllDialog, setShowResetAllDialog] = useState(false);
    const [resetKey, setResetKey] = useState<string | null>(null);
    const [isCacheClearing, setIsCacheClearing] = useState(false);
    const [isCacheWarming, setIsCacheWarming] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    // Initialize with all settings
    const initialSettings = useMemo(() => {
        const settingsMap: Record<string, any> = {};
        Object.values(settings)
            .flat()
            .forEach((setting) => {
                settingsMap[setting.key] = setting.value;
            });
        return settingsMap;
    }, [settings]);

    const { data, setData, post, processing, isDirty, reset } = useForm({
        settings: initialSettings,
    });

    // Track which individual settings have changed
    const changedSettings = useMemo(() => {
        const changed: Set<string> = new Set();
        Object.entries(data.settings).forEach(([key, value]) => {
            const original = initialSettings[key];
            if (value !== original) {
                changed.add(key);
            }
        });
        return changed;
    }, [data.settings, initialSettings]);

    const hasChanges = changedSettings.size > 0;

    // Reset form when settings prop changes (after save)
    useEffect(() => {
        setData({ settings: initialSettings });
    }, [settings]);

    // Filter settings based on search
    const filteredSettings = useMemo(() => {
        if (!searchQuery.trim()) {
            return settings;
        }

        const query = searchQuery.toLowerCase();
        const filtered: Record<string, Setting[]> = {};

        Object.entries(settings).forEach(([group, groupSettings]) => {
            const matchingSettings = groupSettings.filter(
                (setting) =>
                    setting.label.toLowerCase().includes(query) ||
                    setting.description.toLowerCase().includes(query) ||
                    setting.key.toLowerCase().includes(query),
            );
            if (matchingSettings.length > 0) {
                filtered[group] = matchingSettings;
            }
        });

        return filtered;
    }, [settings, searchQuery]);

    // Count settings per group (for badges)
    const settingCounts = useMemo(() => {
        const counts: Record<string, { total: number; modified: number }> = {};
        Object.entries(settings).forEach(([group, groupSettings]) => {
            const modified = groupSettings.filter((s) =>
                changedSettings.has(s.key),
            ).length;
            counts[group] = { total: groupSettings.length, modified };
        });
        return counts;
    }, [settings, changedSettings]);

    // Handle form submit
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        post('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Settings saved successfully');
            },
        });
    }

    // Show success toast
    function showToast(message: string) {
        setSuccessMessage(message);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    }

    // Reset single setting to default
    function handleResetSetting(key: string) {
        const setting = Object.values(settings)
            .flat()
            .find((s) => s.key === key);
        if (setting) {
            setData({
                settings: {
                    ...data.settings,
                    [key]: setting.default,
                },
            });
        }
        setResetKey(null);
        setShowResetDialog(false);
    }

    // Reset group to defaults
    function handleResetGroup() {
        const groupSettings = settings[activeGroup];
        if (!groupSettings) return;

        const newSettings = { ...data.settings };
        groupSettings.forEach((setting) => {
            newSettings[setting.key] = setting.default;
        });
        setData({ settings: newSettings });
        setShowResetAllDialog(false);
        showToast(
            `${groups.find((g) => g.value === activeGroup)?.label || 'Group'} reset to defaults`,
        );
    }

    // Cache operations
    async function handleClearCache() {
        setIsCacheClearing(true);
        router.post(
            '/admin/settings/clear-cache',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast('Cache cleared successfully');
                },
                onFinish: () => setIsCacheClearing(false),
            },
        );
    }

    async function handleWarmCache() {
        setIsCacheWarming(true);
        router.post(
            '/admin/settings/warm-cache',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast('Cache warmed successfully');
                },
                onFinish: () => setIsCacheWarming(false),
            },
        );
    }

    // Update a setting value
    const updateSetting = useCallback(
        (key: string, value: any) => {
            setData({
                settings: {
                    ...data.settings,
                    [key]: value,
                },
            });
        },
        [data.settings, setData],
    );

    // Render setting input based on type
    function renderSettingInput(setting: Setting) {
        const isModified = changedSettings.has(setting.key);
        const currentValue = data.settings[setting.key];

        if (setting.read_only) {
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Read Only
                    </Badge>
                    <span className="font-mono text-sm text-muted-foreground">
                        {JSON.stringify(setting.value)}
                    </span>
                </div>
            );
        }

        switch (setting.type) {
            case 'boolean':
                return (
                    <div className="flex items-center gap-3">
                        <Switch
                            id={setting.key}
                            checked={currentValue ?? false}
                            onCheckedChange={(checked) =>
                                updateSetting(setting.key, checked)
                            }
                            disabled={processing}
                        />
                        <Label
                            htmlFor={setting.key}
                            className={cn(
                                'cursor-pointer text-sm',
                                currentValue
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {currentValue ? 'Enabled' : 'Disabled'}
                        </Label>
                    </div>
                );

            case 'integer':
                return (
                    <Input
                        id={setting.key}
                        type="number"
                        value={currentValue ?? ''}
                        onChange={(e) =>
                            updateSetting(
                                setting.key,
                                parseInt(e.target.value) || 0,
                            )
                        }
                        disabled={processing}
                        className={cn('w-32', isModified && 'border-primary')}
                    />
                );

            case 'string':
            default:
                return (
                    <Input
                        id={setting.key}
                        type={setting.encrypted ? 'password' : 'text'}
                        value={currentValue ?? ''}
                        onChange={(e) =>
                            updateSetting(setting.key, e.target.value)
                        }
                        disabled={processing}
                        className={cn(
                            'max-w-md',
                            isModified && 'border-primary',
                        )}
                        placeholder={setting.encrypted ? '••••••••' : undefined}
                    />
                );
        }
    }

    // Render a single setting row
    function renderSetting(setting: Setting) {
        const isModified = changedSettings.has(setting.key);
        const isDefault = data.settings[setting.key] === setting.default;

        return (
            <div
                key={setting.key}
                className={cn(
                    'group relative rounded-lg border p-4 transition-colors',
                    isModified
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50',
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <Label
                                htmlFor={setting.key}
                                className="text-sm leading-none font-medium"
                            >
                                {setting.label}
                            </Label>
                            {isModified && (
                                <Badge
                                    variant="default"
                                    className="h-5 px-1.5 text-[10px]"
                                >
                                    Modified
                                </Badge>
                            )}
                            {!isDefault && !isModified && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 px-1.5 text-[10px]"
                                >
                                    Custom
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {setting.description}
                        </p>
                        {!isDefault && !setting.read_only && (
                            <p className="text-xs text-muted-foreground/70">
                                Default:{' '}
                                <span className="font-mono">
                                    {JSON.stringify(setting.default)}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {renderSettingInput(setting)}

                        {!setting.read_only && !isDefault && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() => {
                                                setResetKey(setting.key);
                                                setShowResetDialog(true);
                                            }}
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Reset to default
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'System Settings', href: '/admin/settings' },
    ];

    const currentGroupSettings = filteredSettings[activeGroup] || [];
    const ActiveIcon = groupIcons[activeGroup] || Monitor;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 shadow-lg">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                            {successMessage}
                        </span>
                    </div>
                </div>
            )}

            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex h-full flex-col"
            >
                {/* Sticky Header with Save Bar */}
                {hasChanges && (
                    <div className="sticky top-0 z-40 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">
                                    You have unsaved changes
                                </span>
                                <Badge variant="secondary">
                                    {changedSettings.size} modified
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => reset()}
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-1">
                    {/* Sidebar Navigation */}
                    <div className="w-64 shrink-0 border-r bg-muted/30">
                        <div className="sticky top-0 flex flex-col gap-1 p-4">
                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search settings..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>

                            {/* Group Navigation */}
                            <nav className="space-y-1">
                                {groups.map((group) => {
                                    const Icon =
                                        groupIcons[group.value] || Monitor;
                                    const counts = settingCounts[group.value];
                                    const isActive =
                                        activeGroup === group.value;
                                    const hasFiltered =
                                        filteredSettings[group.value]?.length >
                                        0;

                                    if (searchQuery && !hasFiltered)
                                        return null;

                                    return (
                                        <button
                                            key={group.value}
                                            type="button"
                                            onClick={() =>
                                                setActiveGroup(group.value)
                                            }
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <span>{group.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {counts?.modified > 0 && (
                                                    <Badge
                                                        variant={
                                                            isActive
                                                                ? 'secondary'
                                                                : 'default'
                                                        }
                                                        className="h-5 min-w-[20px] justify-center px-1.5 text-[10px]"
                                                    >
                                                        {counts.modified}
                                                    </Badge>
                                                )}
                                                <span
                                                    className={cn(
                                                        'text-xs',
                                                        isActive
                                                            ? 'text-primary-foreground/70'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {filteredSettings[
                                                        group.value
                                                    ]?.length || 0}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>

                            <Separator className="my-4" />

                            {/* Cache Management */}
                            <div className="space-y-2">
                                <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Cache
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={handleClearCache}
                                    disabled={isCacheClearing}
                                >
                                    {isCacheClearing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Clear Cache
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={handleWarmCache}
                                    disabled={isCacheWarming}
                                >
                                    {isCacheWarming ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Database className="mr-2 h-4 w-4" />
                                    )}
                                    Warm Cache
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-auto">
                        <div className="mx-auto max-w-4xl p-6">
                            {/* Group Header */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <ActiveIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle>
                                                    {
                                                        groups.find(
                                                            (g) =>
                                                                g.value ===
                                                                activeGroup,
                                                        )?.label
                                                    }
                                                </CardTitle>
                                                <CardDescription>
                                                    {
                                                        groupDescriptions[
                                                            activeGroup
                                                        ]
                                                    }
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setShowResetAllDialog(true)
                                            }
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reset Group
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Settings List */}
                            {currentGroupSettings.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-lg font-medium">
                                            No settings found
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Try adjusting your search query
                                        </p>
                                        {searchQuery && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() =>
                                                    setSearchQuery('')
                                                }
                                            >
                                                Clear search
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {currentGroupSettings.map((setting) =>
                                        renderSetting(setting),
                                    )}
                                </div>
                            )}

                            {/* Bottom Save Button (for non-sticky context) */}
                            {!hasChanges && currentGroupSettings.length > 0 && (
                                <div className="mt-8 flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Info className="h-4 w-4" />
                                        <span>
                                            Make changes above to enable saving
                                        </span>
                                    </div>
                                    <Button type="submit" disabled>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Reset Single Setting Dialog */}
            <AlertDialog
                open={showResetDialog}
                onOpenChange={setShowResetDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reset this setting to its default value.
                            The change won't be saved until you click "Save
                            Changes".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                resetKey && handleResetSetting(resetKey)
                            }
                        >
                            Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Group Dialog */}
            <AlertDialog
                open={showResetAllDialog}
                onOpenChange={setShowResetAllDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Reset All Settings in Group?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reset all settings in "
                            {groups.find((g) => g.value === activeGroup)?.label}
                            " to their default values. The changes won't be
                            saved until you click "Save Changes".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetGroup}>
                            Reset All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
