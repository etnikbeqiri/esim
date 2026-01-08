import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-lg bg-neutral-100 p-1 opacity-50 pointer-events-none',
                className,
            )}
            {...props}
        >
            <button
                disabled
                className="flex items-center rounded-md px-3.5 py-1.5 bg-white shadow-xs text-neutral-900 cursor-not-allowed"
            >
                <Sun className="-ml-1 h-4 w-4" />
                <span className="ml-1.5 text-sm">Light (Locked)</span>
            </button>
        </div>
    );
}
