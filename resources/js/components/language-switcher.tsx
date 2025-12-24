import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { set } from '@/routes/locale';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showLabel?: boolean;
}

export default function LanguageSwitcher({
    variant = 'ghost',
    size = 'sm',
    showLabel = false,
}: LanguageSwitcherProps) {
    const { locale, availableLocales } = usePage<SharedData>().props;

    const currentLocale = availableLocales.find((l) => l.code === locale);

    const handleLocaleChange = (localeCode: string) => {
        router.post(
            set().url,
            { locale: localeCode },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size}>
                    <Languages className="h-4 w-4" />
                    {showLabel && currentLocale && (
                        <span className="ml-2">{currentLocale.nativeName}</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableLocales.map((loc) => (
                    <DropdownMenuItem
                        key={loc.code}
                        onClick={() => handleLocaleChange(loc.code)}
                        className={locale === loc.code ? 'bg-muted' : ''}
                    >
                        <span className="font-medium">{loc.nativeName}</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                            ({loc.name})
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
