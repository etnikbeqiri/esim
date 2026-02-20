export interface AnalyticsConfig {
    enabled: boolean;
    measurementId: string;
    firebaseApiKey: string;
    firebaseProjectId: string;
    firebaseAppId: string;
    debugLogging: boolean;
}

export interface EcommerceItem {
    id?: string;
    item_id: string;
    name?: string;
    item_name: string;
    item_category?: string;
    item_category2?: string;
    item_brand?: string;
    variant?: string;
    price?: number;
    quantity?: number;
    currency?: string;
    index?: number;
}

export interface UserProperties {
    user_id?: string;
    user_type?: 'guest' | 'b2c' | 'b2b' | 'admin';
    customer_id?: string;
    is_logged_in?: boolean;
}

export type PageType =
    | 'home'
    | 'destinations'
    | 'country'
    | 'package'
    | 'checkout'
    | 'checkout_success'
    | 'order_status'
    | 'blog'
    | 'blog_post'
    | 'blog_article'
    | 'how_it_works'
    | 'faq'
    | 'help'
    | 'devices'
    | 'tickets'
    | 'ticket_detail'
    | 'terms'
    | 'privacy'
    | 'refund';

export type PaymentMethod = 'stripe' | 'payrexx' | 'paysera' | 'balance';

export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'ticket';

export interface PageViewParams {
    page_type: PageType;
    page_title: string;
    page_path: string;
    country_code?: string;
    package_id?: string;
    order_id?: string;
    article_slug?: string;
}

export interface SearchParams {
    search_term: string;
    search_type: 'destination' | 'package' | 'device' | 'blog' | 'faq';
    results_count?: number;
}

export interface ViewItemListParams {
    item_list_id: string;
    item_list_name: string;
    items: EcommerceItem[];
}

export interface ViewItemParams {
    item: EcommerceItem;
    country_code?: string;
    validity_days?: number;
    data_gb?: number;
}

export interface SelectItemParams {
    item_list_id?: string;
    item_list_name?: string;
    item: EcommerceItem;
}

export interface BeginCheckoutParams {
    currency: string;
    value: number;
    items: EcommerceItem[];
    coupon?: string;
}

export interface AddPaymentInfoParams {
    currency: string;
    value: number;
    payment_type: PaymentMethod;
    items: EcommerceItem[];
}

export interface PurchaseParams {
    transaction_id: string;
    currency: string;
    value: number;
    items: EcommerceItem[];
    payment_type?: PaymentMethod;
    coupon?: string;
    tax?: number;
}

export interface FormInteractionParams {
    form_id: string;
    form_name: string;
    field_name?: string;
    field_value?: string;
    action: 'start' | 'field_focus' | 'field_complete' | 'submit' | 'error';
    error_message?: string;
}

export interface FilterParams {
    filter_type: 'region' | 'sort' | 'brand' | 'data' | 'data_size' | 'duration' | 'validity' | 'price' | 'featured';
    filter_value: string;
    page_type: PageType;
}

export interface DeviceDetectedParams {
    device_brand: string;
    device_model: string;
    is_esim_compatible: boolean;
    detection_method: 'auto' | 'manual';
}

export interface NetworkCoverageParams {
    country_code: string;
    package_id: string;
    operators_count: number;
}

export interface InstallationStepParams {
    step_number: 1 | 2 | 3 | 4;
    step_name: string;
    order_id: string;
    platform?: 'ios' | 'android';
}

export interface SupportContactParams {
    contact_method: ContactMethod;
    source_page: PageType;
    ticket_priority?: 'low' | 'medium' | 'high' | 'urgent';
    ticket_subject?: string;
}

export interface ContentEngagementParams {
    content_type: 'article' | 'blog' | 'faq' | 'help' | 'guide' | 'esim_activation';
    content_id: string;
    content_title: string;
    action: 'view' | 'scroll' | 'share' | 'copy_link' | 'expand' | 'collapse';
    scroll_depth?: number;
    share_platform?: 'twitter' | 'facebook' | 'linkedin' | 'copy';
    question?: string;
}

export interface ErrorParams {
    error_type: 'form' | 'payment' | 'network' | 'validation';
    error_code?: string;
    error_message: string;
    page_type: PageType;
}

export interface AnalyticsEvents {
    page_view: PageViewParams;
    search: SearchParams;
    view_item_list: ViewItemListParams;
    view_item: ViewItemParams;
    select_item: SelectItemParams;
    begin_checkout: BeginCheckoutParams;
    add_payment_info: AddPaymentInfoParams;
    purchase: PurchaseParams;
    form_interaction: FormInteractionParams;
    filter_applied: FilterParams;
    device_detected: DeviceDetectedParams;
    view_network_coverage: NetworkCoverageParams;
    installation_step: InstallationStepParams;
    support_contact: SupportContactParams;
    content_engagement: ContentEngagementParams;
    error_occurred: ErrorParams;
}
