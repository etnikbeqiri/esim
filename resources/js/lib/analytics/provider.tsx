import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import analytics from './service';
import type { AnalyticsConfig, UserProperties } from './types';

interface SharedData {
    auth?: {
        user?: {
            id: number;
            is_admin: boolean;
            is_b2b: boolean;
            has_customer: boolean;
        };
    };
    analyticsConfig?: AnalyticsConfig;
}

interface AnalyticsProviderProps {
    children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
    const { props } = usePage<SharedData>();
    const { analyticsConfig, auth } = props;

    useEffect(() => {
        if (analyticsConfig) {
            analytics.initialize(analyticsConfig);
        }
    }, [analyticsConfig]);

    useEffect(() => {
        if (auth?.user) {
            const userType = auth.user.is_admin
                ? 'admin'
                : auth.user.is_b2b
                  ? 'b2b'
                  : auth.user.has_customer
                    ? 'b2c'
                    : 'guest';

            const userProperties: UserProperties = {
                user_id: String(auth.user.id),
                user_type: userType,
                is_logged_in: true,
            };

            analytics.setUser(userProperties);
        } else {
            analytics.setUser({
                user_type: 'guest',
                is_logged_in: false,
            });
        }
    }, [auth?.user]);

    return <>{children}</>;
}

export default AnalyticsProvider;
