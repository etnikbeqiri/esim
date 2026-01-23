export { default as analytics } from './service';
export { AnalyticsProvider } from './provider';
export { useAnalytics, usePageViewTracking, useFormTracking, useScrollTracking } from './hooks';
export type {
    AnalyticsConfig,
    AnalyticsEvents,
    EcommerceItem,
    UserProperties,
    PageType,
    PaymentMethod,
    ContactMethod,
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
