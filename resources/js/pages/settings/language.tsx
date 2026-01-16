import { Head, useForm, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editLanguage, update } from '@/routes/language';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { FormEventHandler } from 'react';

export default function Language() {
    const { locale, availableLocales } = usePage<SharedData>().props;
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: trans('settings_language.breadcrumb_title'),
            href: editLanguage().url,
        },
    ];

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
            <Head title={trans('settings_language.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={trans('settings_language.info_title')}
                        description={trans(
                            'settings_language.info_description',
                        )}
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <RadioGroup
                            value={data.language}
                            onValueChange={(value) =>
                                setData('language', value)
                            }
                            className="space-y-3"
                        >
                            {availableLocales.map((loc) => (
                                <Label
                                    key={loc.code}
                                    htmlFor={`lang-${loc.code}`}
                                    className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
                                >
                                    <RadioGroupItem
                                        value={loc.code}
                                        id={`lang-${loc.code}`}
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium">
                                            {loc.nativeName}
                                        </span>
                                        <span className="ml-2 text-muted-foreground">
                                            ({loc.name})
                                        </span>
                                    </div>
                                </Label>
                            ))}
                        </RadioGroup>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {trans('settings_language.save_button')}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-muted-foreground">
                                    {trans('settings_language.saved_message')}
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
