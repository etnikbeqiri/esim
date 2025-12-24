import { Head, useForm, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editLanguage, update } from '@/routes/language';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Language settings',
        href: editLanguage().url,
    },
];

export default function Language() {
    const { locale, availableLocales } = usePage<SharedData>().props;

    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        language: locale,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(update().url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Language settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Language settings"
                        description="Choose your preferred language for the interface"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <RadioGroup
                            value={data.language}
                            onValueChange={(value) => setData('language', value)}
                            className="space-y-3"
                        >
                            {availableLocales.map((loc) => (
                                <Label
                                    key={loc.code}
                                    htmlFor={`lang-${loc.code}`}
                                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary"
                                >
                                    <RadioGroupItem value={loc.code} id={`lang-${loc.code}`} />
                                    <div className="flex-1">
                                        <span className="font-medium">{loc.nativeName}</span>
                                        <span className="ml-2 text-muted-foreground">
                                            ({loc.name})
                                        </span>
                                    </div>
                                </Label>
                            ))}
                        </RadioGroup>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-muted-foreground">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
