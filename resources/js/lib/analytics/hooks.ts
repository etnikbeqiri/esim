import { useCallback, useEffect, useRef } from 'react';
import analytics from './service';
import type {
    ContactMethod,
    ContentEngagementParams,
    EcommerceItem,
    ErrorParams,
    FilterParams,
    PageType,
    PaymentMethod,
    PurchaseParams,
    SearchParams,
    SupportContactParams,
    ViewItemParams,
} from './types';

export function useAnalytics() {
    const pageView = useCallback(
        (pageType: PageType, title: string, extra?: Record<string, string>) => {
            analytics.pageView({
                page_type: pageType,
                page_title: title,
                page_path: window.location.pathname,
                ...extra,
            });
        },
        [],
    );

    const search = useCallback(
        (
            term: string,
            type: SearchParams['search_type'],
            resultsCount?: number,
        ) => {
            analytics.search({
                search_term: term,
                search_type: type,
                results_count: resultsCount,
            });
        },
        [],
    );

    const viewItemList = useCallback(
        (listId: string, listName: string, items: EcommerceItem[]) => {
            analytics.viewItemList({
                item_list_id: listId,
                item_list_name: listName,
                items,
            });
        },
        [],
    );

    const viewItem = useCallback(
        (item: EcommerceItem, extra?: Omit<ViewItemParams, 'item'>) => {
            analytics.viewItem({ item, ...extra });
        },
        [],
    );

    const selectItem = useCallback(
        (item: EcommerceItem, listId?: string, listName?: string) => {
            analytics.selectItem({
                item,
                item_list_id: listId,
                item_list_name: listName,
            });
        },
        [],
    );

    const beginCheckout = useCallback(
        (
            currency: string,
            value: number,
            items: EcommerceItem[],
            coupon?: string,
        ) => {
            analytics.beginCheckout({ currency, value, items, coupon });
        },
        [],
    );

    const addPaymentInfo = useCallback(
        (
            currency: string,
            value: number,
            paymentType: PaymentMethod,
            items: EcommerceItem[],
        ) => {
            analytics.addPaymentInfo({
                currency,
                value,
                payment_type: paymentType,
                items,
            });
        },
        [],
    );

    const purchase = useCallback(
        (
            transactionId: string,
            currency: string,
            value: number,
            items: EcommerceItem[],
            extra?: Partial<PurchaseParams>,
        ) => {
            analytics.purchase({
                transaction_id: transactionId,
                currency,
                value,
                items,
                ...extra,
            });
        },
        [],
    );

    const formStart = useCallback((formId: string, formName: string) => {
        analytics.formInteraction({
            form_id: formId,
            form_name: formName,
            action: 'start',
        });
    }, []);

    const formFieldFocus = useCallback(
        (formId: string, formName: string, fieldName: string) => {
            analytics.formInteraction({
                form_id: formId,
                form_name: formName,
                field_name: fieldName,
                action: 'field_focus',
            });
        },
        [],
    );

    const formFieldComplete = useCallback(
        (formId: string, formName: string, fieldName: string) => {
            analytics.formInteraction({
                form_id: formId,
                form_name: formName,
                field_name: fieldName,
                action: 'field_complete',
            });
        },
        [],
    );

    const formSubmit = useCallback((formId: string, formName: string) => {
        analytics.formInteraction({
            form_id: formId,
            form_name: formName,
            action: 'submit',
        });
    }, []);

    const formError = useCallback(
        (formId: string, formName: string, errorMessage: string) => {
            analytics.formInteraction({
                form_id: formId,
                form_name: formName,
                action: 'error',
                error_message: errorMessage,
            });
        },
        [],
    );

    const filterApplied = useCallback(
        (
            filterType: FilterParams['filter_type'],
            filterValue: string,
            pageType: PageType,
        ) => {
            analytics.filterApplied({
                filter_type: filterType,
                filter_value: filterValue,
                page_type: pageType,
            });
        },
        [],
    );

    const deviceDetected = useCallback(
        (
            brand: string,
            model: string,
            isCompatible: boolean,
            method: 'auto' | 'manual' = 'auto',
        ) => {
            analytics.deviceDetected({
                device_brand: brand,
                device_model: model,
                is_esim_compatible: isCompatible,
                detection_method: method,
            });
        },
        [],
    );

    const viewNetworkCoverage = useCallback(
        (countryCode: string, packageId: string, operatorsCount: number) => {
            analytics.viewNetworkCoverage({
                country_code: countryCode,
                package_id: packageId,
                operators_count: operatorsCount,
            });
        },
        [],
    );

    const installationStep = useCallback(
        (
            step: 1 | 2 | 3 | 4,
            stepName: string,
            orderId: string,
            platform?: 'ios' | 'android',
        ) => {
            analytics.installationStep({
                step_number: step,
                step_name: stepName,
                order_id: orderId,
                platform,
            });
        },
        [],
    );

    const supportContact = useCallback(
        (
            method: ContactMethod,
            sourcePage: PageType,
            extra?: Partial<SupportContactParams>,
        ) => {
            analytics.supportContact({
                contact_method: method,
                source_page: sourcePage,
                ...extra,
            });
        },
        [],
    );

    const contentView = useCallback(
        (
            type: ContentEngagementParams['content_type'],
            id: string,
            title: string,
        ) => {
            analytics.contentEngagement({
                content_type: type,
                content_id: id,
                content_title: title,
                action: 'view',
            });
        },
        [],
    );

    const contentScroll = useCallback(
        (
            type: ContentEngagementParams['content_type'],
            id: string,
            title: string,
            depth: number,
        ) => {
            analytics.contentEngagement({
                content_type: type,
                content_id: id,
                content_title: title,
                action: 'scroll',
                scroll_depth: depth,
            });
        },
        [],
    );

    const contentShare = useCallback(
        (
            type: ContentEngagementParams['content_type'],
            id: string,
            title: string,
            platform: 'twitter' | 'facebook' | 'linkedin' | 'copy',
        ) => {
            analytics.contentEngagement({
                content_type: type,
                content_id: id,
                content_title: title,
                action: 'share',
                share_platform: platform,
            });
        },
        [],
    );

    const trackContentEngagement = useCallback(
        (
            type: ContentEngagementParams['content_type'],
            id: string,
            action: ContentEngagementParams['action'],
            extra?: { question?: string; title?: string },
        ) => {
            analytics.contentEngagement({
                content_type: type,
                content_id: id,
                content_title: extra?.title ?? id,
                action,
                question: extra?.question,
            });
        },
        [],
    );

    const trackError = useCallback(
        (
            errorType: ErrorParams['error_type'],
            message: string,
            pageType: PageType,
            code?: string,
        ) => {
            analytics.errorOccurred({
                error_type: errorType,
                error_message: message,
                page_type: pageType,
                error_code: code,
            });
        },
        [],
    );

    const createItem = useCallback(
        (data: Parameters<typeof analytics.createItem>[0]) => {
            return analytics.createItem(data);
        },
        [],
    );

    return {
        pageView,
        search,
        viewItemList,
        viewItem,
        selectItem,
        beginCheckout,
        addPaymentInfo,
        purchase,
        formStart,
        formFieldFocus,
        formFieldComplete,
        formSubmit,
        formError,
        filterApplied,
        deviceDetected,
        viewNetworkCoverage,
        installationStep,
        supportContact,
        contentView,
        contentScroll,
        contentShare,
        trackContentEngagement,
        trackError,
        createItem,
    };
}

