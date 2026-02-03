import { useCallback, useEffect, useRef, useState } from 'react';

export type SseStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SseOptions {
    /** Auto-reconnect on disconnect (default: true) */
    autoReconnect?: boolean;
    /** Reconnect delay in ms (default: 3000) */
    reconnectDelay?: number;
    /** Max reconnect attempts (default: 5) */
    maxReconnects?: number;
    /** Event handlers by event name */
    onEvent?: Record<string, (data: unknown) => void>;
    /** Connection status change handler */
    onStatusChange?: (status: SseStatus) => void;
    /** Error handler */
    onError?: (error: Event) => void;
}

interface UseSseReturn {
    status: SseStatus;
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
}

/**
 * React hook for Server-Sent Events (SSE) connections.
 *
 * @example
 * ```tsx
 * const { status, isConnected } = useSse('/api/events', {
 *   onEvent: {
 *     'message': (data) => console.log('New message:', data),
 *     'update': (data) => setData(prev => [...prev, data]),
 *   },
 *   onStatusChange: (status) => console.log('SSE status:', status),
 * });
 * ```
 */
export function useSse(
    url: string | null,
    options: SseOptions = {},
): UseSseReturn {
    const {
        autoReconnect = true,
        reconnectDelay = 3000,
        maxReconnects = 5,
        onEvent = {},
        onStatusChange,
        onError,
    } = options;

    const [status, setStatus] = useState<SseStatus>('disconnected');
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateStatus = useCallback(
        (newStatus: SseStatus) => {
            setStatus(newStatus);
            onStatusChange?.(newStatus);
        },
        [onStatusChange],
    );

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        updateStatus('disconnected');
    }, [updateStatus]);

    const connect = useCallback(() => {
        if (!url) return;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        updateStatus('connecting');

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Handle connection open
        eventSource.onopen = () => {
            reconnectAttempts.current = 0;
            updateStatus('connected');
        };

        // Handle errors
        eventSource.onerror = (event) => {
            onError?.(event);

            if (eventSource.readyState === EventSource.CLOSED) {
                updateStatus('disconnected');

                // Attempt reconnection
                if (
                    autoReconnect &&
                    reconnectAttempts.current < maxReconnects
                ) {
                    reconnectAttempts.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectDelay);
                } else if (reconnectAttempts.current >= maxReconnects) {
                    updateStatus('error');
                }
            }
        };

        // Register event handlers
        Object.entries(onEvent).forEach(([eventName, handler]) => {
            eventSource.addEventListener(eventName, (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    handler(data);
                } catch {
                    // If not JSON, pass raw data
                    handler(event.data);
                }
            });
        });

        // Handle timeout event from server
        eventSource.addEventListener('timeout', () => {
            disconnect();
            if (autoReconnect) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 100); // Quick reconnect on server timeout
            }
        });
    }, [
        url,
        autoReconnect,
        reconnectDelay,
        maxReconnects,
        onEvent,
        onError,
        updateStatus,
        disconnect,
    ]);

    // Auto-connect on mount and cleanup on unmount
    useEffect(() => {
        if (url) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        status,
        connect,
        disconnect,
        isConnected: status === 'connected',
    };
}
