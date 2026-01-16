import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { LogOut, UserCog } from 'lucide-react';
import { useState } from 'react';

export function ImpersonationBanner() {
    const { impersonating } = usePage<SharedData>().props;
    const [loading, setLoading] = useState(false);

    if (!impersonating) {
        return null;
    }

    function handleStopImpersonating() {
        setLoading(true);
        router.post('/stop-impersonating');
    }

    return (
        <div className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-sm text-amber-950">
            <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span className="font-medium">
                    You are currently viewing as another user
                </span>
            </div>
            <Button
                variant="secondary"
                size="sm"
                onClick={handleStopImpersonating}
                disabled={loading}
                className="bg-amber-100 text-amber-950 hover:bg-amber-200"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Return to Admin
            </Button>
        </div>
    );
}