export function usePageViewTracking(
    pageType: PageType,
    title: string,
    extra?: Record<string, string>,
) {
    const tracked = useRef(false);
    const { pageView } = useAnalytics();

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            pageView(pageType, title, extra);
        }
    }, [pageType, title, extra, pageView]);
}

export function useFormTracking(formId: string, formName: string) {
    const {
        formStart,
        formFieldFocus,
        formFieldComplete,
        formSubmit,
        formError,
    } = useAnalytics();
    const started = useRef(false);
    const completedFields = useRef<Set<string>>(new Set());

    const trackStart = useCallback(() => {
        if (!started.current) {
            started.current = true;
            formStart(formId, formName);
        }
    }, [formId, formName, formStart]);

    const trackFocus = useCallback(
        (fieldName: string) => {
            trackStart();
            formFieldFocus(formId, formName, fieldName);
        },
        [formId, formName, formFieldFocus, trackStart],
    );

    const trackComplete = useCallback(
        (fieldName: string) => {
            if (!completedFields.current.has(fieldName)) {
                completedFields.current.add(fieldName);
                formFieldComplete(formId, formName, fieldName);
            }
        },
        [formId, formName, formFieldComplete],
    );

    const trackSubmit = useCallback(() => {
        formSubmit(formId, formName);
    }, [formId, formName, formSubmit]);

    const trackError = useCallback(
        (errorMessage: string) => {
            formError(formId, formName, errorMessage);
        },
        [formId, formName, formError],
    );

    return {
        trackStart,
        trackFocus,
        trackComplete,
        trackSubmit,
        trackError,
    };
}

export function useScrollTracking(
    contentType: ContentEngagementParams['content_type'],
    contentId: string,
    contentTitle: string,
) {
    const { contentScroll } = useAnalytics();
    const trackedDepths = useRef<Set<number>>(new Set());

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            const milestones = [25, 50, 75, 90, 100];

            for (const milestone of milestones) {
                if (
                    scrollPercent >= milestone &&
                    !trackedDepths.current.has(milestone)
                ) {
                    trackedDepths.current.add(milestone);
                    contentScroll(
                        contentType,
                        contentId,
                        contentTitle,
                        milestone,
                    );
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [contentType, contentId, contentTitle, contentScroll]);
}
