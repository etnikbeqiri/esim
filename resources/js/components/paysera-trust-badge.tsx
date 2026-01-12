import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface PayseraTrustBadgeProps {
    projectId?: string;
    lang?: string;
}

export function PayseraTrustBadge({
    projectId = '254863',
    lang = 'en',
}: PayseraTrustBadgeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);
    const { payment } = usePage<SharedData>().props;

    // Check if Paysera is in the active providers list
    const isEnabled = payment?.providers?.some(p => p.id === 'paysera') ?? false;

    useEffect(() => {
        // Only load script if Paysera is enabled and not already loaded
        if (!isEnabled || scriptLoadedRef.current) {
            return;
        }

        const loadPayseraBadge = () => {
            // Create script element
            const script = document.createElement('script');
            const dateToday = new Date();
            const todayFullDate =
                dateToday.getDate() +
                '-' +
                (dateToday.getMonth() + 1) +
                '-' +
                dateToday.getFullYear();

            script.src =
                'https://bank.paysera.com/js/compiled/quality-sign.js?v=' +
                todayFullDate;
            script.setAttribute('data-paysera-project-id', projectId);
            script.setAttribute('data-lang', lang);
            script.async = true;
            script.charset = 'utf-8';
            script.type = 'text/javascript';

            // Append to head
            document.head.appendChild(script);
            scriptLoadedRef.current = true;

            // Cleanup
            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
                scriptLoadedRef.current = false;
            };
        };

        loadPayseraBadge();
    }, [isEnabled, projectId, lang]);

    // Don't render anything if Paysera is not enabled
    if (!isEnabled) {
        return null;
    }

    // The Paysera badge is automatically injected to the body by their script
    // We don't need to render anything in our container, but we keep it for reference
    return <div ref={containerRef} id="paysera-trust-badge-container" />;
}
