import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId, setUserProperties, Analytics } from 'firebase/analytics';
import type {
    AnalyticsConfig,
    AnalyticsEvents,
    UserProperties,
    EcommerceItem,
    PageViewParams,
    SearchParams,
    ViewItemListParams,
    ViewItemParams,
    SelectItemParams,
    BeginCheckoutParams,
    AddPaymentInfoParams,
    PurchaseParams,
    FormInteractionParams,
    FilterParams,
    DeviceDetectedParams,
    NetworkCoverageParams,
    InstallationStepParams,
    SupportContactParams,
    ContentEngagementParams,
    ErrorParams,
} from './types';

class AnalyticsService {
    private app: FirebaseApp | null = null;
    private analytics: Analytics | null = null;
    private config: AnalyticsConfig | null = null;
    private initialized = false;
    private queue: Array<() => void> = [];
    private userProperties: UserProperties = {};

    initialize(config: AnalyticsConfig): void {
        if (this.initialized) return;

        this.config = config;

        if (!config.enabled || !config.measurementId) {
            this.log('Analytics disabled or missing measurement ID');
            return;
        }

        try {
            const firebaseConfig = {
                apiKey: config.firebaseApiKey,
                authDomain: `${config.firebaseProjectId}.firebaseapp.com`,
                projectId: config.firebaseProjectId,
                storageBucket: `${config.firebaseProjectId}.firebasestorage.app`,
                appId: config.firebaseAppId,
                measurementId: config.measurementId,
            };

            this.app = initializeApp(firebaseConfig);
            this.analytics = getAnalytics(this.app);
            this.initialized = true;

            this.log('Analytics initialized', firebaseConfig);

            this.processQueue();
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    private log(message: string, data?: unknown): void {
        if (this.config?.debugLogging) {
            console.log(`[Analytics] ${message}`, data ?? '');
        }
    }

    private processQueue(): void {
        while (this.queue.length > 0) {
            const fn = this.queue.shift();
            fn?.();
        }
    }

    private track<K extends keyof AnalyticsEvents>(eventName: K, params: AnalyticsEvents[K]): void {
        const execute = () => {
            if (!this.analytics || !this.config?.enabled) {
                this.log(`Event queued (analytics not ready): ${eventName}`, params);
                return;
            }

            const enrichedParams = {
                ...params,
                timestamp: new Date().toISOString(),
                ...this.userProperties,
            };

            logEvent(this.analytics, eventName as string, enrichedParams as Record<string, unknown>);
            this.log(`Event tracked: ${eventName}`, enrichedParams);
        };

        if (!this.initialized) {
            this.queue.push(execute);
        } else {
            execute();
        }
    }

    setUser(properties: UserProperties): void {
        this.userProperties = { ...this.userProperties, ...properties };

        if (this.analytics && properties.user_id) {
            setUserId(this.analytics, properties.user_id);
            setUserProperties(this.analytics, properties as Record<string, unknown>);
            this.log('User properties set', properties);
        }
    }

    clearUser(): void {
        this.userProperties = {};
        if (this.analytics) {
            setUserId(this.analytics, '');
        }
    }

    pageView(params: PageViewParams): void {
        this.track('page_view', params);
    }

    search(params: SearchParams): void {
        this.track('search', params);
    }

    viewItemList(params: ViewItemListParams): void {
        this.track('view_item_list', params);
    }

    viewItem(params: ViewItemParams): void {
        this.track('view_item', params);
    }

    selectItem(params: SelectItemParams): void {
        this.track('select_item', params);
    }

    beginCheckout(params: BeginCheckoutParams): void {
        this.track('begin_checkout', params);
    }

    addPaymentInfo(params: AddPaymentInfoParams): void {
        this.track('add_payment_info', params);
    }

    purchase(params: PurchaseParams): void {
        this.track('purchase', params);
    }

    formInteraction(params: FormInteractionParams): void {
        this.track('form_interaction', params);
    }

    filterApplied(params: FilterParams): void {
        this.track('filter_applied', params);
    }

    deviceDetected(params: DeviceDetectedParams): void {
        this.track('device_detected', params);
    }

    viewNetworkCoverage(params: NetworkCoverageParams): void {
        this.track('view_network_coverage', params);
    }

    installationStep(params: InstallationStepParams): void {
        this.track('installation_step', params);
    }

    supportContact(params: SupportContactParams): void {
        this.track('support_contact', params);
    }

    contentEngagement(params: ContentEngagementParams): void {
        this.track('content_engagement', params);
    }

    errorOccurred(params: ErrorParams): void {
        this.track('error_occurred', params);
    }

    createItem(data: {
        id: string;
        name: string;
        category?: string;
        category2?: string;
        brand?: string;
        price?: number;
        quantity?: number;
        currency?: string;
        index?: number;
    }): EcommerceItem {
        return {
            item_id: data.id,
            item_name: data.name,
            item_category: data.category,
            item_category2: data.category2,
            item_brand: data.brand,
            price: data.price,
            quantity: data.quantity ?? 1,
            currency: data.currency ?? 'USD',
            index: data.index,
        };
    }
}

export const analytics = new AnalyticsService();
export default analytics;
