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
            },
        );
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={size}
                    className="border-none bg-transparent text-primary-700 shadow-none hover:bg-accent-50 hover:text-accent-800"
                >
                    <Languages className="h-4 w-4" />
                    {showLabel && currentLocale && (
                        <span className="ml-2">{currentLocale.nativeName}</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="border border-primary-200 bg-white shadow-lg"
            >
                {availableLocales.map((loc) => (
                    <DropdownMenuItem
                        key={loc.code}
                        onClick={() => handleLocaleChange(loc.code)}
                        className={
                            locale === loc.code
                                ? 'bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 font-bold text-accent-950 focus:bg-gradient-to-r focus:from-accent-300 focus:via-accent-400 focus:to-accent-300 focus:text-accent-950'
                                : 'text-primary-700 hover:bg-accent-50 hover:text-accent-800 focus:bg-accent-50 focus:text-accent-800'
                        }
                    >
                        <span className="font-medium">{loc.nativeName}</span>
                        <span
                            className={`ml-2 text-xs ${locale === loc.code ? 'text-accent-950' : 'text-primary-400'}`}
                        >
                            ({loc.name})
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
