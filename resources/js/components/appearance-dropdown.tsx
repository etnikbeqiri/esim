import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`${className} pointer-events-none opacity-50`} {...props}>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-md"
                disabled
            >
                <Sun className="h-5 w-5" />
                <span className="sr-only">Theme locked to light mode</span>
            </Button>
        </div>
    );
}
