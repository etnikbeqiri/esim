import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export function useTrans() {
    const { props } = usePage<any>();

    // We'll need to pass the translations from the backend to the frontend
    // via Inertia shared props. For now, this is a placeholder.
    const translations = props.translations || {};

    const trans = useCallback(
        (key: string, replace: Record<string, string> = {}) => {
            let translation = key
                .split('.')
                .reduce((t, i) => t?.[i] || null, translations);

            if (!translation) {
                return key;
            }

            Object.keys(replace).forEach((key) => {
                translation = translation.replace(`:${key}`, replace[key]);
            });

            return translation;
        },
        [translations],
    );

    return { trans };
}
